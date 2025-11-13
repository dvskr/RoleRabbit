const crypto = require('crypto');
const path = require('path');
const { DOMMatrix, Path2D, ImageData } = require('canvas');

if (typeof global.DOMMatrix === 'undefined' && DOMMatrix) {
  global.DOMMatrix = DOMMatrix;
}
if (typeof global.Path2D === 'undefined' && Path2D) {
  global.Path2D = Path2D;
}
if (typeof global.ImageData === 'undefined' && ImageData) {
  global.ImageData = ImageData;
}

const fs = require('fs');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { jsonrepair } = require('jsonrepair');

const logger = require('../utils/logger');
const { prisma } = require('../utils/db');
const { generateText } = require('../utils/openAI');
const cacheManager = require('../utils/cacheManager');
const { CACHE_NAMESPACES } = require('../utils/cacheKeys');
const cacheConfig = require('../config/cacheConfig');
const { resumeParseDuration, resumeParseFailures } = require('../observability/metrics');
const { normalizeResumeData } = require('@roleready/resume-normalizer');

const CACHE_TTL_MS = cacheConfig.resumeParseTtlMs;
const VISION_PLACEHOLDER_REGEX = /absolute_path_to_your_google_vision_service_account\.json/i;

let visionClient = null;
let visionEnabled = null; // null = unknown, true = enabled, false = disabled
let visionDisabledReason = null;

function markVisionDisabled(reason) {
  if (visionEnabled === false && visionDisabledReason === reason) {
    return;
  }
  visionEnabled = false;
  visionDisabledReason = reason;
  logger.info('Google Vision OCR disabled for this process. Falling back to text extraction only.', {
    reason
  });
}

function isVisionOcrAvailable() {
  if (visionEnabled === false) {
    return false;
  }

  if (visionEnabled === true && visionClient) {
    return true;
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credentialsPath && credentialsPath.trim()) {
    const trimmed = credentialsPath.trim();
    if (!trimmed || VISION_PLACEHOLDER_REGEX.test(trimmed)) {
      markVisionDisabled('GOOGLE_APPLICATION_CREDENTIALS is using the placeholder path.');
      return false;
    }
    try {
      const stats = fs.statSync(trimmed);
      if (!stats.isFile()) {
        markVisionDisabled('GOOGLE_APPLICATION_CREDENTIALS path is not a file.');
        return false;
      }
    } catch (error) {
      markVisionDisabled(`GOOGLE_APPLICATION_CREDENTIALS file not found: ${error.message}`);
      return false;
    }
  }

  visionEnabled = true;
  return true;
}

function getVisionClient() {
  if (!isVisionOcrAvailable()) {
    return null;
  }

  if (visionClient) {
    return visionClient;
  }

  try {
    visionClient = new ImageAnnotatorClient();
    return visionClient;
  } catch (error) {
    markVisionDisabled(error.message || 'Failed to initialize Google Vision client.');
    logger.warn('Google Vision client not available. OCR features disabled until credentials are configured.', {
      error: error.message
    });
    return null;
  }
}

function computeFileHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function extractDocxText(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return value || '';
}

async function extractPdfText(buffer) {
  const result = await pdfParse(buffer);
  return result.text || '';
}

async function extractOcrText(buffer) {
  const client = getVisionClient();
  if (!client) {
    const suffix = visionDisabledReason ? ` (${visionDisabledReason})` : '';
    throw new Error(
      `OCR service not configured${suffix ? `: ${suffix}` : ''}. Please set GOOGLE_APPLICATION_CREDENTIALS to enable scanned resume parsing.`
    );
  }

  try {
    const [result] = await client.documentTextDetection({
      image: { content: buffer }
    });

    const annotation = result.fullTextAnnotation;
    return annotation?.text || '';
  } catch (error) {
    const message = error?.message || 'Unknown OCR error';
    if (
      /ENOENT/.test(message) ||
      /credential/i.test(message) ||
      /permission/i.test(message) ||
      /Authentication failed/i.test(message)
    ) {
      markVisionDisabled(message);
    }
    throw error;
  }
}

function inferMimeType(fileName, providedMime) {
  if (providedMime) return providedMime;
  const ext = path.extname(fileName || '').toLowerCase();
  switch (ext) {
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.pdf':
      return 'application/pdf';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_REGEX = /(?:\+?[(]?\d[\d\s().\-A-Za-z#]{6,}\d)/g;
const LINKEDIN_REGEX = /(https?:\/\/(?:www\.)?(?:linkedin\.com\/in|lnkd\.in\/)[^\s]+)/gi;
const GITHUB_REGEX = /(https?:\/\/(?:www\.)?github\.com\/[^\s]+)/gi;
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

function sanitizeCapturedUrl(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  const sanitized = trimmed.replace(/[)\],.;]+$/, '');
  if (!sanitized) {
    return '';
  }
  if (sanitized.startsWith('www.')) {
    return `https://${sanitized}`;
  }
  return sanitized;
}

function normalizePhoneCandidate(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  const digits = trimmed.replace(/[^\d]/g, '');
  if (digits.length < 10 || digits.length > 18) {
    return '';
  }
  return trimmed.replace(/\s+/g, ' ');
}

function extractContactDetailsFromText(text = '') {
  if (!text || typeof text !== 'string') {
    return { links: [] };
  }

  const result = { links: [] };
  const linkSet = new Set();

  const addLink = (raw, field) => {
    const url = sanitizeCapturedUrl(raw);
    if (!url) {
      return;
    }
    const key = url.toLowerCase();
    if (field && !result[field]) {
      result[field] = url;
    }
    if (!linkSet.has(key)) {
      linkSet.add(key);
      result.links.push(url);
    }
  };

  const emailMatch = text.match(EMAIL_REGEX);
  if (emailMatch && emailMatch.length > 0) {
    result.email = emailMatch[0].trim();
  }

  let phoneMatch;
  PHONE_REGEX.lastIndex = 0;
  // Capture the first phone-like sequence with a reasonable digit count
  while ((phoneMatch = PHONE_REGEX.exec(text))) {
    const normalized = normalizePhoneCandidate(phoneMatch[0]);
    if (normalized) {
      result.phone = normalized;
      break;
    }
  }

  let linkMatch;
  LINKEDIN_REGEX.lastIndex = 0;
  while ((linkMatch = LINKEDIN_REGEX.exec(text))) {
    addLink(linkMatch[1], 'linkedin');
  }

  GITHUB_REGEX.lastIndex = 0;
  while ((linkMatch = GITHUB_REGEX.exec(text))) {
    addLink(linkMatch[1], 'github');
  }

  URL_REGEX.lastIndex = 0;
  while ((linkMatch = URL_REGEX.exec(text))) {
    const candidate = linkMatch[0];
    if (/linkedin\.com|lnkd\.in|github\.com/i.test(candidate)) {
      continue;
    }
    addLink(candidate, result.website ? null : 'website');
  }

  if (!result.links.length) {
    delete result.links;
  }

  return result;
}

function normalizeStructuredResume(structuredResume, rawText) {
  const base = structuredResume && typeof structuredResume === 'object' ? { ...structuredResume } : {};
  const fallback = extractContactDetailsFromText(rawText);

  const contactBase = base.contact && typeof base.contact === 'object' ? base.contact : {};
  const mergedContact = { ...fallback, ...contactBase };

  const linkCandidates = [];
  if (Array.isArray(fallback.links)) {
    linkCandidates.push(...fallback.links);
  }
  if (Array.isArray(contactBase.links)) {
    linkCandidates.push(...contactBase.links);
  }

  if (linkCandidates.length) {
    const uniqueLinks = [];
    const seen = new Set();
    linkCandidates.forEach((link) => {
      const sanitized = sanitizeCapturedUrl(link);
      if (!sanitized) {
        return;
      }
      const key = sanitized.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLinks.push(sanitized);
      }
    });

    if (uniqueLinks.length) {
      const linkedinKey = mergedContact.linkedin ? sanitizeCapturedUrl(mergedContact.linkedin).toLowerCase() : null;
      const githubKey = mergedContact.github ? sanitizeCapturedUrl(mergedContact.github).toLowerCase() : null;

      const filteredLinks = uniqueLinks.filter((link) => {
        const key = link.toLowerCase();
        if (linkedinKey && /(linkedin\.com|lnkd\.in)/.test(key)) {
          return key === linkedinKey;
        }
        if (githubKey && key.includes('github.com')) {
          return key === githubKey;
        }
        return true;
      });

      const contactSeen = new Set(
        ['linkedin', 'github', 'website']
          .map((field) => (mergedContact[field] ? sanitizeCapturedUrl(mergedContact[field]).toLowerCase() : null))
          .filter(Boolean)
      );

      const finalLinks = [];
      filteredLinks.forEach((link) => {
        const key = link.toLowerCase();
        if (contactSeen.has(key)) {
          return;
        }
        contactSeen.add(key);
        finalLinks.push(link);
      });

      if (finalLinks.length) {
        mergedContact.links = finalLinks;
      } else {
        delete mergedContact.links;
      }
    } else {
      delete mergedContact.links;
    }
  }

  const mergedResume = {
    ...base,
    contact: mergedContact
  };

  ['name', 'title', 'email', 'phone', 'location', 'linkedin', 'github', 'website'].forEach((field) => {
    const contactValue = mergedContact[field];
    const resumeValue = mergedResume[field];

    if (resumeValue) {
      mergedContact[field] = resumeValue;
      return;
    }

    if (contactValue) {
      mergedResume[field] = contactValue;
      return;
    }

    if (fallback[field]) {
      mergedResume[field] = fallback[field];
      mergedContact[field] = fallback[field];
    }
  });

  const normalized = normalizeResumeData(mergedResume);

  const ensureContactProps = (target) => {
    if (!target || typeof target !== 'object') {
      return;
    }
    const contact = target.contact && typeof target.contact === 'object' ? target.contact : {};
    const normalizedContact = { ...contact };

    ['email', 'phone', 'linkedin', 'github', 'website'].forEach((field) => {
      if (normalized[field] && !normalizedContact[field]) {
        normalizedContact[field] = normalized[field];
      }
    });

    if (!Array.isArray(normalizedContact.links)) {
      normalizedContact.links = [];
    }

    target.contact = normalizedContact;
  };

  ensureContactProps(normalized);

  return normalized;
}

function hasMeaningfulValue(value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function mergeLinkArrays(existing = [], incoming = []) {
  const merged = [];
  const seen = new Set();

  [...existing, ...incoming].forEach((link) => {
    const sanitized = sanitizeCapturedUrl(link);
    if (!sanitized) {
      return;
    }
    const key = sanitized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(sanitized);
    }
  });

  return merged;
}

function buildContactExtractionPrompt(rawText) {
  const truncated = rawText.length > 6000 ? `${rawText.slice(0, 6000)}…` : rawText;
  return `Extract all available contact information from the resume text below.
Return ONLY valid JSON with this shape:
{
  "name": string | null,
  "title": string | null,
  "email": string | null,
  "phone": string | null,
  "location": string | null,
  "linkedin": string | null,
  "github": string | null,
  "website": string | null,
  "links": string[]
}

Rules:
- Prefer exact values from the text; do not invent data.
- Normalize URLs to include https:// when missing.
- If a field is absent, set it to null (or [] for links).
- Include every additional contact/social link you can find inside the links array.

Resume Text:
${truncated}`;
}

async function extractContactWithAI(rawText) {
  const prompt = buildContactExtractionPrompt(rawText);

  try {
    const jsonResponse = await generateText(
      prompt,
      {
        model: 'gpt-4o-mini',
        temperature: 0,
        max_tokens: 800
      },
      {
        response_format: { type: 'json_object' }
      }
    );
    if (jsonResponse?.text) {
      return JSON.parse(jsonResponse.text);
    }
  } catch (jsonError) {
    logger.warn('AI contact extraction JSON-mode failed', { error: jsonError.message });
  }

  try {
    const { text } = await generateText(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 1000
    });
    const parsed = cleanseJsonResponse(text);
    if (parsed) {
      return parsed;
    }
  } catch (fallbackError) {
    logger.warn('AI contact extraction fallback failed', { error: fallbackError.message });
  }

  return null;
}

async function ensureContactDetails(resume, rawText) {
  if (!resume || typeof resume !== 'object') {
    return resume;
  }

  const regexFallback = extractContactDetailsFromText(rawText);
  const neededFields = ['name', 'title', 'email', 'phone', 'location', 'linkedin', 'github', 'website'];

  const hasAllFields = neededFields.every((field) => hasMeaningfulValue(resume[field]));
  const contactLinksPresent = Array.isArray(resume?.contact?.links) && resume.contact.links.length > 0;

  const sources = [regexFallback];
  if (!hasAllFields || !contactLinksPresent) {
    const aiContact = await extractContactWithAI(rawText);
    if (aiContact && typeof aiContact === 'object') {
      sources.push(aiContact);
    }
  }

  const merged = { ...resume };
  const contact = { ...(merged.contact || {}) };
  let combinedLinks = Array.isArray(merged.links) ? merged.links.slice() : [];

  const mergeSource = (source) => {
    if (!source || typeof source !== 'object') {
      return;
    }
    neededFields.forEach((field) => {
      const value = source[field];
      if (!hasMeaningfulValue(merged[field]) && hasMeaningfulValue(value)) {
        merged[field] = value;
      }
      if (!hasMeaningfulValue(contact[field]) && hasMeaningfulValue(value)) {
        contact[field] = value;
      }
    });

    if (Array.isArray(source.links) && source.links.length) {
      combinedLinks = mergeLinkArrays(combinedLinks, source.links);
    }
  };

  sources.forEach(mergeSource);

  if (combinedLinks.length) {
    contact.links = combinedLinks.slice();
  }

  merged.contact = contact;

  const normalized = normalizeResumeData(merged) || {};
  normalized.contact = normalized.contact && typeof normalized.contact === 'object' ? normalized.contact : {};

  neededFields.forEach((field) => {
    const existing = normalized.contact[field];
    if (hasMeaningfulValue(existing)) {
      normalized[field] = existing;
    } else {
      const fallbackValue = contact[field] ?? regexFallback[field];
      if (hasMeaningfulValue(fallbackValue)) {
        normalized[field] = fallbackValue;
        normalized.contact[field] = fallbackValue;
      } else if (normalized[field] !== undefined && !hasMeaningfulValue(normalized[field])) {
        delete normalized[field];
      }
    }
  });

  const normalizedLinks = mergeLinkArrays(
    Array.isArray(normalized.contact.links) ? normalized.contact.links : [],
    combinedLinks
  );

  if (normalizedLinks.length) {
    normalized.contact.links = normalizedLinks.slice();
    normalized.links = normalizedLinks.slice();
  } else {
    delete normalized.contact.links;
    delete normalized.links;
  }

  return normalized;
}

function contactDetailsMissing(structuredResume) {
  if (!structuredResume || typeof structuredResume !== 'object') {
    return true;
  }
  const contact = structuredResume.contact;
  if (!contact || typeof contact !== 'object') {
    return true;
  }
  const fields = ['email', 'phone', 'linkedin', 'github', 'website', 'name', 'location'];
  const hasField = fields.some((field) => hasMeaningfulValue(contact[field]));
  const hasLinks = Array.isArray(contact.links) && contact.links.length > 0;
  return !(hasField || hasLinks);
}

async function detectDocumentType(buffer, mimeType) {
  // Primary by mime type
  if (mimeType && mimeType.includes('wordprocessingml')) {
    return { type: 'DOCX', method: 'TEXT_ONLY' };
  }

  if (mimeType === 'application/pdf') {
    try {
      const result = await pdfParse(buffer.slice(0, 200000));
      const textLength = (result.text || '').trim().length;
      const textSample = (result.text || '').substring(0, 500);
      
      // Check if extracted text is actually PDF structure garbage
      const isPdfStructureGarbage = 
        textSample.includes('/Type /StructElem') ||
        textSample.includes('endobj') ||
        textSample.includes('/K [') ||
        textSample.match(/^\d{10} \d{5} n/m) || // Cross-reference table pattern
        textSample.match(/<<\s*\/[A-Z]/); // PDF dictionary objects
      
      if (isPdfStructureGarbage) {
        logger.warn('PDF text extraction returned structure data instead of content - forcing OCR fallback');
        return {
          type: 'PDF_STRUCTURE_ISSUE',
          method: isVisionOcrAvailable() ? 'OCR_VISION' : 'TEXT_ONLY'
        };
      }
      
      if (textLength > 120) {
        return { type: 'PDF_NATIVE', method: 'TEXT_ONLY' };
      }
      return {
        type: 'PDF_SCANNED',
        method: isVisionOcrAvailable() ? 'OCR_VISION' : 'TEXT_ONLY'
      };
    } catch (error) {
      logger.warn('PDF detection fallback to OCR due to parse error', { error: error.message });
      return {
        type: 'PDF_SCANNED',
        method: isVisionOcrAvailable() ? 'OCR_VISION' : 'TEXT_ONLY'
      };
    }
  }

  if (mimeType && mimeType.startsWith('image/')) {
    return {
      type: 'IMAGE',
      method: isVisionOcrAvailable() ? 'OCR_VISION' : 'TEXT_ONLY'
    };
  }

  // Heuristics when mime is unknown or incorrect (octet-stream, missing extension, etc.)
  try {
    const header4 = buffer.slice(0, 4).toString('utf8');
    if (header4.startsWith('%PDF')) {
      // Native PDF signature
      try {
        const result = await pdfParse(buffer.slice(0, 200000));
        const textLength = (result.text || '').trim().length;
        return textLength > 120
          ? { type: 'PDF_NATIVE', method: 'TEXT_ONLY' }
          : {
              type: 'PDF_SCANNED',
              method: isVisionOcrAvailable() ? 'OCR_VISION' : 'TEXT_ONLY'
            };
      } catch {
        return {
          type: 'PDF_SCANNED',
          method: isVisionOcrAvailable() ? 'OCR_VISION' : 'TEXT_ONLY'
        };
      }
    }
    // ZIP signature (PK) → likely DOCX
    if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
      return { type: 'DOCX', method: 'TEXT_ONLY' };
    }
  } catch (e) {
    // ignore heuristic errors
  }

  return { type: 'UNKNOWN', method: 'TEXT_ONLY' };
}

function cleanseJsonResponse(text) {
  if (!text) return null;

  const trimmed = text.trim();

  // Handle responses wrapped in Markdown code fences
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]+?)```/i);
  const candidate = codeBlockMatch ? codeBlockMatch[1].trim() : trimmed;

  const jsonStart = candidate.indexOf('{');
  const jsonEnd = candidate.lastIndexOf('}');
  const fragments = [];
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    fragments.push(candidate.slice(jsonStart, jsonEnd + 1));
  }
  if (codeBlockMatch) {
    fragments.push(candidate); // fallback to entire code block contents
  }
  fragments.push(trimmed); // absolute fallback, even if no braces detected

  const errors = [];

  for (const fragment of fragments) {
    try {
      return JSON.parse(fragment);
    } catch (parseError) {
      try {
        const repaired = jsonrepair(fragment);
        if (repaired) {
          return JSON.parse(repaired);
        }
      } catch (repairError) {
        errors.push({
          fragmentPreview: fragment.slice(0, 200),
          parseError: parseError.message,
          repairError: repairError.message
        });
        continue;
      }
    }
  }

  logger.error('Failed to parse JSON from AI response', {
    attempts: errors
  });
  return null;
}

function computeConfidence(method, textLength) {
  if (method === 'TEXT_ONLY') {
    return textLength > 400 ? 0.99 : 0.95;
  }
  return textLength > 400 ? 0.97 : 0.9;
}

function buildParsingPrompt(rawText) {
  return `You are an expert resume parsing system. Convert the provided resume text into structured JSON.
Return ONLY JSON matching this schema:
{
  "summary": string,
  "experience": [
    {
      "company": string,
      "role": string,
      "startDate": string | null,
      "endDate": string | null,
      "isCurrent": boolean,
      "location": string | null,
      "bullets": string[]
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string | null,
      "field": string | null,
      "startDate": string | null,
      "endDate": string | null,
      "location": string | null,
      "bullets": string[]
    }
  ],
  "skills": {
    "technical": string[],
    "tools": string[],
    "soft": string[]
  },
  "projects": [
    {
      "name": string,
      "summary": string | null,
      "bullets": string[],
      "technologies": string[]
    }
  ],
  "certifications": [
    {
      "name": string,
      "issuer": string | null,
      "issueDate": string | null,
      "expirationDate": string | null
    }
  ],
  "contact": {
    "name": string | null,
    "title": string | null,
    "email": string | null,
    "phone": string | null,
    "location": string | null,
    "links": string[]
  }
}
- Dates MUST be ISO strings (YYYY-MM or YYYY-MM-DD) when present.
- Do not invent details not found in the resume.
- Place unknown fields as null and ensure arrays exist even when empty.

Resume Text:
${rawText}`;
}

/**
 * Clean PDF extraction artifacts and junk from text
 * PDFs often extract with embedded fonts, metadata, and binary junk
 */
function cleanPdfJunk(text) {
  if (!text) return text;

  // Remove common PDF artifacts
  let cleaned = text
    // Remove font encoding declarations
    .replace(/\/F\d+\s+\d+\s+Tf/g, '')
    // Remove PDF operators (BT, ET, Tm, Td, etc.)
    .replace(/\b(BT|ET|Tm|Td|TD|Tj|TJ|Tc|Tw|Tz|TL|Tf|Tr|Ts)\b/g, '')
    // Remove hex strings
    .replace(/<[0-9A-Fa-f\s]+>/g, '')
    // Remove excessive whitespace but preserve paragraph breaks
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{4,}/g, '\n\n\n')
    // Remove lines that are mostly non-alphanumeric (likely PDF junk)
    .split('\n')
    .filter(line => {
      const alphanumeric = line.replace(/[^a-zA-Z0-9]/g, '').length;
      const total = line.length;
      // Keep lines that are at least 30% alphanumeric, or are very short (like dates)
      return total === 0 || alphanumeric / total > 0.3 || total < 20;
    })
    .join('\n')
    .trim();

  return cleaned;
}

/**
 * Intelligently truncate resume text to avoid OpenAI token limits
 * OpenAI's gpt-4o-mini has a 200K TPM limit, and we're sending ~4x the text as tokens
 * So we limit to 100K characters to be safe (roughly 25K tokens + prompt overhead)
 */
function truncateResumeText(text, maxChars = 100000) {
  if (!text || text.length <= maxChars) {
    return text;
  }

  const originalLength = text.length;
  logger.warn(`Resume text too large (${text.length} chars). Truncating to ${maxChars} chars.`);

  // For very large extractions (>300K), likely has junk at beginning or end
  // Try to find where actual resume content starts
  if (originalLength > 300000) {
    // Look for common resume indicators in different sections
    const indicators = [
      /\b(experience|education|skills|summary|profile|objective)\b/i,
      /\b(email|phone|linkedin|github)\b/i,
      /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i, // Email pattern
      /\b\d{4}\s*[-–]\s*(present|\d{4})\b/i // Date ranges
    ];

    // Sample different parts of the text
    const sampleSize = 5000;
    const samples = [
      { text: text.substring(0, sampleSize), position: 'start' },
      { text: text.substring(Math.floor(originalLength / 3), Math.floor(originalLength / 3) + sampleSize), position: 'middle' },
      { text: text.substring(originalLength - sampleSize), position: 'end' }
    ];

    // Score each sample
    let bestSample = samples[0];
    let bestScore = 0;

    for (const sample of samples) {
      let score = 0;
      for (const indicator of indicators) {
        if (indicator.test(sample.text)) {
          score++;
        }
      }
      // Also score based on alphanumeric density
      const alphanumeric = sample.text.replace(/[^a-zA-Z0-9]/g, '').length;
      const density = alphanumeric / sample.text.length;
      score += density * 2; // Weight density highly

      if (score > bestScore) {
        bestScore = score;
        bestSample = sample;
      }
    }

    // If content seems to be in the middle or end, extract from there
    if (bestSample.position === 'middle') {
      const startPos = Math.max(0, Math.floor(originalLength / 3) - 10000);
      text = text.substring(startPos, startPos + maxChars + 10000);
      logger.info(`Content appears to be in middle of extraction, adjusting start position`);
    } else if (bestSample.position === 'end') {
      text = text.substring(Math.max(0, originalLength - maxChars - 10000));
      logger.info(`Content appears to be at end of extraction, extracting from end`);
    }
  }

  // Now truncate to maxChars
  let truncated = text.substring(0, maxChars);
  
  // Find the last complete paragraph (double newline)
  const lastParagraph = truncated.lastIndexOf('\n\n');
  if (lastParagraph > maxChars * 0.8) {
    // Only use paragraph boundary if it's not too far back (within last 20%)
    truncated = truncated.substring(0, lastParagraph);
  } else {
    // Otherwise, find the last sentence
    const lastSentence = Math.max(
      truncated.lastIndexOf('. '),
      truncated.lastIndexOf('.\n'),
      truncated.lastIndexOf('!\n'),
      truncated.lastIndexOf('?\n')
    );
    if (lastSentence > maxChars * 0.9) {
      truncated = truncated.substring(0, lastSentence + 1);
    }
  }

  return truncated.trim();
}

async function structureResumeWithAI(rawText) {
  // Truncate text to avoid OpenAI token limits
  const truncatedText = truncateResumeText(rawText);
  const prompt = buildParsingPrompt(truncatedText);

  const runRequest = async (options = {}, extra = {}) => {
    const response = await generateText(
      prompt,
      {
        model: 'gpt-4o-mini',
        temperature: 0.1,
        max_tokens: 2000,
        ...options
      },
      extra
    );
    return response?.text ?? '';
  };

  const attempts = [
    async () => {
      const text = await runRequest();
      const parsed = cleanseJsonResponse(text);
      if (parsed) return parsed;
      throw new Error('Primary parsing returned empty JSON');
    },
    async () => {
      logger.warn('Primary AI parsing returned unreadable JSON. Retrying with JSON mode.');
      const text = await runRequest(
        {
          temperature: 0.0,
          max_tokens: 2000
        },
        {
          response_format: { type: 'json_object' }
        }
      );
      if (text) {
        return JSON.parse(text);
      }
      throw new Error('JSON-mode retry yielded empty response');
    },
    async () => {
      logger.warn('Retrying resume parsing with contact extraction emphasis.');
      const enrichedPrompt = `${prompt}

When contact information (email, phone, LinkedIn, GitHub, website) is missing or unclear, infer it conservatively from the resume text. Populate the contact object with best-effort values even if they are approximate, and include any extra contact links you can deduce.`;
      const { text } = await generateText(
        enrichedPrompt,
        {
          model: 'gpt-4o-mini',
          temperature: 0.2,
          max_tokens: 2200
        }
      );
      const parsed = cleanseJsonResponse(text);
      if (parsed) return parsed;
      throw new Error('Contact-enriched retry failed to produce JSON');
    }
  ];

  const errors = [];

  for (const attempt of attempts) {
    try {
      const parsed = await attempt();
      if (
        !parsed?.contact ||
        Object.values(parsed.contact).every(
          (value) =>
            value == null ||
            (typeof value === 'string' && value.trim().length === 0) ||
            (Array.isArray(value) && value.length === 0)
        )
      ) {
        logger.warn('AI parsing yielded empty contact information');
      }
      return parsed;
    } catch (attemptError) {
      errors.push(attemptError?.message || String(attemptError));
      logger.warn('AI resume parsing attempt failed', { reason: attemptError?.message });
    }
  }

  logger.error('All AI resume parsing attempts failed', { errors });
  throw new Error('Unable to parse structured resume JSON from AI response');
}

async function cacheParsedResume({
  fileHash,
  userId,
  baseResumeId,
  method,
  data,
  confidence
}) {
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
  await prisma.resumeCache.upsert({
    where: { fileHash },
    update: {
      method,
      data,
      confidence,
      hitCount: { increment: 1 },
      lastUsedAt: new Date(),
      expiresAt
    },
    create: {
      fileHash,
      userId,
      baseResumeId,
      method,
      data,
      confidence,
      expiresAt
    }
  });

  const payload = {
    method,
    confidence,
    structuredResume: data
  };
  await cacheManager.set(CACHE_NAMESPACES.RESUME_PARSE, fileHash, payload, {
    ttl: cacheConfig.resumeParseTtlMs
  });
}

async function parseResumeBuffer({ userId, buffer, fileName, mimeType }) {
  if (!buffer || !buffer.length) {
    throw new Error('Resume file buffer is empty');
  }

  const inferredMime = inferMimeType(fileName, mimeType || '');
  const fileHash = computeFileHash(buffer);
  const endTimer = resumeParseDuration.startTimer({
    source: inferredMime,
    method: 'UNKNOWN'
  });

  try {
    const cachedMemory = await cacheManager.get(CACHE_NAMESPACES.RESUME_PARSE, fileHash);
    if (cachedMemory) {
      prisma.resumeCache.update({
        where: { fileHash },
        data: {
          hitCount: { increment: 1 },
          lastUsedAt: new Date()
        }
      }).catch((error) => {
        logger.warn('Failed to update resume cache metadata after in-memory hit', { error: error.message });
      });

      if (!contactDetailsMissing(cachedMemory.structuredResume)) {
        logger.info('Resume parse served from in-memory cache', { userId, fileHash, method: cachedMemory.method });
        return {
          cacheHit: true,
          fileHash,
          method: cachedMemory.method,
          confidence: cachedMemory.confidence,
          structuredResume: cachedMemory.structuredResume
        };
      }

      logger.info('In-memory cache missing contact details. Re-parsing.', { userId, fileHash });
    }

    const cached = await prisma.resumeCache.findUnique({ where: { fileHash } });
    if (cached) {
      await prisma.resumeCache.update({
        where: { fileHash },
        data: {
          hitCount: { increment: 1 },
          lastUsedAt: new Date()
        }
      });

      const payload = {
        method: cached.method,
        confidence: cached.confidence,
        structuredResume: cached.data
      };

      await cacheManager.set(CACHE_NAMESPACES.RESUME_PARSE, fileHash, payload, {
        ttl: cacheConfig.resumeParseTtlMs
      });

      if (!contactDetailsMissing(cached.data)) {
        logger.info('Resume parse served from persistent cache', { userId, fileHash, method: cached.method });
        return {
          cacheHit: true,
          fileHash,
          method: cached.method,
          confidence: cached.confidence,
          structuredResume: cached.data
        };
      }

      logger.info('Persistent cache missing contact details. Re-parsing.', { userId, fileHash });
    }

    const detection = await detectDocumentType(buffer, inferredMime);
    let rawText = '';

    // Handle PDFs with structure issues
    if (detection.type === 'PDF_STRUCTURE_ISSUE') {
      if (detection.method === 'TEXT_ONLY') {
        // OCR not available, but PDF text extraction is broken
        const error = new Error('This PDF has a problematic structure that prevents text extraction. Please try:\n1. Converting the PDF to DOCX format\n2. Saving the PDF with a different tool\n3. Enabling Google Vision OCR for better PDF support');
        error.code = 'PDF_STRUCTURE_ISSUE';
        throw error;
      }
      // else: Will use OCR below
    }

    if (detection.method === 'TEXT_ONLY') {
      if (detection.type === 'DOCX') {
        rawText = await extractDocxText(buffer);
      } else if (detection.type === 'PDF_NATIVE') {
        rawText = await extractPdfText(buffer);
      } else {
        rawText = buffer.toString('utf8');
      }
    } else {
      try {
        rawText = await extractOcrText(buffer);
      } catch (ocrError) {
        logger.warn('OCR extraction failed, attempting text-only fallback', {
          userId,
          fileName,
          mimeType,
          error: ocrError.message
        });

        let fallbackText = '';
        try {
          fallbackText = await extractPdfText(buffer);
        } catch (fallbackError) {
          logger.warn('Fallback PDF text extraction failed after OCR error', {
            userId,
            fileName,
            mimeType,
            error: fallbackError.message
          });
        }

        if (!fallbackText?.trim()) {
          // Preserve the original error context for upstream handling
          throw ocrError;
        }

        rawText = fallbackText;
      }
    }

    let normalizedText = (rawText || '').trim();
    if (!normalizedText) {
      throw new Error('Unable to extract text from resume file');
    }

    // Log extracted text length for debugging
    if (normalizedText.length > 200000) {
      logger.warn('Unusually large text extracted from resume', {
        userId,
        fileName,
        extractedLength: normalizedText.length,
        bufferSize: buffer.length,
        detection: detection.type
      });
      
      // Clean PDF junk for large extractions
      const cleanedText = cleanPdfJunk(normalizedText);
      const reductionPercent = Math.round((1 - cleanedText.length / normalizedText.length) * 100);
      
      if (cleanedText.length < normalizedText.length * 0.95) {
        logger.info('PDF junk cleaning reduced text size', {
          originalLength: normalizedText.length,
          cleanedLength: cleanedText.length,
          reduction: `${reductionPercent}%`
        });
        normalizedText = cleanedText;
      }
    }

    // Debug: Log sample of extracted text to diagnose parsing issues
    if (normalizedText.length > 10000) {
      const sampleStart = normalizedText.substring(0, 500);
      const sampleMiddle = normalizedText.substring(Math.floor(normalizedText.length / 2), Math.floor(normalizedText.length / 2) + 500);
      const sampleEnd = normalizedText.substring(normalizedText.length - 500);
      
      logger.info('DEBUG: Extracted text samples', {
        textLength: normalizedText.length,
        sampleStart: sampleStart.substring(0, 200),
        sampleMiddle: sampleMiddle.substring(0, 200),
        sampleEnd: sampleEnd.substring(0, 200)
      });
    }

    const structuredResume = await structureResumeWithAI(normalizedText);
    let normalizedResume = normalizeStructuredResume(structuredResume, normalizedText);
    normalizedResume = await ensureContactDetails(normalizedResume, normalizedText);
    const confidence = computeConfidence(detection.method, normalizedText.length);

    await cacheParsedResume({
      fileHash,
      userId,
      baseResumeId: null,
      method: detection.method,
      data: normalizedResume,
      confidence
    });

    logger.info('Resume parsed successfully', {
      userId,
      fileHash,
      method: detection.method,
      textLength: normalizedText.length,
      confidence
    });

    endTimer({ method: detection.method, source: inferredMime });

    return {
      cacheHit: false,
      fileHash,
      method: detection.method,
      confidence,
      structuredResume: normalizedResume
    };
  } catch (error) {
    endTimer({ method: 'ERROR', source: inferredMime });
    resumeParseFailures.inc({
      method: inferredMime,
      source: fileName ? path.extname(fileName).toLowerCase() || 'unknown' : 'unknown',
      reason: error.message || 'unknown'
    });
    logger.error('Resume parsing failed', { userId, fileName, mimeType, error: error.message });
    throw error;
  }
}

/**
 * Parse resume by fileHash (from cache or storage file)
 * Used for lazy parsing when resume is activated
 */
async function parseResumeByFileHash({ userId, fileHash, storageFileId }) {
  if (!fileHash && !storageFileId) {
    throw new Error('Either fileHash or storageFileId is required for parsing');
  }

  // If we have fileHash, check cache first
  if (fileHash) {
    const cached = await prisma.resumeCache.findUnique({ where: { fileHash } });
    if (cached) {
      logger.info('Resume parse served from cache by fileHash', { userId, fileHash });
      return {
        cacheHit: true,
        fileHash,
        method: cached.method,
        confidence: cached.confidence,
        structuredResume: cached.data
      };
    }
  }

  // Need to fetch file from storage
  if (!storageFileId) {
    throw new Error('storageFileId is required to fetch file for parsing');
  }

  const storageFile = await prisma.storageFile.findFirst({
    where: { id: storageFileId, userId },
    select: { storagePath: true, contentType: true, fileName: true, fileHash: true }
  });

  if (!storageFile) {
    throw new Error('Storage file not found');
  }

  // Read file from storage
  const storageHandler = require('../utils/storageHandler');
  const buffer = await storageHandler.downloadAsBuffer(storageFile.storagePath);

  // Parse the buffer
  const result = await parseResumeBuffer({
    userId,
    buffer,
    fileName: storageFile.fileName,
    mimeType: storageFile.contentType
  });

  return result;
}

module.exports = {
  detectDocumentType,
  parseResumeBuffer,
  extractContactDetailsFromText,
  normalizeStructuredResume,
  parseResumeByFileHash
};

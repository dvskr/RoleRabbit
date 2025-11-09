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

const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { ImageAnnotatorClient } = require('@google-cloud/vision');

const logger = require('../utils/logger');
const { prisma } = require('../utils/db');
const { generateText } = require('../utils/openAI');
const cacheManager = require('../utils/cacheManager');
const { CACHE_NAMESPACES } = require('../utils/cacheKeys');
const cacheConfig = require('../config/cacheConfig');
const { resumeParseDuration, resumeParseFailures } = require('../observability/metrics');

const CACHE_TTL_MS = cacheConfig.resumeParseTtlMs;

let visionClient = null;

function getVisionClient() {
  if (visionClient) return visionClient;
  try {
    visionClient = new ImageAnnotatorClient();
    return visionClient;
  } catch (error) {
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
    throw new Error('OCR service not configured. Please set GOOGLE_APPLICATION_CREDENTIALS to enable scanned resume parsing.');
  }

  const [result] = await client.documentTextDetection({
    image: { content: buffer }
  });

  const annotation = result.fullTextAnnotation;
  return annotation?.text || '';
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

async function detectDocumentType(buffer, mimeType) {
  if (mimeType.includes('wordprocessingml')) {
    return { type: 'DOCX', method: 'TEXT_ONLY' };
  }

  if (mimeType === 'application/pdf') {
    try {
      const result = await pdfParse(buffer.slice(0, 200000));
      const textLength = (result.text || '').trim().length;
      if (textLength > 120) {
        return { type: 'PDF_NATIVE', method: 'TEXT_ONLY' };
      }
      return { type: 'PDF_SCANNED', method: 'OCR_VISION' };
    } catch (error) {
      logger.warn('PDF detection fallback to OCR due to parse error', { error: error.message });
      return { type: 'PDF_SCANNED', method: 'OCR_VISION' };
    }
  }

  if (mimeType.startsWith('image/')) {
    return { type: 'IMAGE', method: 'OCR_VISION' };
  }

  return { type: 'UNKNOWN', method: 'TEXT_ONLY' };
}

function cleanseJsonResponse(text) {
  if (!text) return null;
  const trimmed = text.trim();
  const jsonStart = trimmed.indexOf('{');
  const jsonEnd = trimmed.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    return null;
  }
  const jsonText = trimmed.slice(jsonStart, jsonEnd + 1);
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    logger.error('Failed to parse JSON from AI response', { error: error.message });
    return null;
  }
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

async function structureResumeWithAI(rawText, userId) {
  const prompt = buildParsingPrompt(rawText);
  const { text } = await generateText(prompt, {
    model: 'gpt-4o-mini',
    temperature: 0.1,
    max_tokens: 1500
  });
  const parsed = cleanseJsonResponse(text);
  if (!parsed) {
    throw new Error('Unable to parse structured resume JSON from AI response');
  }
  return parsed;
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

      logger.info('Resume parse served from in-memory cache', { userId, fileHash, method: cachedMemory.method });
      return {
        cacheHit: true,
        fileHash,
        method: cachedMemory.method,
        confidence: cachedMemory.confidence,
        structuredResume: cachedMemory.structuredResume
      };
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

      logger.info('Resume parse served from persistent cache', { userId, fileHash, method: cached.method });
      return {
        cacheHit: true,
        fileHash,
        method: cached.method,
        confidence: cached.confidence,
        structuredResume: cached.data
      };
    }

    const detection = await detectDocumentType(buffer, inferredMime);
    let rawText = '';

    if (detection.method === 'TEXT_ONLY') {
      if (detection.type === 'DOCX') {
        rawText = await extractDocxText(buffer);
      } else if (detection.type === 'PDF_NATIVE') {
        rawText = await extractPdfText(buffer);
      } else {
        rawText = buffer.toString('utf8');
      }
    } else {
      rawText = await extractOcrText(buffer);
    }

    const normalizedText = (rawText || '').trim();
    if (!normalizedText) {
      throw new Error('Unable to extract text from resume file');
    }

    const structuredResume = await structureResumeWithAI(normalizedText, userId);
    const confidence = computeConfidence(detection.method, normalizedText.length);

    await cacheParsedResume({
      fileHash,
      userId,
      baseResumeId: null,
      method: detection.method,
      data: structuredResume,
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
      structuredResume
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

module.exports = {
  detectDocumentType,
  parseResumeBuffer
};

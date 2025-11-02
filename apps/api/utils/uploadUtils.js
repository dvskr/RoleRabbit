const path = require('path');

class UploadValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UploadValidationError';
  }
}

const ALLOWED_TYPES = new Set([
  'resume',
  'template',
  'backup',
  'cover_letter',
  'transcript',
  'certification',
  'reference',
  'portfolio',
  'work_sample',
  'document'
]);

const MAX_DISPLAY_NAME_LENGTH = Number(process.env.MAX_STORAGE_FILENAME_LENGTH || 255);
const MAX_DESCRIPTION_LENGTH = Number(process.env.MAX_STORAGE_DESCRIPTION_LENGTH || 1024);
const MAX_TAGS = Number(process.env.MAX_STORAGE_TAGS || 20);
const MAX_TAG_LENGTH = Number(process.env.MAX_STORAGE_TAG_LENGTH || 50);

function sanitizeFilename(originalName) {
  if (!originalName || typeof originalName !== 'string') {
    return 'untitled';
  }

  const baseName = originalName.trim().slice(0, 255);
  const sanitized = baseName.replace(/[^A-Za-z0-9._\-()\s]/g, '_');
  return sanitized.length > 0 ? sanitized : 'untitled';
}

function toBoolean(value, defaultValue = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return defaultValue;
}

function parseTags(rawTags) {
  if (rawTags === undefined || rawTags === null) {
    return undefined;
  }

  let tags;

  if (Array.isArray(rawTags)) {
    tags = rawTags;
  } else if (typeof rawTags === 'string') {
    const trimmed = rawTags.trim();
    if (!trimmed) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        tags = parsed;
      } else {
        tags = trimmed.split(',');
      }
    } catch (error) {
      tags = trimmed.split(',');
    }
  } else {
    return undefined;
  }

  const normalized = tags
    .map(tag => (typeof tag === 'string' ? tag.trim() : ''))
    .filter(Boolean)
    .map(tag => tag.slice(0, MAX_TAG_LENGTH));

  if (normalized.length === 0) {
    return undefined;
  }

  if (normalized.length > MAX_TAGS) {
    throw new UploadValidationError(`Too many tags provided. Maximum allowed is ${MAX_TAGS}.`);
  }

  return Array.from(new Set(normalized));
}

function ensureDisplayName(displayName) {
  const normalized = (displayName || '').trim();
  if (!normalized) {
    throw new UploadValidationError('A display name is required for the uploaded file.');
  }
  if (normalized.length > MAX_DISPLAY_NAME_LENGTH) {
    throw new UploadValidationError(`Display name is too long. Maximum length is ${MAX_DISPLAY_NAME_LENGTH} characters.`);
  }
  return normalized;
}

function determineFileType(rawType, fallback = 'document') {
  if (typeof rawType === 'string') {
    const normalized = rawType.trim().toLowerCase();
    if (ALLOWED_TYPES.has(normalized)) {
      return normalized;
    }
  }
  return fallback;
}

function extractFieldValue(fields, key) {
  if (!fields || typeof fields !== 'object') return undefined;
  const field = fields[key];
  if (!field) return undefined;
  if (Array.isArray(field)) {
    return field[0]?.value ?? field[0];
  }
  if (typeof field === 'object' && field !== null && 'value' in field) {
    return field.value;
  }
  return field;
}

function parseUploadFields(fields, { defaultDisplayName, defaultType = 'document', defaultFolderId = null } = {}) {
  const rawDisplayName = extractFieldValue(fields, 'displayName') ?? defaultDisplayName;
  const rawType = extractFieldValue(fields, 'type') ?? defaultType;
  const rawTags = extractFieldValue(fields, 'tags');
  const rawDescription = extractFieldValue(fields, 'description');
  const rawFolderId = extractFieldValue(fields, 'folderId') ?? defaultFolderId;
  const rawIsPublic = extractFieldValue(fields, 'isPublic');

  const displayName = ensureDisplayName(rawDisplayName);
  const type = determineFileType(rawType, defaultType);
  const tags = parseTags(rawTags);

  let description;
  if (typeof rawDescription === 'string') {
    const trimmed = rawDescription.trim();
    if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
      throw new UploadValidationError(`Description is too long. Maximum length is ${MAX_DESCRIPTION_LENGTH} characters.`);
    }
    description = trimmed || undefined;
  }

  let folderId;
  if (typeof rawFolderId === 'string') {
    const normalizedFolder = rawFolderId.trim();
    if (normalizedFolder && normalizedFolder.toLowerCase() !== 'null') {
      folderId = normalizedFolder;
    }
  }

  const isPublic = toBoolean(rawIsPublic, false);

  return {
    displayName,
    type,
    tags,
    description,
    folderId,
    isPublic
  };
}

function deriveDisplayNameFromFilename(filename) {
  const sanitized = sanitizeFilename(filename);
  const basename = path.basename(sanitized, path.extname(sanitized));
  return ensureDisplayName(basename);
}

module.exports = {
  UploadValidationError,
  sanitizeFilename,
  parseUploadFields,
  deriveDisplayNameFromFilename,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_TAGS,
  MAX_TAG_LENGTH
};



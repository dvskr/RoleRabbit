const PLACEHOLDER_VALUES = new Set([
  'your name',
  'name',
  'title',
  'job title',
  'position',
  'role',
  'email',
  'your email',
  'phone',
  'your phone',
  'location',
  'your location'
]);

const BULLET_SPLIT_REGEX = /[\r\n•·]+/;

let fallbackCounter = 0;

const sanitizeString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/\s+/g, ' ').trim();
};

const sanitizeField = (value) => {
  const cleaned = sanitizeString(value);
  if (!cleaned) return undefined;
  if (PLACEHOLDER_VALUES.has(cleaned.toLowerCase())) {
    return undefined;
  }
  return cleaned;
};

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'object') {
    const numericKeys = Object.keys(value)
      .filter((key) => /^\d+$/.test(key))
      .sort((a, b) => Number(a) - Number(b));
    if (numericKeys.length) {
      return numericKeys.map((key) => value[key]);
    }
    return Object.values(value);
  }
  return [];
};

const dedupeStrings = (values, { lowercase = true } = {}) => {
  const seen = new Set();
  const result = [];
  values.forEach((value) => {
    const raw = sanitizeString(value);
    if (!raw) return;
    const key = lowercase ? raw.toLowerCase() : raw;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(raw);
  });
  return result;
};

const normalizeStringArray = (value) => {
  const result = [];
  const pushString = (str) => {
    if (!str) return;
    const parts = str.split(BULLET_SPLIT_REGEX);
    parts.forEach((part) => {
      const cleaned = sanitizeField(part);
      if (cleaned) {
        result.push(cleaned);
      }
    });
  };

  toArray(value).forEach((entry) => {
    if (typeof entry === 'string') {
      pushString(entry);
    } else if (Array.isArray(entry)) {
      entry.forEach((nested) => pushString(sanitizeString(nested)));
    } else if (entry && typeof entry === 'object') {
      Object.values(entry).forEach((nested) => {
        if (typeof nested === 'string') {
          pushString(nested);
        } else if (Array.isArray(nested)) {
          nested.forEach((inner) => pushString(sanitizeString(inner)));
        }
      });
    }
  });

  return dedupeStrings(result);
};

const normalizeLinkArray = (value) => {
  const result = [];
  toArray(value).forEach((entry) => {
    if (typeof entry === 'string') {
      const cleaned = sanitizeString(entry);
      if (cleaned) {
        result.push(cleaned);
      }
    } else if (entry && typeof entry === 'object') {
      const candidate = sanitizeString(entry.url || entry.href || entry.link);
      if (candidate) {
        result.push(candidate);
      }
    }
  });
  return dedupeStrings(result);
};

const ensureId = (value, prefix) => {
  if (typeof value === 'string') {
    const cleaned = value.trim();
    if (cleaned) return cleaned;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  fallbackCounter += 1;
  return `${prefix}-${Date.now()}-${fallbackCounter}`;
};

const normalizeEndDate = (value) => {
  const cleaned = sanitizeString(value);
  if (!cleaned) return {};
  const lower = cleaned.toLowerCase();
  if (lower === 'present' || lower === 'current' || lower === 'ongoing') {
    return { isCurrent: true };
  }
  return { endDate: cleaned };
};

const normalizeContact = (value, { explicitLinks = [] } = {}) => {
  const contact = value && typeof value === 'object' ? value : {};
  const result = {};

  ['name', 'title', 'email', 'phone', 'location', 'linkedin', 'github', 'website'].forEach((field) => {
    const normalized = sanitizeField(contact[field]);
    if (normalized) {
      result[field] = normalized;
    }
  });

  const explicitSet = new Set(
    explicitLinks
      .map((link) => link.toLowerCase())
  );

  Object.values(result).forEach((val) => {
    if (typeof val === 'string' && val.startsWith('http')) {
      explicitSet.add(val.toLowerCase());
    }
  });

  const linkCandidates = [
    ...explicitLinks,
    ...(Array.isArray(contact.links) ? contact.links : []),
  ];

  const links = normalizeLinkArray(linkCandidates).filter((link) => {
    const key = link.toLowerCase();
    if (explicitSet.has(key)) {
      if (!result.linkedin || result.linkedin.toLowerCase() !== key) {
        if (!result.github || result.github.toLowerCase() !== key) {
          if (!result.website || result.website.toLowerCase() !== key) {
            return false;
          }
        }
      }
    }
    return true;
  });

  if (links.length) {
    const seen = new Set(
      ['linkedin', 'github', 'website']
        .map((field) => result[field] && result[field].toLowerCase())
        .filter(Boolean)
    );

    const filtered = [];
    links.forEach((link) => {
      const key = link.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      filtered.push(link);
    });

    if (filtered.length) {
      result.links = filtered;
    }
  }

  return result;
};

const normalizeExperienceEntry = (entry, index) => {
  const safe = entry && typeof entry === 'object' ? entry : {};
  const id = ensureId(safe.id ?? safe.uuid ?? safe._id, `exp-${index}`);

  const normalized = {
    id,
    company: sanitizeField(safe.company ?? safe.employer),
    role: sanitizeField(safe.role ?? safe.position ?? safe.title),
    startDate: sanitizeString(safe.startDate ?? safe.period ?? safe.start),
    location: sanitizeField(safe.location),
    environment: normalizeStringArray(safe.environment),
    bullets: normalizeStringArray(safe.bullets ?? safe.responsibilities ?? safe.achievements),
    technologies: normalizeStringArray(safe.technologies ?? safe.skills)
  };

  const { endDate, isCurrent } = normalizeEndDate(safe.endDate ?? safe.end ?? safe.endPeriod);
  if (endDate) normalized.endDate = endDate;
  if (typeof safe.isCurrent === 'boolean') {
    normalized.isCurrent = safe.isCurrent;
  } else if (isCurrent !== undefined) {
    normalized.isCurrent = isCurrent;
  }

  return normalized;
};

const normalizeEducationEntry = (entry, index) => {
  const safe = entry && typeof entry === 'object' ? entry : {};
  const id = ensureId(safe.id ?? safe.uuid ?? safe._id, `edu-${index}`);
  return {
    id,
    institution: sanitizeField(safe.institution ?? safe.school ?? safe.university),
    degree: sanitizeField(safe.degree),
    field: sanitizeField(safe.field ?? safe.fieldOfStudy),
    startDate: sanitizeString(safe.startDate ?? safe.start),
    endDate: sanitizeString(safe.endDate ?? safe.end),
    bullets: normalizeStringArray(safe.bullets ?? safe.highlights)
  };
};

const normalizeProjectEntry = (entry, index) => {
  const safe = entry && typeof entry === 'object' ? entry : {};
  const id = ensureId(safe.id ?? safe.uuid ?? safe._id, `proj-${index}`);
  return {
    id,
    name: sanitizeField(safe.name ?? safe.title),
    summary: sanitizeField(safe.summary ?? safe.description),
    link: sanitizeString(safe.link ?? safe.url ?? safe.href),
    bullets: normalizeStringArray(safe.bullets ?? safe.highlights ?? safe.accomplishments),
    technologies: normalizeStringArray(safe.technologies ?? safe.skills ?? safe.stack)
  };
};

const normalizeCertificationEntry = (entry, index) => {
  const safe = entry && typeof entry === 'object' ? entry : {};
  const id = ensureId(safe.id ?? safe.uuid ?? safe._id, `cert-${index}`);
  return {
    id,
    name: sanitizeField(safe.name ?? safe.title),
    issuer: sanitizeField(safe.issuer ?? safe.organisation ?? safe.organization),
    link: sanitizeString(safe.link ?? safe.url ?? safe.href),
    skills: normalizeStringArray(safe.skills)
  };
};

const normalizeSkills = (value) => {
  const source = value && typeof value === 'object' ? value : {};
  const technical = normalizeStringArray(source.technical ?? source.primary ?? source.skills ?? source);
  const tools = normalizeStringArray(source.tools);
  const soft = normalizeStringArray(source.soft ?? source.behavioral);

  const result = { technical };
  if (tools.length) result.tools = tools;
  if (soft.length) result.soft = soft;

  return result;
};

const normalizeResumeData = (input) => {
  const source = input && typeof input === 'object' ? input : {};

  const explicitLinks = normalizeLinkArray([
    source.linkedin,
    source.github,
    source.website
  ]);

  const baseContact =
    source.contact && typeof source.contact === 'object' ? { ...source.contact } : {};
  ['name', 'title', 'email', 'phone', 'location', 'linkedin', 'github', 'website'].forEach((field) => {
    if (baseContact[field] === undefined && source[field] !== undefined) {
      baseContact[field] = source[field];
    }
  });

  const contact = normalizeContact(baseContact, { explicitLinks });
  if (!Object.keys(contact).length) {
    delete contact.name;
  }

  const experience = toArray(source.experience).map(normalizeExperienceEntry);
  const education = toArray(source.education).map(normalizeEducationEntry);
  const projects = toArray(source.projects).map(normalizeProjectEntry);
  const certifications = toArray(source.certifications).map(normalizeCertificationEntry);

  return {
    summary: sanitizeString(source.summary),
    contact: Object.keys(contact).length ? contact : undefined,
    skills: normalizeSkills(source.skills),
    experience,
    education,
    projects,
    certifications
  };
};

module.exports = {
  normalizeResumeData
};


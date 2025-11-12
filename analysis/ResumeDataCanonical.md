## Canonical Resume Data Shape

This document describes the normalized resume payload shared between the API (Fastify) and the web dashboard. All AI entry points, merge flows, and persistence helpers should treat this as the source of truth.

### Top-Level Object

| Field        | Type / Notes                                                                                  |
|--------------|-----------------------------------------------------------------------------------------------|
| `summary`    | `string` (trimmed, defaults to `''`)                                                          |
| `contact`    | `NormalizedContact` (see below)                                                               |
| `skills`     | `{ technical: string[]; tools?: string[]; soft?: string[] }` — individual arrays are de-duped |
| `experience` | `ExperienceEntry[]` (ordered array; empty array when absent)                                  |
| `education`  | `EducationEntry[]`                                                                            |
| `projects`   | `ProjectEntry[]`                                                                              |
| `certifications` | `CertificationEntry[]`                                                                    |

All array fields **must** be true arrays (never objects keyed by numbers) and contain plain JavaScript objects. String arrays are whitespace-trimmed, deduplicated, and free of placeholder values.

### Contact Block (`NormalizedContact`)

| Field      | Type / Notes                         |
|------------|--------------------------------------|
| `name`     | `string | undefined`                 |
| `title`    | `string | undefined`                 |
| `email`    | `string | undefined`                 |
| `phone`    | `string | undefined`                 |
| `location` | `string | undefined`                 |
| `linkedin` | `string | undefined` (full URL)      |
| `github`   | `string | undefined` (full URL)      |
| `website`  | `string | undefined` (full URL)      |
| `links`    | `string[]` — deduplicated URLs (optional; excludes the three explicit fields) |

Empty strings should be coerced to `undefined` before saving to the database; the editor layer can treat them as empty strings for controlled inputs.

### Experience Entry

| Field           | Type / Notes                                                |
|-----------------|-------------------------------------------------------------|
| `id`            | `string` (stable identifier; non-empty)                     |
| `company`       | `string | undefined`                                        |
| `role`          | `string | undefined`                                        |
| `startDate`     | `string | undefined` (ISO-like or free-form)                |
| `endDate`       | `string | undefined`                                        |
| `isCurrent`     | `boolean | undefined`                                       |
| `location`      | `string | undefined`                                        |
| `environment`   | `string[]`                                                  |
| `bullets`       | `string[]`                                                  |
| `technologies`  | `string[]`                                                  |

### Education Entry

| Field         | Type / Notes     |
|---------------|------------------|
| `id`          | `string`         |
| `institution` | `string|undefined` |
| `degree`      | `string|undefined` |
| `field`       | `string|undefined` (if provided) |
| `startDate`   | `string|undefined` |
| `endDate`     | `string|undefined` |
| `bullets`     | `string[]`       |

### Project Entry

| Field        | Type / Notes     |
|--------------|------------------|
| `id`         | `string`         |
| `name`       | `string|undefined` |
| `summary`    | `string|undefined` |
| `link`       | `string|undefined` |
| `bullets`    | `string[]`       |
| `technologies` | `string[]`     |

### Certification Entry

| Field   | Type / Notes     |
|---------|------------------|
| `id`    | `string`         |
| `name`  | `string|undefined` |
| `issuer`| `string|undefined` |
| `link`  | `string|undefined` |
| `skills`| `string[]`       |

### Metadata / Formatting

Metadata and formatting are stored alongside the normalized data when persisting a `BaseResume` record:

| Field               | Type / Notes                                                                 |
|---------------------|------------------------------------------------------------------------------|
| `metadata.sectionOrder`    | `string[]` — ordered list of section identifiers (defaults to `DEFAULT_SECTION_ORDER`) |
| `metadata.sectionVisibility` | `Record<string, boolean>` merged with `DEFAULT_SECTION_VISIBILITY`  |
| `metadata.customSections`  | Custom section descriptors from the editor (array of objects)         |
| `metadata.customFields`    | Custom field definitions (array of objects)                           |
| `formatting`         | Layout configuration merged with `DEFAULT_FORMATTING` (padding, fonts, etc.) |

### Normalization Rules

- Treat `null`, numeric-keyed objects, and sparse arrays as candidates for normalization into dense arrays.
- Trim and collapse whitespace in all strings; drop placeholder values (`"Your Name"`, `"Phone"`, etc.).
- Deduplicate arrays by case-insensitive comparison where applicable (skills, links, keywords).
- Preserve URLs exactly as entered once validated/trusted; avoid lowercasing the display value, only the comparison key.
- Ensure IDs remain strings to satisfy Prisma schema and React key stability.


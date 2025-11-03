# Field IDs Reference for Resume Parsing

This document lists all semantic field IDs used in the profile forms. These IDs are used for:
- Resume parsing integration (mapping parsed data to UI fields)
- Form validation
- Accessibility (label association)
- Testing and automation

---

## Profile Tab - Basic Information

| Field | ID | Name | Type |
|-------|----|----|------|
| **First Name** | `profile-first-name` | `firstName` | text |
| **Last Name** | `profile-last-name` | `lastName` | text |
| **Email** | `profile-email` | `email` | email |
| **Phone** | `profile-phone` | `phone` | tel |
| **Location** | `profile-location` | `location` | text |
| **Bio** | `profile-bio` | `bio` | textarea (5000 chars) |

---

## Professional Tab - Work Experience

### Work Experience Fields (Dynamic - per experience)

Each work experience has fields with IDs following the pattern: `work-exp-{experienceId}-{field}`

| Field | ID Pattern | Name Pattern | Type |
|-------|-----------|--------------|------|
| **Role/Position** | `work-exp-{id}-role` | `workExp-{id}-role` | text |
| **Company** | `work-exp-{id}-company` | `workExp-{id}-company` | text |
| **Client** | `work-exp-{id}-client` | `workExp-{id}-client` | text |
| **Location** | `work-exp-{id}-location` | `workExp-{id}-location` | text |
| **Start Date** | `work-exp-{id}-start-date` | `workExp-{id}-startDate` | text |
| **End Date** | `work-exp-{id}-end-date` | `workExp-{id}-endDate` | text |
| **Description** | `work-exp-{id}-description` | `workExp-{id}-description` | textarea (10000 chars) |

**Example:**
- Experience ID: `exp-12345`
- Company field ID: `work-exp-exp-12345-company`
- Description field ID: `work-exp-exp-12345-description`

---

## Project Fields (Dynamic - per project)

| Field | ID Pattern | Name Pattern | Type |
|-------|-----------|--------------|------|
| **Title** | `project-{id}-title` | `project-{id}-title` | text |
| **Description** | `project-{id}-description` | `project-{id}-description` | textarea (5000 chars) |
| **Technologies** | `project-{id}-technologies` | `project-{id}-technologies` | array |
| **Link** | `project-{id}-link` | `project-{id}-link` | url |
| **GitHub** | `project-{id}-github` | `project-{id}-github` | url |
| **Date** | `project-{id}-date` | `project-{id}-date` | text |

---

## Education Fields (Dynamic - per education)

| Field | ID Pattern | Name Pattern | Type |
|-------|-----------|--------------|------|
| **Institution** | `education-{id}-institution` | `education-{id}-institution` | text |
| **Degree** | `education-{id}-degree` | `education-{id}-degree` | text |
| **Field** | `education-{id}-field` | `education-{id}-field` | text |
| **Start Date** | `education-{id}-start-date` | `education-{id}-startDate` | text |
| **End Date** | `education-{id}-end-date` | `education-{id}-endDate` | text |
| **GPA** | `education-{id}-gpa` | `education-{id}-gpa` | text |
| **Description** | `education-{id}-description` | `education-{id}-description` | textarea (3000 chars) |

---

## Skills & Certifications

| Field | ID Pattern | Name Pattern | Type |
|-------|-----------|--------------|------|
| **Skills List** | `skills-list` | `skills` | array |
| **Certification Name** | `cert-{id}-name` | `cert-{id}-name` | text |
| **Certification Issuer** | `cert-{id}-issuer` | `cert-{id}-issuer` | text |
| **Certification Date** | `cert-{id}-date` | `cert-{id}-date` | text |

---

## Usage in Resume Parsing

When implementing resume parsing, use these IDs to populate fields:

```typescript
// Example: Populate basic profile fields
document.getElementById('profile-first-name')?.value = parsedData.firstName;
document.getElementById('profile-last-name')?.value = parsedData.lastName;
document.getElementById('profile-email')?.value = parsedData.email;
document.getElementById('profile-phone')?.value = parsedData.phone;
document.getElementById('profile-location')?.value = parsedData.location;
document.getElementById('profile-bio')?.value = parsedData.bio;

// Example: Populate work experience
parsedData.workExperiences.forEach((exp, index) => {
  const expId = exp.id || `exp-${index}`;
  document.getElementById(`work-exp-${expId}-role`)?.value = exp.role;
  document.getElementById(`work-exp-${expId}-company`)?.value = exp.company;
  document.getElementById(`work-exp-${expId}-description`)?.value = exp.description;
});
```

---

## ID Generation Rules

1. **Static Fields**: Use prefix `profile-` for basic profile fields
2. **Dynamic Fields**: Use pattern `{type}-{id}-{field}` for array items
3. **Name Attribute**: Similar to ID but uses camelCase (e.g., `workExp-{id}-role`)
4. **Uniqueness**: IDs are guaranteed unique:
   - Static fields: Fixed IDs
   - Dynamic fields: Include item ID in the ID string
   - React's `useId()` ensures uniqueness if ID not provided

---

## Benefits

✅ **Resume Parsing**: Easy to map parsed data to UI fields  
✅ **Testing**: Consistent selectors for E2E tests  
✅ **Accessibility**: Proper label-field association  
✅ **Form Validation**: Target specific fields for validation  
✅ **Automation**: Scriptable field population  

---

**Last Updated**: 2024-01-01


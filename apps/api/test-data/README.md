# Test Data & Fixtures

This directory contains test data and fixtures for testing the RoleReady Resume Builder.

## Directory Structure

```
test-data/
├── sample-resumes.json       # Realistic test resume data
├── job-descriptions.js       # Sample job descriptions
├── sample-uploads/           # Test PDF/DOCX files
│   ├── well-formatted.pdf
│   ├── poorly-formatted.pdf
│   ├── scanned-image.pdf
│   ├── resume-with-tables.docx
│   └── plain-text.txt
└── README.md                 # This file
```

## Sample Resumes

The `sample-resumes.json` file contains 5 realistic resume examples:

### 1. Software Engineer Resume (2 pages)
- **Profile:** Alex Chen
- **Experience:** 5+ years, 3 companies
- **Skills:** Full-stack development, React, Node.js, AWS
- **Education:** BS Computer Science from UC Berkeley
- **Use Case:** Testing typical tech resume parsing and formatting

### 2. Product Manager Resume (2 pages)
- **Profile:** Sarah Johnson
- **Experience:** 7+ years, 3 companies
- **Skills:** Product strategy, user research, data analysis
- **Education:** MBA from MIT, BS from Cornell
- **Use Case:** Testing non-technical resume with business focus

### 3. Executive Resume (3 pages)
- **Profile:** Michael Anderson
- **Experience:** 15+ years, 4 companies (VP/Director level)
- **Skills:** Engineering leadership, strategic planning
- **Education:** MS Computer Science from Stanford
- **Use Case:** Testing long-form executive resume with achievements

### 4. Entry Level Resume (1 page)
- **Profile:** Emily Rodriguez
- **Experience:** Recent graduate with internships
- **Skills:** JavaScript, React, Python
- **Education:** BS Computer Science from UT Austin
- **Use Case:** Testing short resume with limited experience

### 5. Career Changer Resume (2 pages)
- **Profile:** David Kim
- **Experience:** Finance background transitioning to software development
- **Skills:** Full-stack development + financial analysis
- **Education:** Coding bootcamp + Finance degree
- **Use Case:** Testing non-traditional career path resume

## Job Descriptions

The `job-descriptions.js` file contains sample job descriptions across various industries:

- **Technology:** Software Engineer, Product Manager, DevOps Engineer
- **Healthcare:** Registered Nurse, Medical Assistant, Healthcare Administrator
- **Finance:** Financial Analyst, Investment Banker, Accountant
- **Education:** Teacher, Professor, Education Administrator

Each job description includes:
- Job title
- Company information
- Requirements (skills, experience, education)
- Responsibilities
- Benefits
- Keywords for ATS matching

## Sample Upload Files

### Well-Formatted PDF (`well-formatted.pdf`)
- **Description:** Clean, professional resume with proper formatting
- **Format:** PDF with selectable text
- **Use Case:** Testing optimal parsing scenario
- **Expected Parse Time:** < 2s
- **Expected Confidence:** > 95%

### Poorly-Formatted PDF (`poorly-formatted.pdf`)
- **Description:** Resume with inconsistent formatting, mixed fonts
- **Format:** PDF with selectable text but poor structure
- **Use Case:** Testing parser robustness
- **Expected Parse Time:** 2-4s
- **Expected Confidence:** 70-85%

### Scanned Image PDF (`scanned-image.pdf`)
- **Description:** Resume scanned as image (requires OCR)
- **Format:** PDF with embedded image
- **Use Case:** Testing OCR capabilities
- **Expected Parse Time:** 4-8s
- **Expected Confidence:** 60-75%
- **Note:** May require Tesseract OCR or similar

### Resume with Tables DOCX (`resume-with-tables.docx`)
- **Description:** Resume using tables for layout
- **Format:** Microsoft Word document
- **Use Case:** Testing DOCX parsing and table extraction
- **Expected Parse Time:** < 3s
- **Expected Confidence:** > 85%

### Plain Text (`plain-text.txt`)
- **Description:** Resume in plain text format
- **Format:** UTF-8 text file
- **Use Case:** Testing minimal formatting parsing
- **Expected Parse Time:** < 1s
- **Expected Confidence:** > 90%

## Usage in Tests

### Unit Tests

```javascript
const sampleResumes = require('./test-data/sample-resumes.json');

describe('Resume Validation', () => {
  it('should validate software engineer resume', () => {
    const resume = sampleResumes.softwareEngineer;
    expect(validateResume(resume)).toBe(true);
  });
});
```

### Integration Tests

```javascript
const { softwareEngineer } = require('./test-data/sample-resumes.json');
const { techJobs } = require('./test-data/job-descriptions');

describe('ATS Score', () => {
  it('should calculate ATS score for software engineer', async () => {
    const score = await calculateATSScore(
      softwareEngineer,
      techJobs.seniorSoftwareEngineer
    );
    expect(score).toBeGreaterThan(70);
  });
});
```

### Load Tests

```javascript
// k6 load test
import { softwareEngineer } from './test-data/sample-resumes.json';

export default function() {
  const response = http.post(
    `${BASE_URL}/api/resumes`,
    JSON.stringify(softwareEngineer)
  );
  check(response, { 'status is 201': (r) => r.status === 201 });
}
```

### File Upload Tests

```javascript
const fs = require('fs');
const path = require('path');

describe('File Parsing', () => {
  it('should parse well-formatted PDF', async () => {
    const filePath = path.join(__dirname, 'test-data/sample-uploads/well-formatted.pdf');
    const file = fs.readFileSync(filePath);
    
    const result = await parseResume(file, 'application/pdf');
    
    expect(result.confidence).toBeGreaterThan(0.95);
    expect(result.parseTime).toBeLessThan(2000);
  });
});
```

## Creating Test Files

### To create sample PDF files:

1. **Well-Formatted PDF:**
   - Use the software engineer resume from `sample-resumes.json`
   - Export to PDF using a professional template
   - Ensure text is selectable

2. **Poorly-Formatted PDF:**
   - Use mixed fonts and sizes
   - Inconsistent spacing
   - No clear section headers
   - Still keep text selectable

3. **Scanned Image PDF:**
   - Print a resume and scan it
   - Save as PDF
   - Text will be in image format (requires OCR)

4. **DOCX with Tables:**
   - Create resume using table layout in Word
   - Use tables for columns and sections
   - Save as .docx

5. **Plain Text:**
   - Copy resume content to .txt file
   - Remove all formatting
   - Use simple indentation

## Generating Test Data

### Script to generate random test resumes:

```javascript
const { generateRandomResume } = require('./utils/testDataGenerator');

// Generate 100 random resumes for load testing
for (let i = 0; i < 100; i++) {
  const resume = generateRandomResume({
    experienceYears: Math.floor(Math.random() * 15) + 1,
    numJobs: Math.floor(Math.random() * 5) + 1,
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Java']
  });
  
  fs.writeFileSync(
    `./test-data/generated/resume-${i}.json`,
    JSON.stringify(resume, null, 2)
  );
}
```

## Best Practices

1. **Keep test data realistic:** Use actual resume structures and job descriptions
2. **Cover edge cases:** Include resumes with unusual formatting, long/short content
3. **Update regularly:** Add new test cases as bugs are discovered
4. **Version control:** Commit test data to git for consistency across environments
5. **Document expectations:** Clearly state expected parse times and confidence scores
6. **Privacy:** Never use real personal information in test data

## Performance Benchmarks

| File Type | Size | Expected Parse Time | Expected Confidence |
|-----------|------|---------------------|---------------------|
| Well-formatted PDF | < 500KB | < 2s | > 95% |
| Poorly-formatted PDF | < 500KB | 2-4s | 70-85% |
| Scanned PDF | < 2MB | 4-8s | 60-75% |
| DOCX | < 200KB | < 3s | > 85% |
| Plain Text | < 50KB | < 1s | > 90% |

## Cache Testing

For cache hit rate testing:

1. Upload same file twice
2. Second upload should be from cache
3. Expected cache hit rate: > 80% for repeated uploads
4. Cache should be invalidated after resume edit

## Troubleshooting

### Low confidence scores:
- Check if PDF is scanned (image-based)
- Verify text is selectable
- Check for unusual formatting

### Slow parse times:
- Check file size (should be < 2MB)
- Verify parser is not timing out
- Check if OCR is being triggered unnecessarily

### Failed parsing:
- Validate file format
- Check for corrupted files
- Verify file encoding (UTF-8 for text files)

## Contributing

When adding new test data:

1. Add entry to `sample-resumes.json` or `job-descriptions.js`
2. Update this README with description
3. Add corresponding test cases
4. Document expected behavior and performance
5. Submit PR with test results


This directory contains test data and fixtures for testing the RoleReady Resume Builder.

## Directory Structure

```
test-data/
├── sample-resumes.json       # Realistic test resume data
├── job-descriptions.js       # Sample job descriptions
├── sample-uploads/           # Test PDF/DOCX files
│   ├── well-formatted.pdf
│   ├── poorly-formatted.pdf
│   ├── scanned-image.pdf
│   ├── resume-with-tables.docx
│   └── plain-text.txt
└── README.md                 # This file
```

## Sample Resumes

The `sample-resumes.json` file contains 5 realistic resume examples:

### 1. Software Engineer Resume (2 pages)
- **Profile:** Alex Chen
- **Experience:** 5+ years, 3 companies
- **Skills:** Full-stack development, React, Node.js, AWS
- **Education:** BS Computer Science from UC Berkeley
- **Use Case:** Testing typical tech resume parsing and formatting

### 2. Product Manager Resume (2 pages)
- **Profile:** Sarah Johnson
- **Experience:** 7+ years, 3 companies
- **Skills:** Product strategy, user research, data analysis
- **Education:** MBA from MIT, BS from Cornell
- **Use Case:** Testing non-technical resume with business focus

### 3. Executive Resume (3 pages)
- **Profile:** Michael Anderson
- **Experience:** 15+ years, 4 companies (VP/Director level)
- **Skills:** Engineering leadership, strategic planning
- **Education:** MS Computer Science from Stanford
- **Use Case:** Testing long-form executive resume with achievements

### 4. Entry Level Resume (1 page)
- **Profile:** Emily Rodriguez
- **Experience:** Recent graduate with internships
- **Skills:** JavaScript, React, Python
- **Education:** BS Computer Science from UT Austin
- **Use Case:** Testing short resume with limited experience

### 5. Career Changer Resume (2 pages)
- **Profile:** David Kim
- **Experience:** Finance background transitioning to software development
- **Skills:** Full-stack development + financial analysis
- **Education:** Coding bootcamp + Finance degree
- **Use Case:** Testing non-traditional career path resume

## Job Descriptions

The `job-descriptions.js` file contains sample job descriptions across various industries:

- **Technology:** Software Engineer, Product Manager, DevOps Engineer
- **Healthcare:** Registered Nurse, Medical Assistant, Healthcare Administrator
- **Finance:** Financial Analyst, Investment Banker, Accountant
- **Education:** Teacher, Professor, Education Administrator

Each job description includes:
- Job title
- Company information
- Requirements (skills, experience, education)
- Responsibilities
- Benefits
- Keywords for ATS matching

## Sample Upload Files

### Well-Formatted PDF (`well-formatted.pdf`)
- **Description:** Clean, professional resume with proper formatting
- **Format:** PDF with selectable text
- **Use Case:** Testing optimal parsing scenario
- **Expected Parse Time:** < 2s
- **Expected Confidence:** > 95%

### Poorly-Formatted PDF (`poorly-formatted.pdf`)
- **Description:** Resume with inconsistent formatting, mixed fonts
- **Format:** PDF with selectable text but poor structure
- **Use Case:** Testing parser robustness
- **Expected Parse Time:** 2-4s
- **Expected Confidence:** 70-85%

### Scanned Image PDF (`scanned-image.pdf`)
- **Description:** Resume scanned as image (requires OCR)
- **Format:** PDF with embedded image
- **Use Case:** Testing OCR capabilities
- **Expected Parse Time:** 4-8s
- **Expected Confidence:** 60-75%
- **Note:** May require Tesseract OCR or similar

### Resume with Tables DOCX (`resume-with-tables.docx`)
- **Description:** Resume using tables for layout
- **Format:** Microsoft Word document
- **Use Case:** Testing DOCX parsing and table extraction
- **Expected Parse Time:** < 3s
- **Expected Confidence:** > 85%

### Plain Text (`plain-text.txt`)
- **Description:** Resume in plain text format
- **Format:** UTF-8 text file
- **Use Case:** Testing minimal formatting parsing
- **Expected Parse Time:** < 1s
- **Expected Confidence:** > 90%

## Usage in Tests

### Unit Tests

```javascript
const sampleResumes = require('./test-data/sample-resumes.json');

describe('Resume Validation', () => {
  it('should validate software engineer resume', () => {
    const resume = sampleResumes.softwareEngineer;
    expect(validateResume(resume)).toBe(true);
  });
});
```

### Integration Tests

```javascript
const { softwareEngineer } = require('./test-data/sample-resumes.json');
const { techJobs } = require('./test-data/job-descriptions');

describe('ATS Score', () => {
  it('should calculate ATS score for software engineer', async () => {
    const score = await calculateATSScore(
      softwareEngineer,
      techJobs.seniorSoftwareEngineer
    );
    expect(score).toBeGreaterThan(70);
  });
});
```

### Load Tests

```javascript
// k6 load test
import { softwareEngineer } from './test-data/sample-resumes.json';

export default function() {
  const response = http.post(
    `${BASE_URL}/api/resumes`,
    JSON.stringify(softwareEngineer)
  );
  check(response, { 'status is 201': (r) => r.status === 201 });
}
```

### File Upload Tests

```javascript
const fs = require('fs');
const path = require('path');

describe('File Parsing', () => {
  it('should parse well-formatted PDF', async () => {
    const filePath = path.join(__dirname, 'test-data/sample-uploads/well-formatted.pdf');
    const file = fs.readFileSync(filePath);
    
    const result = await parseResume(file, 'application/pdf');
    
    expect(result.confidence).toBeGreaterThan(0.95);
    expect(result.parseTime).toBeLessThan(2000);
  });
});
```

## Creating Test Files

### To create sample PDF files:

1. **Well-Formatted PDF:**
   - Use the software engineer resume from `sample-resumes.json`
   - Export to PDF using a professional template
   - Ensure text is selectable

2. **Poorly-Formatted PDF:**
   - Use mixed fonts and sizes
   - Inconsistent spacing
   - No clear section headers
   - Still keep text selectable

3. **Scanned Image PDF:**
   - Print a resume and scan it
   - Save as PDF
   - Text will be in image format (requires OCR)

4. **DOCX with Tables:**
   - Create resume using table layout in Word
   - Use tables for columns and sections
   - Save as .docx

5. **Plain Text:**
   - Copy resume content to .txt file
   - Remove all formatting
   - Use simple indentation

## Generating Test Data

### Script to generate random test resumes:

```javascript
const { generateRandomResume } = require('./utils/testDataGenerator');

// Generate 100 random resumes for load testing
for (let i = 0; i < 100; i++) {
  const resume = generateRandomResume({
    experienceYears: Math.floor(Math.random() * 15) + 1,
    numJobs: Math.floor(Math.random() * 5) + 1,
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Java']
  });
  
  fs.writeFileSync(
    `./test-data/generated/resume-${i}.json`,
    JSON.stringify(resume, null, 2)
  );
}
```

## Best Practices

1. **Keep test data realistic:** Use actual resume structures and job descriptions
2. **Cover edge cases:** Include resumes with unusual formatting, long/short content
3. **Update regularly:** Add new test cases as bugs are discovered
4. **Version control:** Commit test data to git for consistency across environments
5. **Document expectations:** Clearly state expected parse times and confidence scores
6. **Privacy:** Never use real personal information in test data

## Performance Benchmarks

| File Type | Size | Expected Parse Time | Expected Confidence |
|-----------|------|---------------------|---------------------|
| Well-formatted PDF | < 500KB | < 2s | > 95% |
| Poorly-formatted PDF | < 500KB | 2-4s | 70-85% |
| Scanned PDF | < 2MB | 4-8s | 60-75% |
| DOCX | < 200KB | < 3s | > 85% |
| Plain Text | < 50KB | < 1s | > 90% |

## Cache Testing

For cache hit rate testing:

1. Upload same file twice
2. Second upload should be from cache
3. Expected cache hit rate: > 80% for repeated uploads
4. Cache should be invalidated after resume edit

## Troubleshooting

### Low confidence scores:
- Check if PDF is scanned (image-based)
- Verify text is selectable
- Check for unusual formatting

### Slow parse times:
- Check file size (should be < 2MB)
- Verify parser is not timing out
- Check if OCR is being triggered unnecessarily

### Failed parsing:
- Validate file format
- Check for corrupted files
- Verify file encoding (UTF-8 for text files)

## Contributing

When adding new test data:

1. Add entry to `sample-resumes.json` or `job-descriptions.js`
2. Update this README with description
3. Add corresponding test cases
4. Document expected behavior and performance
5. Submit PR with test results


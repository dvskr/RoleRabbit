# RoleReady Sample Files

This directory contains sample files to help with development, testing, and integration.

## 📁 Files Overview

### Resume Data Samples
- **`resume-data-sample-1.json`** - Sample resume data for a software engineer
- **`resume-data-sample-2.json`** - Sample resume data for a data scientist

Use these files to:
- Test resume parsing and import functionality
- Populate test data in development
- Understand the expected resume data structure

### API Examples
- **`api-request-examples.json`** - Complete API request/response examples

Use this file to:
- Understand API endpoints and expected formats
- Test API integrations
- Generate mock API responses for development

### Test Data
- **`test-data.json`** - Comprehensive test data for various entities

Use this file to:
- Set up test users and profiles
- Create test resumes and job applications
- Test AI prompt functionality

### Job Descriptions
- **`job-descriptions-sample.json`** - Sample job postings for testing

Use this file to:
- Test job matching and AI optimization features
- Test resume tailoring functionality
- Understand job description formats

### Environment Configuration
- **`environment-sample.env`** - Sample environment variables

Use this file to:
- Set up local development environment
- Understand required configuration
- Reference for production deployment

### Database Seed Data
- **`database-seed-data.sql`** - SQL seed data for development

Use this file to:
- Populate development database
- Test database operations
- Understand data relationships

### Email Templates
- **`email-templates-sample.json`** - Sample email templates

Use this file to:
- Test email generation features
- Customize email templates
- Understand email format requirements

## 🚀 Usage Examples

### Loading Resume Data
```javascript
import sampleResume from './samples/resume-data-sample-1.json';

// Use in your application
const resumeData = sampleResume;
```

### Testing API Calls
```javascript
import apiExamples from './samples/api-request-examples.json';

// Use the login example
const loginRequest = apiExamples.authentication.login;
fetch(loginRequest.url, {
  method: loginRequest.method,
  headers: loginRequest.headers,
  body: JSON.stringify(loginRequest.body)
});
```

### Seeding Database
```bash
# PostgreSQL
psql -d roleready_db -f samples/database-seed-data.sql

# Or using Prisma
npx prisma db seed --schema=apps/api/prisma/schema.prisma
```

### Setting Up Environment
```bash
# Copy the sample file
cp samples/environment-sample.env .env

# Edit with your actual values
nano .env
```

## 📝 Notes

- All sample data is for **development and testing only**
- Do **not** use sample data in production
- Update environment variables with your actual credentials
- Sample passwords are not secure - use strong passwords in production

## 🔄 Updates

These sample files are maintained to match the current application structure. If you update the data models or API contracts, please update the corresponding sample files.

## 🤝 Contributing

When adding new features:
1. Update relevant sample files with new data structures
2. Add examples to API request examples file
3. Update this README if needed


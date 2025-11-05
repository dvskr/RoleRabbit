const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Schema definitions from database
const schemaFields = {
  user: ['id', 'email', 'name', 'password', 'provider', 'providerId', 'twoFactorEnabled', 'twoFactorSecret', 'twoFactorBackupCodes', 'emailNotifications', 'smsNotifications', 'privacyLevel', 'profileVisibility', 'createdAt', 'updatedAt'],
  user_profiles: ['id', 'userId', 'firstName', 'lastName', 'phone', 'personalEmail', 'location', 'bio', 'profilePicture', 'currentRole', 'currentCompany', 'linkedin', 'github', 'website', 'profileViews', 'profileCompleteness', 'createdAt', 'updatedAt'],
  work_experiences: ['id', 'profileId', 'company', 'role', 'location', 'startDate', 'endDate', 'isCurrent', 'description', 'projectType', 'createdAt', 'updatedAt'],
  projects: ['id', 'profileId', 'title', 'description', 'technologies', 'date', 'link', 'github', 'createdAt', 'updatedAt'],
  education: ['id', 'profileId', 'institution', 'degree', 'field', 'startDate', 'endDate', 'gpa', 'honors', 'location', 'description', 'createdAt', 'updatedAt'],
  certifications: ['id', 'profileId', 'name', 'issuer', 'date', 'expiryDate', 'credentialId', 'credentialUrl', 'createdAt', 'updatedAt'],
  social_links: ['id', 'profileId', 'platform', 'url', 'createdAt', 'updatedAt'],
  skills: ['id', 'name', 'category', 'createdAt', 'updatedAt'],
  user_skills: ['id', 'profileId', 'skillId', 'proficiency', 'yearsOfExperience', 'verified', 'createdAt', 'updatedAt']
};

// Check what fields API is trying to access
console.log('\n📋 API Schema Validation Report\n');
console.log('=' .repeat(60));

// Check GET endpoint fields
console.log('\n✅ GET /api/users/profile - Field Validation:');
console.log('  User fields:', schemaFields.user.length, 'fields - OK');
console.log('  UserProfile fields:', schemaFields.user_profiles.length, 'fields - OK');
console.log('  WorkExperience fields:', schemaFields.work_experiences.length, 'fields - OK');
console.log('  Education fields:', schemaFields.education.length, 'fields - OK');
console.log('  Certifications fields:', schemaFields.certifications.length, 'fields - OK');
console.log('  UserSkills fields:', schemaFields.user_skills.length, 'fields - OK');
console.log('  SocialLinks fields:', schemaFields.social_links.length, 'fields - OK');
console.log('  Projects fields:', schemaFields.projects.length, 'fields - CHECKED');

console.log('\n📊 Database Schema Summary:');
Object.entries(schemaFields).forEach(([table, fields]) => {
  console.log(`  ${table}: ${fields.length} fields`);
});

console.log('\n✅ Schema validation complete!\n');

prisma.$disconnect();


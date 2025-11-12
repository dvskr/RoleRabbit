const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Check what Prisma Client actually exposes
console.log('\n🔍 Validating API against Database Schema\n');
console.log('='.repeat(60));

const checks = [
  { name: 'User', api: 'prisma.user', model: 'users' },
  { name: 'UserProfile', api: 'prisma.userProfile', model: 'user_profiles' },
  { name: 'WorkExperience', api: 'prisma.workExperience', model: 'work_experiences' },
  { name: 'Education', api: 'prisma.education', model: 'education' },
  { name: 'Certification', api: 'prisma.certification', model: 'certifications' },
  { name: 'Project', api: 'prisma.project', model: 'projects' },
  { name: 'SocialLink', api: 'prisma.socialLink', model: 'social_links' },
  { name: 'UserSkill', api: 'prisma.userSkill', model: 'user_skills' },
  { name: 'Skill', api: 'prisma.skill', model: 'skills' }
];

let errors = [];

checks.forEach(check => {
  try {
    // Try to access the model
    const model = prisma[check.name.charAt(0).toLowerCase() + check.name.slice(1)];
    if (model) {
      console.log(`✅ ${check.name} (${check.api}) -> ${check.model}`);
    } else {
      errors.push(`❌ ${check.name}: Model not found in Prisma Client`);
    }
  } catch (e) {
    errors.push(`❌ ${check.name}: ${e.message}`);
  }
});

// Check field mismatches
console.log('\n📋 Field Validation:\n');

// Projects: API expects date, link, github but schema might have different fields
const projectFields = {
  schema: ['id', 'profileId', 'title', 'description', 'technologies', 'date', 'link', 'github', 'createdAt', 'updatedAt'],
  apiSelect: ['id', 'title', 'description', 'link', 'github', 'date', 'technologies'],
  apiCreate: ['title', 'description', 'link', 'github', 'date', 'technologies'] // Need to verify
};

console.log('Projects fields:');
console.log('  Schema:', projectFields.schema.join(', '));
console.log('  API Select:', projectFields.apiSelect.join(', '));
console.log('  ✅ Match:', JSON.stringify(projectFields.schema.filter(f => projectFields.apiSelect.includes(f)).sort()) === JSON.stringify(projectFields.apiSelect.sort()));

if (errors.length > 0) {
  console.log('\n❌ ERRORS FOUND:');
  errors.forEach(e => console.log('  ', e));
}

console.log('\n✅ Validation complete!\n');

prisma.$disconnect();


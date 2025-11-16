#!/usr/bin/env node

/**
 * Seed Development Data Script
 * 
 * Creates test users, resumes, and sample data for local development.
 * 
 * Usage:
 *   node apps/api/scripts/seed-dev-data.js
 */

const { prisma } = require('../utils/db');
const bcrypt = require('bcrypt');
const sampleResumes = require('../test-data/sample-resumes.json');

const logger = {
  info: (...args) => console.log('ℹ️', ...args),
  success: (...args) => console.log('✅', ...args),
  error: (...args) => console.error('❌', ...args),
  warn: (...args) => console.warn('⚠️', ...args),
};

async function seedUsers() {
  logger.info('Seeding users...');

  const users = [
    {
      email: 'free@example.com',
      name: 'Free User',
      password: 'password123',
      subscriptionTier: 'FREE',
      resumeAiUsageLimit: 10,
    },
    {
      email: 'pro@example.com',
      name: 'Pro User',
      password: 'password123',
      subscriptionTier: 'PRO',
      resumeAiUsageLimit: 100,
    },
    {
      email: 'premium@example.com',
      name: 'Premium User',
      password: 'password123',
      subscriptionTier: 'PREMIUM',
      resumeAiUsageLimit: -1, // Unlimited
    },
    {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      subscriptionTier: 'PRO',
      resumeAiUsageLimit: 100,
    },
  ];

  const createdUsers = [];

  for (const userData of users) {
    try {
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existing) {
        logger.warn(`User ${userData.email} already exists, skipping...`);
        createdUsers.push(existing);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          passwordHash,
          subscriptionTier: userData.subscriptionTier,
          resumeAiUsageLimit: userData.resumeAiUsageLimit,
          resumeAiUsageCount: 0,
        },
      });

      logger.success(`Created user: ${user.email} (${user.subscriptionTier})`);
      createdUsers.push(user);
    } catch (error) {
      logger.error(`Failed to create user ${userData.email}:`, error.message);
    }
  }

  return createdUsers;
}

async function seedResumes(users) {
  logger.info('Seeding resumes...');

  // Assign sample resumes to users
  const assignments = [
    { userEmail: 'test@example.com', resumeIds: ['software-engineer-resume', 'entry-level-resume'] },
    { userEmail: 'pro@example.com', resumeIds: ['product-manager-resume'] },
    { userEmail: 'premium@example.com', resumeIds: ['software-engineer-resume'] },
  ];

  for (const assignment of assignments) {
    const user = users.find(u => u.email === assignment.userEmail);
    if (!user) {
      logger.warn(`User ${assignment.userEmail} not found, skipping resumes...`);
      continue;
    }

    let slotNumber = 1;

    for (const resumeId of assignment.resumeIds) {
      const sampleResume = sampleResumes.find(r => r.id === resumeId);
      if (!sampleResume) {
        logger.warn(`Sample resume ${resumeId} not found, skipping...`);
        continue;
      }

      try {
        // Check if resume already exists
        const existing = await prisma.baseResume.findFirst({
          where: {
            userId: user.id,
            name: sampleResume.name,
          },
        });

        if (existing) {
          logger.warn(`Resume "${sampleResume.name}" for ${user.email} already exists, skipping...`);
          continue;
        }

        // Create resume
        const resume = await prisma.baseResume.create({
          data: {
            userId: user.id,
            slotNumber: slotNumber++,
            name: sampleResume.name,
            isActive: slotNumber === 2, // Make first resume active
            data: sampleResume.data,
            formatting: {
              font: {
                family: 'Inter',
                size: 11,
                lineHeight: 1.5,
              },
              colors: {
                primary: '#2563eb',
                secondary: '#64748b',
                text: '#1e293b',
                background: '#ffffff',
              },
              spacing: {
                margins: {
                  top: 0.75,
                  right: 0.75,
                  bottom: 0.75,
                  left: 0.75,
                },
                sectionGap: 16,
              },
            },
            metadata: {
              templateId: 'modern-professional',
              tags: ['software', 'engineering'],
              industry: 'Technology',
            },
            parsingConfidence: 95.0,
          },
        });

        logger.success(`Created resume: "${resume.name}" for ${user.email}`);

        // Create analytics entry
        await prisma.resumeAnalytics.create({
          data: {
            resumeId: resume.id,
            viewCount: Math.floor(Math.random() * 50),
            exportCount: Math.floor(Math.random() * 10),
            tailorCount: Math.floor(Math.random() * 5),
            lastViewedAt: new Date(),
          },
        });

      } catch (error) {
        logger.error(`Failed to create resume "${sampleResume.name}":`, error.message);
      }
    }
  }
}

async function seedTailoredVersions(users) {
  logger.info('Seeding tailored versions...');

  const testUser = users.find(u => u.email === 'test@example.com');
  if (!testUser) {
    logger.warn('Test user not found, skipping tailored versions...');
    return;
  }

  const resumes = await prisma.baseResume.findMany({
    where: { userId: testUser.id },
    take: 1,
  });

  if (resumes.length === 0) {
    logger.warn('No resumes found for test user, skipping tailored versions...');
    return;
  }

  const baseResume = resumes[0];

  const tailoredVersions = [
    {
      jobTitle: 'Senior Software Engineer',
      company: 'Google',
      mode: 'moderate',
      tone: 'professional',
      atsScoreBefore: 75,
      atsScoreAfter: 92,
    },
    {
      jobTitle: 'Full Stack Developer',
      company: 'Startup Inc',
      mode: 'conservative',
      tone: 'technical',
      atsScoreBefore: 78,
      atsScoreAfter: 85,
    },
  ];

  for (const versionData of tailoredVersions) {
    try {
      const existing = await prisma.tailoredVersion.findFirst({
        where: {
          baseResumeId: baseResume.id,
          jobTitle: versionData.jobTitle,
          company: versionData.company,
        },
      });

      if (existing) {
        logger.warn(`Tailored version for ${versionData.company} already exists, skipping...`);
        continue;
      }

      await prisma.tailoredVersion.create({
        data: {
          baseResumeId: baseResume.id,
          userId: testUser.id,
          jobTitle: versionData.jobTitle,
          company: versionData.company,
          jobDescription: 'Sample job description...',
          mode: versionData.mode,
          tone: versionData.tone,
          data: baseResume.data, // In reality, this would be modified
          diff: {
            added: ['Emphasized cloud technologies'],
            removed: [],
            modified: ['Updated summary to match job requirements'],
          },
          atsScoreBefore: versionData.atsScoreBefore,
          atsScoreAfter: versionData.atsScoreAfter,
        },
      });

      logger.success(`Created tailored version: ${versionData.jobTitle} at ${versionData.company}`);
    } catch (error) {
      logger.error(`Failed to create tailored version:`, error.message);
    }
  }
}

async function main() {
  logger.info('🌱 Starting database seeding...\n');

  try {
    // Connect to database
    await prisma.$connect();
    logger.success('Connected to database\n');

    // Seed data
    const users = await seedUsers();
    logger.info('');

    await seedResumes(users);
    logger.info('');

    await seedTailoredVersions(users);
    logger.info('');

    logger.success('✨ Database seeding completed successfully!\n');

    // Print summary
    logger.info('📊 Summary:');
    logger.info(`   Users created: ${users.length}`);
    const resumeCount = await prisma.baseResume.count();
    logger.info(`   Resumes created: ${resumeCount}`);
    const tailoredCount = await prisma.tailoredVersion.count();
    logger.info(`   Tailored versions created: ${tailoredCount}`);
    logger.info('');

    logger.info('🔐 Test Credentials:');
    logger.info('   Email: test@example.com');
    logger.info('   Password: password123');
    logger.info('');

  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();



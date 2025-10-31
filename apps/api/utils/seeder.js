/**
 * Database Seeder
 * Populates database with test data for development and testing
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const logger = require('./logger');

const prisma = new PrismaClient();

/**
 * Seed users
 */
async function seedUsers() {
  logger.info('🌱 Seeding users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'test@roleready.com' },
      update: {},
      create: {
        email: 'test@roleready.com',
        name: 'Test User',
        password: hashedPassword,
        provider: 'local'
      }
    }),
    prisma.user.upsert({
      where: { email: 'admin@roleready.com' },
      update: {},
      create: {
        email: 'admin@roleready.com',
        name: 'Admin User',
        password: hashedPassword,
        provider: 'local'
      }
    }),
    prisma.user.upsert({
      where: { email: 'user1@roleready.com' },
      update: {},
      create: {
        email: 'user1@roleready.com',
        name: 'User One',
        password: hashedPassword,
        provider: 'local'
      }
    })
  ]);

  logger.info(`✅ Seeded ${users.length} users`);
  return users;
}

/**
 * Seed resumes
 */
async function seedResumes(userId) {
  logger.info('🌱 Seeding resumes...');

  const resumeData = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    location: 'New York, NY',
    summary: 'Experienced software engineer with 5+ years of experience',
    sections: [
      {
        type: 'experience',
        title: 'Experience',
        items: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            location: 'San Francisco, CA',
            date: '2020 - Present',
            description: 'Led development of multiple web applications'
          }
        ]
      },
      {
        type: 'education',
        title: 'Education',
        items: [
          {
            degree: 'B.S. Computer Science',
            school: 'University of Technology',
            location: 'Boston, MA',
            date: '2014 - 2018'
          }
        ]
      },
      {
        type: 'skills',
        title: 'Skills',
        items: [
          'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL'
        ]
      }
    ]
  };

  const resumes = await prisma.resume.createMany({
    data: [
      {
        userId,
        name: 'Professional Resume',
        data: JSON.stringify(resumeData),
        templateId: 'modern'
      },
      {
        userId,
        name: 'Creative Resume',
        data: JSON.stringify(resumeData),
        templateId: 'creative'
      }
    ]
  });

  logger.info(`✅ Seeded ${resumes.count} resumes`);
  return resumes;
}

/**
 * Seed jobs
 */
async function seedJobs(userId) {
  logger.info('🌱 Seeding jobs...');

  const jobs = [
    {
      userId,
      title: 'Senior Full Stack Developer',
      company: 'Tech Startup Inc',
      location: 'Remote',
      status: 'applied',
      appliedDate: new Date('2024-10-15'),
      source: 'linkedin'
    },
    {
      userId,
      title: 'Frontend Developer',
      company: 'Design Agency',
      location: 'New York, NY',
      status: 'interview',
      appliedDate: new Date('2024-10-10'),
      source: 'indeed'
    },
    {
      userId,
      title: 'Backend Engineer',
      company: 'Finance Corp',
      location: 'San Francisco, CA',
      status: 'screening',
      appliedDate: new Date('2024-10-20'),
      source: 'glassdoor'
    },
    {
      userId,
      title: 'DevOps Engineer',
      company: 'Cloud Services Inc',
      location: 'Remote',
      status: 'rejected',
      appliedDate: new Date('2024-09-15'),
      source: 'company-website'
    },
    {
      userId,
      title: 'Product Manager',
      company: 'Product Corp',
      location: 'Austin, TX',
      status: 'offer',
      appliedDate: new Date('2024-09-01'),
      source: 'referral'
    }
  ];

  const createdJobs = await prisma.job.createMany({
    data: jobs
  });

  logger.info(`✅ Seeded ${createdJobs.count} jobs`);
  return createdJobs;
}

/**
 * Seed cover letters
 */
async function seedCoverLetters(userId, jobId) {
  logger.info('🌱 Seeding cover letters...');

  const coverLetters = await prisma.coverLetter.createMany({
    data: [
      {
        userId,
        jobId,
        title: 'Cover Letter for Tech Startup',
        content: 'Dear Hiring Manager,\n\nI am excited to apply for the Senior Full Stack Developer position...',
        templateId: 'professional'
      }
    ]
  });

  logger.info(`✅ Seeded ${coverLetters.count} cover letters`);
  return coverLetters;
}

/**
 * Seed cloud files
 */
async function seedCloudFiles(userId) {
  logger.info('🌱 Seeding cloud files...');

  const files = await prisma.cloudFile.createMany({
    data: [
      {
        userId,
        name: 'resume.pdf',
        type: 'resume',
        size: 102400,
        contentType: 'application/pdf',
        data: 'base64_encoded_data_here',
        isPublic: false
      },
      {
        userId,
        name: 'portfolio-image.jpg',
        type: 'portfolio',
        size: 204800,
        contentType: 'image/jpeg',
        data: 'base64_encoded_image_here',
        isPublic: true
      }
    ]
  });

  logger.info(`✅ Seeded ${files.count} cloud files`);
  return files;
}

/**
 * Seed AI agents
 */
async function seedAIAgents(userId) {
  logger.info('🌱 Seeding AI agents...');

  const agents = await prisma.aiAgent.createMany({
    data: [
      {
        userId,
        name: 'Job Discovery Agent',
        description: 'Automatically discovers job opportunities',
        type: 'automatic',
        status: 'active',
        config: JSON.stringify({
          keywords: ['software engineer', 'developer'],
          location: 'San Francisco',
          minSalary: 100000
        }),
        enabled: true
      },
      {
        userId,
        name: 'Resume Optimizer',
        description: 'Optimizes resume for ATS',
        type: 'manual',
        status: 'paused',
        config: JSON.stringify({
          targetIndustry: 'Technology',
          optimizationLevel: 'high'
        }),
        enabled: true
      }
    ]
  });

  logger.info(`✅ Seeded ${agents.count} AI agents`);
  return agents;
}

/**
 * Main seed function
 */
async function seed() {
  try {
    logger.info('🚀 Starting database seed...\n');

    // Seed users
    const users = await seedUsers();
    const testUser = users[0];

    // Seed resumes
    await seedResumes(testUser.id);

    // Seed jobs
    const jobsResult = await seedJobs(testUser.id);

    // Get first job for cover letter
    const jobs = await prisma.job.findMany({
      where: { userId: testUser.id },
      take: 1
    });

    // Seed cover letters
    if (jobs.length > 0) {
      await seedCoverLetters(testUser.id, jobs[0].id);
    }

    // Seed cloud files
    await seedCloudFiles(testUser.id);

    // Seed AI agents
    await seedAIAgents(testUser.id);

    logger.info('\n✅ Database seeded successfully!');
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed if called directly
if (require.main === module) {
  seed();
}

module.exports = { seed };


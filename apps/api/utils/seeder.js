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
 * Main seed function
 */
async function seed() {
  try {
    logger.info('🚀 Starting database seed...\n');

    // Seed users only
    await seedUsers();

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


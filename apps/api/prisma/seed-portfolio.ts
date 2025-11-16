/**
 * Seed Portfolio Templates
 * Run: npx tsx prisma/seed-portfolio.ts
 */

import { PrismaClient } from '@prisma/client';
import { portfolioTemplates } from './seeds/portfolio-templates';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding portfolio templates...');

  for (const template of portfolioTemplates) {
    try {
      const result = await prisma.portfolioTemplate.upsert({
        where: { id: template.id },
        update: template,
        create: template,
      });
      console.log(`✅ Seeded template: ${result.name}`);
    } catch (error) {
      console.error(`❌ Failed to seed template: ${template.name}`, error);
    }
  }

  console.log('✨ Seeding complete!');
  console.log(`📊 Total templates: ${portfolioTemplates.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


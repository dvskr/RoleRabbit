const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { prisma } = require('../utils/db');

async function main() {
  const updates = [
    {
      id: 'cmhmajzkh00u9szips77mrdcj',
      technologies: [
        'Next.js',
        'React',
        'TypeScript',
        'Tailwind CSS',
        'Node.js',
        'Fastify',
        'PostgreSQL',
        'Prisma',
        'Redis',
        'Jest',
        'Playwright',
        'AWS'
      ]
    }
  ];

  for (const update of updates) {
    try {
      await prisma.project.update({
        where: { id: update.id },
        data: { technologies: JSON.stringify(update.technologies) }
      });
      console.log(`Updated technologies for project ${update.id}`);
    } catch (error) {
      console.warn(`Failed to update ${update.id}: ${error.message}`);
    }
  }
}

main()
  .catch((error) => {
    console.error('Failed to seed project technologies:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



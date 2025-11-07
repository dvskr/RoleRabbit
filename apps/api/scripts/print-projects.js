const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { prisma } = require('../utils/db');

async function main() {
  const projects = await prisma.project.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  console.log(JSON.stringify(projects, null, 2));
}

main()
  .catch((error) => {
    console.error('Failed to fetch projects:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



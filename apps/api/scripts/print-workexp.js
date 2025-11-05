const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { prisma } = require('../utils/db');

async function main() {
  const experiences = await prisma.workExperience.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  console.log(JSON.stringify(experiences, null, 2));
}

main()
  .catch((error) => {
    console.error('Failed to fetch work experiences:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



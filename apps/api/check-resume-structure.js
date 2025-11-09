const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    const resume = await prisma.baseResume.findFirst({
      where: { userId: 'cmhr8pgqs0006ou3bq2eutv00' },
      select: { data: true }
    });
    
    if (!resume) {
      console.log('❌ No resume found');
      process.exit(1);
    }
    
    console.log('📄 Full resume data structure:');
    console.log(JSON.stringify(resume.data, null, 2));
    
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    await prisma.$disconnect();
    process.exit(1);
  }
})();


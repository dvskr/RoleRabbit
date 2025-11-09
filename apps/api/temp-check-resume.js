process.env.DATABASE_URL = 'postgresql://postgres:6174%40Kakashi@db.oawxoirhnnvcomopxcdd.supabase.co:5432/postgres?schema=roleready';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const resume = await prisma.resume.findUnique({
      where: { id: 'cmhnzc70x0001ooy21dmxcph4' }
    });
    console.log(JSON.stringify(resume, null, 2));
  } catch (error) {
    console.error('Error fetching resume:', error);
  } finally {
    const method = '$' + 'disconnect';
    await prisma[method]();
  }
}

run().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

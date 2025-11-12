const { scoreResumeWorldClass } = require('../services/ats/worldClassATS');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'atstest@example.com' },
      select: {
        baseResumes: {
          take: 1,
          select: { data: true }
        }
      }
    });

    if (!user || !user.baseResumes.length) {
      throw new Error('No resume data found for test user');
    }

    const resumeData = user.baseResumes[0].data;
    const jobDescription = `Data Engineer Job Description: Responsibilities include building data pipelines, ETL, working with Hadoop, Spark, Kafka, and cloud platforms.`;

    const result = await scoreResumeWorldClass({
      resumeData,
      jobDescription,
      useAI: false
    });

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error running world-class ATS test:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();

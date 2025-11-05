/**
 * Temporary helper script to backfill technologies for existing work experiences.
 *
 * Usage: node scripts/seed-workexp-technologies.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { prisma } = require('../utils/db');

async function main() {
  const updates = [
    {
      id: 'cmhmajz6h00u3szipz3hi69dr',
      technologies: [
        'Airflow',
        'Azure Data Factory',
        'Apache Kafka',
        'Apache Spark',
        'Snowflake',
        'dbt',
        'Power BI',
        'Terraform',
        'GitHub Actions',
        'Great Expectations',
        'SQL',
        'Python'
      ]
    },
    {
      id: 'cmhmajz6h00u4szipa9b57kn2',
      technologies: [
        'Apache Airflow',
        'Apache NiFi',
        'Apache Spark',
        'HL7',
        'FHIR',
        'ICD-10',
        'AWS Lambda',
        'AWS Glue',
        'Looker',
        'SQL Server',
        'Python',
        'dbt'
      ]
    }
  ];

  for (const update of updates) {
    try {
      await prisma.workExperience.update({
        where: { id: update.id },
        data: { technologies: { set: update.technologies } }
      });
      console.log(`Updated technologies for work experience ${update.id}`);
    } catch (error) {
      console.warn(`Failed to update ${update.id}: ${error.message}`);
    }
  }
}

main()
  .catch((error) => {
    console.error('Failed to seed technologies:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



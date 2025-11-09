const { scoreResumeAgainstJob } = require('./services/ats/atsScoringService');

// The actual resume data from the UI
const resumeData = {
  "skills": {
    "soft": {},
    "tools": {},
    "technical": {
      "0": "Python",
      "1": "PySpark",
      "2": "SQL",
      "3": "Kafka",
      "4": "Schema Registry",
      "5": "Airflow",
      "6": "Azure Data Factory",
      "7": "AWS Glue",
      "8": "NiFi",
      "9": "Databricks",
      "10": "Delta Lake",
      "11": "Snowflake",
      "12": "BigQuery",
      "13": "Synapse",
      "14": "dbt",
      "15": "SCD2",
      "16": "CDC",
      "17": "Great Expectations",
      "18": "Data Contracts",
      "19": "Terraform",
      "20": "GitHub Actions",
      "21": "Jenkins",
      "22": "Docker",
      "23": "Kubernetes",
      "24": "RBAC",
      "25": "Encryption",
      "26": "Audit Logging",
      "27": "HIPAA",
      "28": "GDPR",
      "29": "Power BI",
      "30": "Tableau",
      "31": "Looker"
    }
  },
  "summary": "Data Engineer with more than 4 years of experience designing and scaling modern data platforms across manufacturing and healthcare.",
  "experience": {},
  "education": {},
  "projects": {}
};

// Simple job description mentioning Python, Java, AWS, etc.
const jobDescription = `
Data Engineer position requiring:
- Python programming
- Java development  
- Scala experience
- AWS cloud services
- Azure platform knowledge
`;

console.log('Testing ATS Scoring...\n');
console.log('Resume Skills:', Object.values(resumeData.skills.technical));
console.log('\nJob Description:', jobDescription);

try {
  const result = scoreResumeAgainstJob({ resumeData, jobDescription });
  
  console.log('\n📊 ATS Score:', result.overall);
  console.log('\n✅ Matched Skills:', result.breakdown.technicalSkills.matched);
  console.log('\n❌ Missing Skills:', result.breakdown.technicalSkills.missing);
  console.log('\nRequired matched:', result.breakdown.technicalSkills.requiredMatched, '/', result.breakdown.technicalSkills.requiredTotal);
  console.log('Preferred matched:', result.breakdown.technicalSkills.preferredMatched, '/', result.breakdown.technicalSkills.preferredTotal);
  
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
}


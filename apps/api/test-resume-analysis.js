const { analyzeResume } = require('./services/ats/atsScoringService');

const resumeData = {
  "skills": {
    "technical": {
      "0": "Python",
      "1": "PySpark",
      "2": "SQL",
      "3": "Kafka",
      "4": "AWS Glue",
      "5": "Azure Data Factory"
    }
  },
  "summary": "Data Engineer with 4 years of experience",
  "experience": {},
  "education": {},
  "projects": {}
};

console.log('Testing Resume Analysis...\n');
console.log('Input skills:', Object.values(resumeData.skills.technical));

try {
  const analysis = analyzeResume(resumeData);
  
  console.log('\n=== Resume Analysis Results ===');
  console.log('Technical Skills Found:', analysis.technical);
  console.log('\nSkills section text:', analysis.sections.skills.text);
  console.log('Summary:', analysis.sections.summary.text);
  
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
}


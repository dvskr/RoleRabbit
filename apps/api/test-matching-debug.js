const { analyzeResume, analyzeJobDescription, scoreTechnicalSkills } = require('./services/ats/atsScoringService');

const resumeData = {
  "skills": {
    "technical": {
      "0": "Python",
      "1": "AWS Glue",
      "2": "Azure Data Factory"
    }
  }
};

const jobDescription = "Data Engineer requiring Python, Java, AWS, Azure";

console.log('=== Testing Skill Matching ===\n');

const resumeAnalysis = analyzeResume(resumeData);
const jobAnalysis = analyzeJobDescription(jobDescription);

console.log('Resume Technical Skills:', resumeAnalysis.technical.map(s => s.skill));
console.log('Job Required Skills:', jobAnalysis.technical.required.map(s => s.skill));

// Manually test the matching logic
const resumeSkills = new Set(resumeAnalysis.technical.map(s => s.skill));
const requiredSkills = jobAnalysis.technical.required.map(s => s.skill);

console.log('\nResume Skills Set:', [...resumeSkills]);
console.log('Required Skills Array:', requiredSkills);

console.log('\n=== Manual Matching Test ===');
for (const jobSkill of requiredSkills) {
  console.log(`\nChecking job skill: "${jobSkill}"`);
  const found = [...resumeSkills].some(resumeSkill => {
    const match = resumeSkill.toLowerCase().includes(jobSkill.toLowerCase()) || 
                  jobSkill.toLowerCase().includes(resumeSkill.toLowerCase());
    console.log(`  - Compare "${resumeSkill}" with "${jobSkill}": ${match}`);
    return match;
  });
  console.log(`  Result: ${found ? '✓ MATCH' : '✗ NO MATCH'}`);
}


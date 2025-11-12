// Simple job description
const jobDescription = `
Data Engineer position requiring:
- Python programming
- Java development  
- Scala experience
- AWS cloud services
- Azure platform knowledge
`;

// Access internal functions by requiring the file and logging
console.log('Job Description:\n', jobDescription);
console.log('\n=== Testing Job Analysis ===\n');

// Create a minimal test to see what's being extracted
const { analyzeJobDescription } = require('./services/ats/atsScoringService');

try {
  const analysis = analyzeJobDescription(jobDescription);
  
  console.log('Technical Skills - Required:', analysis.technical.required);
  console.log('Technical Skills - Preferred:', analysis.technical.preferred);
  console.log('Technical Skills - All:', analysis.technical.all);
  console.log('\nSoft Skills:', analysis.soft);
  console.log('Years Required:', analysis.yearsRequired);
  console.log('Seniority:', analysis.seniority);
  console.log('Phrases:', analysis.phrases.slice(0, 10));
  console.log('Keywords:', analysis.keywords.slice(0, 10));
  
} catch (error) {
  console.error('Analysis failed:', error.message);
}


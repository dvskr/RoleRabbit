/**
 * TEST: Intelligent Keyword Limits
 * 
 * Verifies data-driven keyword limit calculation
 * Tests various scenarios (resume sizes, ATS scores, modes)
 */

const { calculateOptimalKeywordLimit, estimateResumePages } = require('./services/ai/intelligentKeywordLimits');

// Test scenarios
const scenarios = [
  {
    name: 'Entry-level, Sparse Resume, Low Score',
    resume: {
      experience: [
        { company: 'Company 1', bullets: ['Bullet 1', 'Bullet 2'] }
      ],
      projects: [],
      certifications: []
    },
    atsScore: 45,
    totalMissing: 30,
    mode: 'PARTIAL'
  },
  {
    name: 'Entry-level, Sparse Resume, Low Score (FULL)',
    resume: {
      experience: [
        { company: 'Company 1', bullets: ['Bullet 1', 'Bullet 2'] }
      ],
      projects: [],
      certifications: []
    },
    atsScore: 45,
    totalMissing: 30,
    mode: 'FULL'
  },
  {
    name: 'Mid-level, Standard Resume, Medium Score',
    resume: {
      experience: [
        { company: 'Company 1', bullets: ['B1', 'B2', 'B3', 'B4'] },
        { company: 'Company 2', bullets: ['B1', 'B2', 'B3', 'B4'] },
        { company: 'Company 3', bullets: ['B1', 'B2', 'B3', 'B4'] }
      ],
      projects: [
        { title: 'Project 1' },
        { title: 'Project 2' }
      ],
      certifications: []
    },
    atsScore: 62,
    totalMissing: 25,
    mode: 'PARTIAL'
  },
  {
    name: 'Mid-level, Standard Resume, Medium Score (FULL)',
    resume: {
      experience: [
        { company: 'Company 1', bullets: ['B1', 'B2', 'B3', 'B4'] },
        { company: 'Company 2', bullets: ['B1', 'B2', 'B3', 'B4'] },
        { company: 'Company 3', bullets: ['B1', 'B2', 'B3', 'B4'] }
      ],
      projects: [
        { title: 'Project 1' },
        { title: 'Project 2' }
      ],
      certifications: []
    },
    atsScore: 62,
    totalMissing: 25,
    mode: 'FULL'
  },
  {
    name: 'Senior, Dense Resume, Close to Target',
    resume: {
      experience: [
        { company: 'C1', bullets: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'] },
        { company: 'C2', bullets: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'] },
        { company: 'C3', bullets: ['B1', 'B2', 'B3', 'B4', 'B5'] },
        { company: 'C4', bullets: ['B1', 'B2', 'B3', 'B4', 'B5'] },
        { company: 'C5', bullets: ['B1', 'B2', 'B3', 'B4'] }
      ],
      projects: [
        { title: 'P1' }, { title: 'P2' }, { title: 'P3' }, 
        { title: 'P4' }, { title: 'P5' }
      ],
      certifications: []
    },
    atsScore: 76,
    totalMissing: 12,
    mode: 'PARTIAL'
  },
  {
    name: 'Senior, Dense Resume, Close to Target (FULL)',
    resume: {
      experience: [
        { company: 'C1', bullets: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'] },
        { company: 'C2', bullets: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'] },
        { company: 'C3', bullets: ['B1', 'B2', 'B3', 'B4', 'B5'] },
        { company: 'C4', bullets: ['B1', 'B2', 'B3', 'B4', 'B5'] },
        { company: 'C5', bullets: ['B1', 'B2', 'B3', 'B4'] }
      ],
      projects: [
        { title: 'P1' }, { title: 'P2' }, { title: 'P3' }, 
        { title: 'P4' }, { title: 'P5' }
      ],
      certifications: []
    },
    atsScore: 76,
    totalMissing: 12,
    mode: 'FULL'
  },
  {
    name: 'Executive, Very Dense Resume, Low Score',
    resume: {
      experience: Array.from({ length: 8 }, (_, i) => ({
        company: `Company ${i + 1}`,
        bullets: Array.from({ length: 6 }, (_, j) => `Bullet ${j + 1}`)
      })),
      projects: Array.from({ length: 6 }, (_, i) => ({ title: `Project ${i + 1}` })),
      certifications: []
    },
    atsScore: 48,
    totalMissing: 40,
    mode: 'PARTIAL'
  },
  {
    name: 'Executive, Very Dense Resume, Low Score (FULL)',
    resume: {
      experience: Array.from({ length: 8 }, (_, i) => ({
        company: `Company ${i + 1}`,
        bullets: Array.from({ length: 6 }, (_, j) => `Bullet ${j + 1}`)
      })),
      projects: Array.from({ length: 6 }, (_, i) => ({ title: `Project ${i + 1}` })),
      certifications: []
    },
    atsScore: 48,
    totalMissing: 40,
    mode: 'FULL'
  },
  {
    name: 'Edge Case: Very Few Missing Keywords',
    resume: {
      experience: [
        { company: 'C1', bullets: ['B1', 'B2', 'B3', 'B4'] },
        { company: 'C2', bullets: ['B1', 'B2', 'B3', 'B4'] }
      ],
      projects: [],
      certifications: []
    },
    atsScore: 72,
    totalMissing: 5,
    mode: 'PARTIAL'
  },
  {
    name: 'Edge Case: Already High Score',
    resume: {
      experience: [
        { company: 'C1', bullets: ['B1', 'B2', 'B3', 'B4', 'B5'] },
        { company: 'C2', bullets: ['B1', 'B2', 'B3', 'B4', 'B5'] },
        { company: 'C3', bullets: ['B1', 'B2', 'B3', 'B4'] }
      ],
      projects: [{ title: 'P1' }, { title: 'P2' }],
      certifications: []
    },
    atsScore: 82,
    totalMissing: 8,
    mode: 'FULL'
  }
];

console.log('\n🧪 Testing Intelligent Keyword Limits\n');
console.log('═'.repeat(100));
console.log('\nTARGETS:');
console.log('  • PARTIAL Mode: 80+ ATS score');
console.log('  • FULL Mode: 85+ ATS score\n');
console.log('═'.repeat(100));

scenarios.forEach((scenario, index) => {
  console.log(`\n\n📊 Test ${index + 1}: ${scenario.name}`);
  console.log('─'.repeat(100));
  
  const result = calculateOptimalKeywordLimit({
    mode: scenario.mode,
    atsScore: scenario.atsScore,
    totalMissing: scenario.totalMissing,
    resumeData: scenario.resume
  });
  
  const pages = estimateResumePages(scenario.resume);
  const target = scenario.mode === 'FULL' ? 85 : 80;
  const gap = target - scenario.atsScore;
  
  console.log(`\n  Input:`);
  console.log(`    Mode: ${scenario.mode}`);
  console.log(`    Current ATS: ${scenario.atsScore}/100`);
  console.log(`    Target: ${target}/100 (gap: +${gap} points)`);
  console.log(`    Total Missing: ${scenario.totalMissing} keywords`);
  console.log(`    Resume Size: ~${pages} page(s)`);
  
  console.log(`\n  Calculation:`);
  console.log(`    Capacity: ${result.reason.capacity} keywords (${result.reason.capacityReason})`);
  console.log(`    Need: ${result.reason.need} keywords (${result.reason.needReason})`);
  console.log(`    Limiting Factor: ${result.reason.limitingFactor}`);
  
  console.log(`\n  ✅ Result: ${result.limit} keywords`);
  
  // Analysis
  const efficiency = (result.limit / scenario.totalMissing * 100).toFixed(0);
  console.log(`\n  Analysis:`);
  console.log(`    Coverage: ${efficiency}% of missing keywords`);
  console.log(`    Strategy: ${result.limit < 10 ? 'Minimal touch' : result.limit < 20 ? 'Balanced' : 'Comprehensive'}`);
});

console.log('\n\n' + '═'.repeat(100));
console.log('\n✅ All scenarios tested!\n');

// Summary table
console.log('\n📋 Summary Table:\n');
console.log('┌─────┬──────────────────────────────────────────┬──────┬─────┬─────────┬────────┬────────┐');
console.log('│ #   │ Scenario                                 │ Mode │ ATS │ Missing │ Result │ Target │');
console.log('├─────┼──────────────────────────────────────────┼──────┼─────┼─────────┼────────┼────────┤');

scenarios.forEach((scenario, index) => {
  const result = calculateOptimalKeywordLimit({
    mode: scenario.mode,
    atsScore: scenario.atsScore,
    totalMissing: scenario.totalMissing,
    resumeData: scenario.resume
  });
  
  const target = scenario.mode === 'FULL' ? 85 : 80;
  const name = scenario.name.substring(0, 40).padEnd(40);
  const modeStr = scenario.mode.padEnd(6);
  const atsStr = String(scenario.atsScore).padStart(3);
  const missingStr = String(scenario.totalMissing).padStart(7);
  const resultStr = String(result.limit).padStart(6);
  const targetStr = String(target).padStart(6);
  
  console.log(`│ ${String(index + 1).padStart(3)} │ ${name} │ ${modeStr} │ ${atsStr} │ ${missingStr} │ ${resultStr} │ ${targetStr} │`);
});

console.log('└─────┴──────────────────────────────────────────┴──────┴─────┴─────────┴────────┴────────┘\n');


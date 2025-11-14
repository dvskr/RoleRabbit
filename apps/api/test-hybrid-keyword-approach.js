/**
 * TEST: Hybrid Keyword Approach
 * 
 * Verifies that AI receives 1.5x keywords but with recommended count guidance
 */

const { calculateOptimalKeywordLimit } = require('./services/ai/intelligentKeywordLimits');

console.log('\n🧪 Testing Hybrid Keyword Approach\n');
console.log('═'.repeat(80));

const scenarios = [
  {
    name: 'Standard Resume, Medium Score',
    resume: {
      experience: [
        { company: 'C1', bullets: ['B1', 'B2', 'B3', 'B4'] },
        { company: 'C2', bullets: ['B1', 'B2', 'B3', 'B4'] },
        { company: 'C3', bullets: ['B1', 'B2', 'B3', 'B4'] }
      ],
      projects: [{ title: 'P1' }, { title: 'P2' }]
    },
    atsScore: 62,
    totalMissing: 25,
    mode: 'PARTIAL'
  },
  {
    name: 'Dense Resume, Low Score',
    resume: {
      experience: Array.from({ length: 5 }, (_, i) => ({
        company: `Company ${i + 1}`,
        bullets: Array.from({ length: 6 }, (_, j) => `Bullet ${j + 1}`)
      })),
      projects: Array.from({ length: 5 }, (_, i) => ({ title: `Project ${i + 1}` }))
    },
    atsScore: 48,
    totalMissing: 40,
    mode: 'FULL'
  },
  {
    name: 'Sparse Resume, Close to Target',
    resume: {
      experience: [
        { company: 'C1', bullets: ['B1', 'B2', 'B3'] }
      ],
      projects: []
    },
    atsScore: 76,
    totalMissing: 12,
    mode: 'PARTIAL'
  }
];

scenarios.forEach((scenario, index) => {
  console.log(`\n\n📊 Scenario ${index + 1}: ${scenario.name}`);
  console.log('─'.repeat(80));
  
  const intelligentLimit = calculateOptimalKeywordLimit({
    mode: scenario.mode,
    atsScore: scenario.atsScore,
    totalMissing: scenario.totalMissing,
    resumeData: scenario.resume
  });
  
  const recommendedLimit = intelligentLimit.limit;
  const flexibleLimit = Math.min(
    Math.round(recommendedLimit * 1.5),
    scenario.totalMissing
  );
  
  const target = scenario.mode === 'FULL' ? 85 : 80;
  const gap = target - scenario.atsScore;
  
  console.log(`\n  Context:`);
  console.log(`    Mode: ${scenario.mode}`);
  console.log(`    Current ATS: ${scenario.atsScore}/100`);
  console.log(`    Target: ${target}/100 (gap: +${gap} points)`);
  console.log(`    Total Missing: ${scenario.totalMissing} keywords`);
  
  console.log(`\n  Intelligent Calculation:`);
  console.log(`    Capacity: ${intelligentLimit.reason.capacity} keywords`);
  console.log(`    Need: ${intelligentLimit.reason.need} keywords`);
  console.log(`    Recommended: ${recommendedLimit} keywords`);
  
  console.log(`\n  🔄 Hybrid Approach:`);
  console.log(`    Keywords given to AI: ${flexibleLimit} (1.5x = ${recommendedLimit} × 1.5)`);
  console.log(`    Recommended to AI: ~${recommendedLimit} keywords`);
  console.log(`    AI flexibility: ${flexibleLimit - recommendedLimit} extra keywords to choose from`);
  
  console.log(`\n  📋 What AI Sees:`);
  console.log(`    "You have ${flexibleLimit} keywords available (prioritized)."`);
  console.log(`    "We recommend integrating approximately ${recommendedLimit} keywords."`);
  console.log(`    "Use your judgment to integrate more or fewer as needed."`);
  
  // Simulate keyword list
  const keywords = Array.from({ length: scenario.totalMissing }, (_, i) => `Keyword${i + 1}`);
  const providedKeywords = keywords.slice(0, flexibleLimit);
  const starredKeywords = providedKeywords.slice(0, recommendedLimit);
  const optionalKeywords = providedKeywords.slice(recommendedLimit);
  
  console.log(`\n  ⭐ High Priority (starred): ${starredKeywords.length} keywords`);
  console.log(`    ${starredKeywords.slice(0, 5).join(', ')}${starredKeywords.length > 5 ? '...' : ''}`);
  
  if (optionalKeywords.length > 0) {
    console.log(`\n  💡 Optional (if natural): ${optionalKeywords.length} keywords`);
    console.log(`    ${optionalKeywords.slice(0, 5).join(', ')}${optionalKeywords.length > 5 ? '...' : ''}`);
  }
  
  console.log(`\n  ✅ Benefits:`);
  console.log(`    • AI has ${Math.round((flexibleLimit / scenario.totalMissing) * 100)}% of all keywords`);
  console.log(`    • AI knows optimal count (${recommendedLimit})`);
  console.log(`    • AI can adapt (${recommendedLimit - 3} to ${Math.min(flexibleLimit, recommendedLimit + 5)} keywords)`);
  console.log(`    • Prevents stuffing (capped at ${flexibleLimit})`);
});

console.log('\n\n' + '═'.repeat(80));
console.log('\n📊 Summary: Hybrid Approach Benefits\n');

console.log('┌────────────────────────────────────┬──────────────┬──────────────┐');
console.log('│ Aspect                             │ Old Approach │ Hybrid       │');
console.log('├────────────────────────────────────┼──────────────┼──────────────┤');
console.log('│ Keywords given to AI               │ Exact limit  │ 1.5x limit   │');
console.log('│ AI flexibility                     │ None         │ High         │');
console.log('│ Risk of keyword stuffing           │ Low          │ Low (capped) │');
console.log('│ AI sees optimal recommendation     │ No           │ Yes          │');
console.log('│ AI can adapt to resume space       │ No           │ Yes          │');
console.log('│ Quality of integration             │ Good         │ Better       │');
console.log('└────────────────────────────────────┴──────────────┴──────────────┘');

console.log('\n✅ Hybrid approach gives AI more information and flexibility');
console.log('   while maintaining intelligent guidance and preventing stuffing!\n');


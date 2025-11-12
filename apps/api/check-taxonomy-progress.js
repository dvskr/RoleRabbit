#!/usr/bin/env node
// Check progress on building 1600+ technology taxonomy

const { getStatistics } = require('./services/ats/allTaxonomies');

console.log('\n================================================================');
console.log('  TECHNOLOGY TAXONOMY BUILD PROGRESS');
console.log('================================================================\n');

const stats = getStatistics();

console.log(`📊 CURRENT STATUS:`);
console.log(`   Total Technologies: ${stats.totalTechnologies} / 1600 (${Math.round(stats.totalTechnologies / 1600 * 100)}%)`);
console.log(`   Last Updated: ${new Date(stats.lastUpdated).toLocaleString()}\n`);

console.log(`📁 BY CATEGORY:\n`);
Object.entries(stats.categories).forEach(([category, count]) => {
  const percentage = Math.round(count / stats.totalTechnologies * 100);
  const bar = '█'.repeat(Math.floor(percentage / 2));
  console.log(`   ${category.padEnd(20)} ${bar} ${count} (${percentage}%)`);
});

console.log(`\n📊 BY SKILL LEVEL:\n`);
Object.entries(stats.byLevel).forEach(([level, count]) => {
  const percentage = Math.round(count / stats.totalTechnologies * 100);
  console.log(`   ${level.padEnd(15)} ${count} (${percentage}%)`);
});

console.log(`\n🔥 BY POPULARITY:\n`);
Object.entries(stats.byPopularity).forEach(([pop, count]) => {
  const percentage = Math.round(count / stats.totalTechnologies * 100);
  console.log(`   ${pop.padEnd(15)} ${count} (${percentage}%)`);
});

// Calculate what's remaining
const remaining = 1600 - stats.totalTechnologies;
const percentComplete = Math.round(stats.totalTechnologies / 1600 * 100);

console.log(`\n\n================================================================`);
console.log(`  PROGRESS SUMMARY`);
console.log(`================================================================\n`);
console.log(`   ✅ Complete: ${stats.totalTechnologies} technologies`);
console.log(`   ⏳ Remaining: ${remaining} technologies`);
console.log(`   📈 Progress: ${percentComplete}%\n`);

if (percentComplete < 50) {
  console.log(`   Status: 🟡 Early stages - Continue building`);
} else if (percentComplete < 75) {
  console.log(`   Status: 🟢 Good progress - Halfway there!`);
} else if (percentComplete < 90) {
  console.log(`   Status: 🟢 Nearly complete - Final push!`);
} else {
  console.log(`   Status: ✅ COMPLETE - Ready for production!`);
}

console.log(`\n================================================================\n`);


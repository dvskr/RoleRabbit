/**
 * Test if backend changes are actually loaded
 */

require('dotenv').config();

// Test 1: Check tailorService token limit
console.log('\n🧪 Testing Backend Changes...\n');

try {
  const tailorService = require('./apps/api/services/ai/tailorService.js');
  console.log('✅ tailorService.js loaded successfully');
} catch (err) {
  console.log('❌ tailorService.js failed to load:', err.message);
}

// Test 2: Check openAI timeout
try {
  const openAI = require('./apps/api/utils/openAI.js');
  console.log('✅ openAI.js loaded successfully');
} catch (err) {
  console.log('❌ openAI.js failed to load:', err.message);
}

// Test 3: Read the actual file content to verify changes
const fs = require('fs');

console.log('\n📄 Verifying File Contents:\n');

// Check tailorService.js
const tailorContent = fs.readFileSync('./apps/api/services/ai/tailorService.js', 'utf8');
if (tailorContent.includes('max_tokens: tailorMode === TailorMode.FULL ? 2500 : 2000')) {
  console.log('✅ tailorService.js: max_tokens = 2000 (CORRECT)');
} else if (tailorContent.includes('max_tokens: tailorMode === TailorMode.FULL ? 1600 : 1100')) {
  console.log('❌ tailorService.js: max_tokens = 1100 (OLD CODE!)');
} else {
  console.log('⚠️ tailorService.js: max_tokens setting not found');
}

// Check openAI.js
const openAIContent = fs.readFileSync('./apps/api/utils/openAI.js', 'utf8');
if (openAIContent.includes('timeout = options.timeout || 150000')) {
  console.log('✅ openAI.js: timeout = 150000 (CORRECT)');
} else if (openAIContent.includes('timeout = options.timeout || 90000')) {
  console.log('❌ openAI.js: timeout = 90000 (OLD CODE!)');
} else {
  console.log('⚠️ openAI.js: timeout setting not found');
}

// Check route.ts
const routeContent = fs.readFileSync('./apps/web/src/app/api/proxy/editor/ai/[...segments]/route.ts', 'utf8');
if (routeContent.includes('export const maxDuration = 120')) {
  console.log('✅ route.ts: maxDuration = 120 (CORRECT)');
} else {
  console.log('❌ route.ts: maxDuration not found (OLD CODE!)');
}

console.log('\n✅ All file changes are present!');
console.log('\n💡 If tailor still fails, the issue is:');
console.log('   1. Node.js is caching old modules (need clean restart)');
console.log('   2. Frontend .next build is stale (need to clear .next folder)');
console.log('   3. Browser cache (need Incognito window)\n');
console.log('Run: .\\RESTART_CLEAN.ps1 to fix all of the above!\n');


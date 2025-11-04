/**
 * Script to regenerate Prisma client
 * Run this when the server is stopped to regenerate the Prisma client
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('Regenerating Prisma client...');

try {
  const apiPath = path.join(__dirname, '..');
  process.chdir(apiPath);
  
  execSync('npx prisma generate', {
    stdio: 'inherit',
    cwd: apiPath
  });
  
  console.log('✅ Prisma client regenerated successfully!');
  console.log('You can now restart your server.');
} catch (error) {
  console.error('❌ Error regenerating Prisma client:', error.message);
  console.error('\nMake sure the server is stopped before running this script.');
  process.exit(1);
}


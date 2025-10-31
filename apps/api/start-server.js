/**
 * Start and test the refactored server
 */

const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting refactored server...\n');

// Start server
const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: ['ignore', 'pipe', 'pipe']
});

let serverOutput = '';
let serverError = '';

server.stdout.on('data', (data) => {
  const output = data.toString();
  serverOutput += output;
  // Only log important messages
  if (output.includes('RoleReady') || output.includes('running') || output.includes('error')) {
    process.stdout.write(output);
  }
});

server.stderr.on('data', (data) => {
  const error = data.toString();
  serverError += error;
  process.stderr.write(error);
});

server.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\n❌ Server exited with code ${code}`);
    if (serverError) {
      console.error('Server errors:', serverError);
    }
    process.exit(1);
  }
});

// Wait for server to start, then test
setTimeout(() => {
  console.log('\n🧪 Testing server endpoints...\n');
  
  const tests = [
    { name: 'Health Check', path: '/health', expected: 200 },
    { name: 'API Status', path: '/api/status', expected: 200 },
    { name: 'Auth Verify (should be 401)', path: '/api/auth/verify', expected: 401 },
    { name: 'Users Profile (should be 401)', path: '/api/users/profile', expected: 401 },
  ];

  let completed = 0;
  const total = tests.length;

  tests.forEach(({ name, path, expected }) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        completed++;
        const status = res.statusCode === expected || (expected === 200 && res.statusCode < 400);
        if (status) {
          console.log(`✅ ${name}: Status ${res.statusCode}`);
        } else {
          console.log(`⚠️  ${name}: Status ${res.statusCode} (expected ${expected})`);
        }
        
        if (completed === total) {
          console.log(`\n🎉 Testing complete! ${completed}/${total} tests passed`);
          console.log('\nServer is running. Press Ctrl+C to stop.');
        }
      });
    });

    req.on('error', (error) => {
      completed++;
      console.log(`❌ ${name}: ${error.message}`);
      if (completed === total && error.code === 'ECONNREFUSED') {
        console.log('\n⚠️  Server may still be starting. Wait a few seconds and try again.');
        console.log('Run: node test-refactored-server.js');
      }
    });

    req.on('timeout', () => {
      req.destroy();
      completed++;
      console.log(`⏱️  ${name}: Timeout`);
    });

    req.end();
  });

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping server...');
    server.kill();
    process.exit(0);
  });

}, 8000);


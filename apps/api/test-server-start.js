/**
 * Simple test to verify server can start
 */
const http = require('http');

console.log('Testing if server is running on http://localhost:3001...\n');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`✓ Server is running!`);
    console.log(`  Status: ${res.statusCode}`);
    console.log(`  Response: ${data.substring(0, 100)}...`);
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.log(`✗ Server is not running`);
  console.log(`  Error: ${error.message}`);
  console.log(`\nPlease start the server with: node server.js`);
  process.exit(1);
});

req.setTimeout(2000, () => {
  console.log(`✗ Connection timeout`);
  console.log(`  Server may not be running on port 3001`);
  process.exit(1);
});

req.end();


#!/usr/bin/env node
/**
 * Master startup script for RoleReady Hybrid Backend
 * Starts both Python and Node.js backends
 */

const { spawn } = require('child_process');
const path = require('path');

let pythonProcess = null;
let nodeProcess = null;

function startPythonBackend() {
  console.log('🐍 Starting Python Backend...');
  
  pythonProcess = spawn('python', ['start.py'], {
    cwd: path.join(__dirname, 'apps', 'api-python'),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: '8000' }
  });

  pythonProcess.on('error', (err) => {
    console.error('❌ Python backend error:', err);
  });

  pythonProcess.on('close', (code) => {
    console.log(`🐍 Python backend stopped with code ${code}`);
  });

  return pythonProcess;
}

function startNodeBackend() {
  console.log('🟢 Starting Node.js Backend...');
  
  nodeProcess = spawn('node', ['start.js'], {
    cwd: path.join(__dirname, 'apps', 'api'),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: '3001' }
  });

  nodeProcess.on('error', (err) => {
    console.error('❌ Node.js backend error:', err);
  });

  nodeProcess.on('close', (code) => {
    console.log(`🟢 Node.js backend stopped with code ${code}`);
  });

  return nodeProcess;
}

function startFrontend() {
  console.log('⚛️ Starting Frontend...');
  
  const frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'apps', 'web'),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: '3000' }
  });

  frontendProcess.on('error', (err) => {
    console.error('❌ Frontend error:', err);
  });

  frontendProcess.on('close', (code) => {
    console.log(`⚛️ Frontend stopped with code ${code}`);
  });

  return frontendProcess;
}

function gracefulShutdown() {
  console.log('\n🛑 Shutting down all services...');
  
  if (pythonProcess) {
    pythonProcess.kill('SIGINT');
  }
  
  if (nodeProcess) {
    nodeProcess.kill('SIGINT');
  }
  
  setTimeout(() => {
    console.log('✅ All services stopped');
    process.exit(0);
  }, 2000);
}

async function main() {
  console.log('🚀 RoleReady Hybrid Backend Startup');
  console.log('=====================================');
  console.log('Starting Python Backend (AI & Auth) on port 8000');
  console.log('Starting Node.js Backend (Data & Storage) on port 3001');
  console.log('Starting Frontend on port 3000');
  console.log('=====================================\n');

  // Handle graceful shutdown
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  try {
    // Start backends with a small delay between them
    startPythonBackend();
    
    setTimeout(() => {
      startNodeBackend();
    }, 2000);
    
    setTimeout(() => {
      startFrontend();
    }, 4000);

    console.log('\n📊 Service URLs:');
    console.log('🐍 Python API: http://localhost:8000');
    console.log('🟢 Node.js API: http://localhost:3001');
    console.log('⚛️ Frontend: http://localhost:3000');
    console.log('\n💡 Press Ctrl+C to stop all services');

  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

main();

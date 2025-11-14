#!/usr/bin/env node
/**
 * Master startup script for RoleReady
 * Starts Node.js backend and Next.js frontend
 */

const { spawn } = require('child_process');
const path = require('path');

let nodeProcess = null;
let frontendProcess = null;

function startNodeBackend() {
  console.log('🟢 Starting Node.js Backend...');
  
  nodeProcess = spawn('node', ['server.js'], {
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
  
  frontendProcess = spawn('npm', ['run', 'dev'], {
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
  
  if (nodeProcess) {
    nodeProcess.kill('SIGINT');
  }
  
  if (frontendProcess) {
    frontendProcess.kill('SIGINT');
  }
  
  setTimeout(() => {
    console.log('✅ All services stopped');
    process.exit(0);
  }, 2000);
}

async function main() {
  console.log('🚀 RoleReady Startup');
  console.log('=====================================');
  console.log('Starting Node.js Backend (Fastify) on port 3001');
  console.log('Starting Next.js Frontend on port 3000');
  console.log('=====================================\n');

  // Handle graceful shutdown
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  try {
    // Start backend first
    startNodeBackend();
    
    // Start frontend after a small delay
    setTimeout(() => {
      startFrontend();
    }, 2000);

    console.log('\n📊 Service URLs:');
    console.log('🟢 Node.js API: http://localhost:3001');
    console.log('⚛️ Frontend: http://localhost:3000');
    console.log('\n💡 Press Ctrl+C to stop all services');

  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

main();

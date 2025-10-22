#!/usr/bin/env node
/**
 * Startup script for RoleReady Node.js Backend
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function installDependencies() {
  return new Promise((resolve, reject) => {
    console.log('📦 Installing Node.js dependencies...');
    const npm = spawn('npm', ['install'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });

    npm.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Node.js dependencies installed successfully');
        resolve();
      } else {
        console.log('❌ Failed to install Node.js dependencies');
        reject(new Error(`npm install failed with code ${code}`));
      }
    });
  });
}

function startServer() {
  console.log('🚀 Starting RoleReady Node.js Backend...');
  
  // Set environment variables
  const env = {
    ...process.env,
    PORT: '3001',
    HOST: 'localhost',
    NODE_ENV: 'development'
  };

  const server = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
    env
  });

  server.on('close', (code) => {
    console.log(`\n🛑 Node.js backend stopped with code ${code}`);
  });

  server.on('error', (err) => {
    console.error('❌ Failed to start Node.js server:', err);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Node.js backend...');
    server.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down Node.js backend...');
    server.kill('SIGTERM');
  });
}

async function main() {
  console.log('🟢 RoleReady Node.js Backend Startup');
  console.log('=' * 50);

  // Check if package.json exists
  if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
    console.log('❌ package.json not found. Please run this script from the api directory.');
    process.exit(1);
  }

  try {
    await installDependencies();
    startServer();
  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

main();

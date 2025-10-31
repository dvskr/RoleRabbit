#!/usr/bin/env node
/**
 * Startup script for RoleReady Node.js Backend
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('./utils/logger');

function installDependencies() {
  return new Promise((resolve, reject) => {
    logger.info('📦 Installing Node.js dependencies...');
    const npm = spawn('npm', ['install'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });

    npm.on('close', (code) => {
      if (code === 0) {
        logger.info('✅ Node.js dependencies installed successfully');
        resolve();
      } else {
        logger.error('❌ Failed to install Node.js dependencies');
        reject(new Error(`npm install failed with code ${code}`));
      }
    });
  });
}

function startServer() {
  logger.info('🚀 Starting RoleReady Node.js Backend...');
  
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
    logger.info(`\n🛑 Node.js backend stopped with code ${code}`);
  });

  server.on('error', (err) => {
    logger.error('❌ Failed to start Node.js server:', err);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logger.info('\n🛑 Shutting down Node.js backend...');
    server.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    logger.info('\n🛑 Shutting down Node.js backend...');
    server.kill('SIGTERM');
  });
}

async function main() {
  logger.info('🟢 RoleReady Node.js Backend Startup');
  logger.info('='.repeat(50));

  // Check if package.json exists
  if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
    logger.error('❌ package.json not found. Please run this script from the api directory.');
    process.exit(1);
  }

  try {
    await installDependencies();
    startServer();
  } catch (error) {
    logger.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

main();

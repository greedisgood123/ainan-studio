#!/usr/bin/env node

/**
 * Backend Setup Script for Ainan Studio
 * 
 * This script helps you set up the backend environment and start the server.
 * Run with: node setup-backend.js
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Ainan Studio Backend Setup\n');

// Check if we're in the right directory
const backendPath = path.join(__dirname, 'backend');
if (!fs.existsSync(backendPath)) {
  console.error('❌ Backend directory not found!');
  console.log('Make sure you\'re running this script from the project root directory.');
  process.exit(1);
}

// Check if backend package.json exists
const packageJsonPath = path.join(backendPath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Backend package.json not found!');
  process.exit(1);
}

// Check if .env file exists, create from template if not
const envPath = path.join(backendPath, '.env');
const envExamplePath = path.join(backendPath, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created');
    console.log('⚠️  Please edit backend/.env file with your settings!');
    console.log('   Especially change JWT_SECRET and admin credentials.\n');
  } else {
    console.error('❌ env.example file not found!');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(backendPath, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing backend dependencies...');
  
  const installProcess = spawn('npm', ['install'], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true
  });

  installProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Dependencies installed successfully\n');
      startServer();
    } else {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
  });

  installProcess.on('error', (err) => {
    console.error('❌ Error installing dependencies:', err.message);
    process.exit(1);
  });
} else {
  console.log('✅ Dependencies already installed\n');
  startServer();
}

function startServer() {
  console.log('🚀 Starting backend server...\n');
  
  const serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true
  });

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down backend server...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });

  serverProcess.on('error', (err) => {
    console.error('❌ Error starting server:', err.message);
  });
}

console.log('📋 Setup Summary:');
console.log('   1. Backend environment configured');
console.log('   2. Dependencies installed');
console.log('   3. Server starting on http://localhost:3001');
console.log('   4. Default admin: admin@ainanstudio.com / admin123');
console.log('\n⚠️  Remember to:');
console.log('   - Change default admin credentials in backend/.env');
console.log('   - Update JWT_SECRET in backend/.env');
console.log('   - Create frontend .env.local with VITE_API_BASE_URL=http://localhost:3001');
console.log('\n🎯 Next step: Update your frontend to use the local backend APIs');
console.log('   Check INTEGRATION_SETUP_GUIDE.md for detailed instructions.\n');

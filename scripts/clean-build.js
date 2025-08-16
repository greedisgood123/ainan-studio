import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import path from 'path';

console.log('🧹 Cleaning build for Cloudflare Pages...');

// Clean dist directory
const distPath = 'dist';
if (existsSync(distPath)) {
  console.log('🗑️  Removing existing dist directory...');
  rmSync(distPath, { recursive: true, force: true });
}

// Build the project
console.log('🔨 Building project...');
execSync('npm run build', { stdio: 'inherit' });

// Check for large files
console.log('🔍 Checking for large files...');
const largeFiles = execSync('Get-ChildItem -Path dist -Recurse | Where-Object {$_.Length -gt 25MB}', { 
  shell: 'powershell',
  encoding: 'utf8' 
});

if (largeFiles.trim()) {
  console.error('❌ Found large files:');
  console.error(largeFiles);
  process.exit(1);
} else {
  console.log('✅ No large files found. Build is ready for Cloudflare Pages!');
}

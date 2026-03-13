const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Google Maps Scraper Application...\n');

async function runCommand(command, cwd = __dirname, description) {
  return new Promise((resolve, reject) => {
    if (description) {
      console.log(`📦 ${description}...`);
    }
    
    const [cmd, ...args] = command.split(' ');
    const process = spawn(cmd, args, { 
      cwd, 
      stdio: 'pipe',
      shell: true 
    });
    
    let output = '';
    let errorOutput = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`   ✅ ${description} completed`);
        resolve(output);
      } else {
        console.log(`   ❌ ${description} failed`);
        console.log(`   Error: ${errorOutput}`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function setupApplication() {
  try {
    // Step 1: Install backend dependencies
    await runCommand('npm install', path.join(__dirname, 'backend'), 'Installing backend dependencies');
    
    // Step 2: Install frontend dependencies
    await runCommand('npm install', path.join(__dirname, 'frontend'), 'Installing frontend dependencies');
    
    // Step 3: Install root dependencies (Electron)
    await runCommand('npm install', __dirname, 'Installing root dependencies');
    
    // Step 4: Build frontend
    await runCommand('npm run build', path.join(__dirname, 'frontend'), 'Building frontend');
    
    console.log('\n✅ Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Ensure MongoDB is running');
    console.log('2. Run: npm run dev (for development)');
    console.log('3. Run: npm run build-win (to build Windows executable)');
    console.log('4. The installer will be in the dist folder');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n💡 Try running the commands manually:');
    console.log('cd backend && npm install');
    console.log('cd frontend && npm install');
    console.log('npm install');
    console.log('cd frontend && npm run build');
  }
}

// Check if Node.js is available
console.log('🔍 Checking Node.js...');
runCommand('node --version', __dirname, 'Checking Node.js version')
  .then(() => {
    console.log('✅ Node.js is available\n');
    setupApplication();
  })
  .catch((error) => {
    console.error('❌ Node.js is not available. Please install Node.js first.');
    process.exit(1);
  });
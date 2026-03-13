const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Fixing Tailwind CSS configuration...\n');

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
      if (description) console.log(`   ${data.toString().trim()}`);
    });
    
    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
      if (description) console.log(`   Error: ${data.toString().trim()}`);
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        if (description) console.log(`   ✅ ${description} completed`);
        resolve(output);
      } else {
        if (description) console.log(`   ❌ ${description} failed`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function fixTailwind() {
  try {
    const frontendPath = path.join(__dirname, 'frontend');
    
    // Step 1: Clear existing dependencies
    console.log('1️⃣ Clearing existing dependencies...');
    const nodeModulesPath = path.join(frontendPath, 'node_modules');
    const packageLockPath = path.join(frontendPath, 'package-lock.json');
    
    if (fs.existsSync(nodeModulesPath)) {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
      console.log('   ✅ Removed node_modules');
    }
    
    if (fs.existsSync(packageLockPath)) {
      fs.unlinkSync(packageLockPath);
      console.log('   ✅ Removed package-lock.json');
    }
    
    // Step 2: Reinstall dependencies
    console.log('\n2️⃣ Installing dependencies with correct versions...');
    await runCommand('npm install', frontendPath, 'Installing dependencies');
    
    // Step 3: Test the build
    console.log('\n3️⃣ Testing the build...');
    try {
      await runCommand('npm run build', frontendPath, 'Building frontend');
      console.log('\n✅ Tailwind CSS fix completed successfully!');
    } catch (error) {
      console.log('\n⚠️  Build test failed, but dependencies are installed');
      console.log('   You may need to manually test with: npm start');
    }
    
  } catch (error) {
    console.error('\n❌ Tailwind CSS fix failed:', error.message);
    console.log('\n💡 Manual steps:');
    console.log('1. cd frontend');
    console.log('2. rm -rf node_modules package-lock.json');
    console.log('3. npm install');
    console.log('4. npm start');
  }
}

// Run the fix
fixTailwind();
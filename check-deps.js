const fs = require('fs');
const path = require('path');

console.log('=== Checking Dependencies ===\n');

// Check backend dependencies
const backendPackagePath = path.join(__dirname, 'backend', 'package.json');
const frontendPackagePath = path.join(__dirname, 'frontend', 'package.json');

function checkDependencies(packagePath, name) {
  console.log(`Checking ${name} dependencies...`);
  
  if (!fs.existsSync(packagePath)) {
    console.log(`❌ ${name} package.json not found`);
    return;
  }
  
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const dependencies = Object.keys(packageData.dependencies || {});
  const nodeModulesPath = path.join(path.dirname(packagePath), 'node_modules');
  
  console.log(`Total dependencies: ${dependencies.length}`);
  
  let missing = [];
  dependencies.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep);
    if (!fs.existsSync(depPath)) {
      missing.push(dep);
    }
  });
  
  if (missing.length > 0) {
    console.log(`❌ Missing dependencies: ${missing.length}`);
    missing.forEach(dep => console.log(`   - ${dep}`));
    console.log(`💡 Fix: cd ${path.dirname(packagePath)} && npm install`);
  } else {
    console.log('✅ All dependencies installed');
  }
  
  console.log('');
}

checkDependencies(backendPackagePath, 'Backend');
checkDependencies(frontendPackagePath, 'Frontend');

// Check critical dependencies
console.log('\n=== Checking Critical Dependencies ===');
const criticalDeps = ['puppeteer', 'mongoose', 'express', 'axios', 'react', 'redux'];

criticalDeps.forEach(dep => {
  try {
    require.resolve(dep);
    console.log(`✅ ${dep} - Available`);
  } catch (error) {
    console.log(`❌ ${dep} - Missing`);
  }
});
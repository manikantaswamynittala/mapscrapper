const fs = require('fs');
const path = require('path');

console.log('🔍 Quick Status Check for Google Maps Scraper\n');

// Check if node_modules exist
const checkNodeModules = (dir) => {
  const nodeModulesPath = path.join(dir, 'node_modules');
  return fs.existsSync(nodeModulesPath);
};

// Check package.json
const checkPackageJson = (dir) => {
  const packagePath = path.join(dir, 'package.json');
  return fs.existsSync(packagePath);
};

console.log('📁 Directory Status:');
console.log('==================');

// Check root directory
console.log(`Root directory: ${checkPackageJson('.') ? '✅ package.json found' : '❌ package.json missing'}`);
console.log(`Root node_modules: ${checkNodeModules('.') ? '✅ installed' : '❌ not installed'}`);

// Check backend
console.log(`Backend directory: ${checkPackageJson('backend') ? '✅ package.json found' : '❌ package.json missing'}`);
console.log(`Backend node_modules: ${checkNodeModules('backend') ? '✅ installed' : '❌ not installed'}`);

// Check frontend
console.log(`Frontend directory: ${checkPackageJson('frontend') ? '✅ package.json found' : '❌ package.json missing'}`);
console.log(`Frontend node_modules: ${checkNodeModules('frontend') ? '✅ installed' : '❌ not installed'}`);

console.log('\n🚀 Next Steps:');
console.log('==============');

if (!checkNodeModules('.') || !checkNodeModules('backend') || !checkNodeModules('frontend')) {
  console.log('1. Install dependencies: npm run install:all');
  console.log('2. Wait for installation to complete');
  console.log('3. Run: node quick-status-check.js to verify');
} else {
  console.log('✅ All dependencies installed!');
  console.log('1. Start MongoDB service');
  console.log('2. Run: node test-application.js');
  console.log('3. Start development: npm run dev');
}

console.log('\n📋 Available Scripts:');
console.log('===================');
console.log('npm run install:all    - Install all dependencies');
console.log('npm run dev           - Start development mode');
console.log('npm run build         - Build for production');
console.log('npm run start         - Start Electron app');
console.log('node test-application.js - Run comprehensive tests');
console.log('node check-all-errors.js - Check for any remaining errors');
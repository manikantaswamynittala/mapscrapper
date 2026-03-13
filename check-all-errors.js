const fs = require('fs');
const path = require('path');

console.log('🔍 Comprehensive Error Check for Google Maps Scraper\n');

const errors = [];
const warnings = [];

// 1. Check file structure
console.log('1️⃣ Checking file structure...');
const requiredFiles = [
  'main.js',
  'preload.js',
  'package.json',
  'backend/server.js',
  'backend/package.json',
  'backend/models/Business.js',
  'backend/routes/scraperRoutes.js',
  'backend/routes/businessRoutes.js',
  'backend/services/scraperService.js',
  'backend/services/excelService.js',
  'frontend/package.json',
  'frontend/src/App.js',
  'frontend/src/index.js',
  'frontend/src/app/store.js',
  'frontend/src/components/SearchForm.js',
  'frontend/src/components/BusinessList.js',
  'frontend/src/components/ExportButton.js',
  'frontend/src/features/scraper/scraperSlice.js',
  'frontend/src/features/business/businessSlice.js',
  'assets/icon.svg'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    errors.push(`Missing file: ${file}`);
  }
});

// 2. Check package.json files
console.log('\n2️⃣ Checking package.json files...');

try {
  // Main package.json
  const mainPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (mainPackage.devDependencies && mainPackage.devDependencies.electron) {
    console.log(`   ✅ Main package.json has Electron`);
  } else {
    console.log(`   ❌ Main package.json missing Electron`);
    errors.push('Main package.json missing Electron dependency');
  }

  // Backend package.json
  const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  const requiredBackendDeps = ['express', 'mongoose', 'cors', 'dotenv', 'puppeteer', 'exceljs'];
  requiredBackendDeps.forEach(dep => {
    if (backendPackage.dependencies && backendPackage.dependencies[dep]) {
      console.log(`   ✅ Backend has ${dep}`);
    } else {
      console.log(`   ❌ Backend missing ${dep}`);
      errors.push(`Backend missing dependency: ${dep}`);
    }
  });

  // Frontend package.json
  const frontendPackage = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  const requiredFrontendDeps = ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit', 'axios'];
  requiredFrontendDeps.forEach(dep => {
    if (frontendPackage.dependencies && frontendPackage.dependencies[dep]) {
      console.log(`   ✅ Frontend has ${dep}`);
    } else {
      console.log(`   ❌ Frontend missing ${dep}`);
      errors.push(`Frontend missing dependency: ${dep}`);
    }
  });

} catch (error) {
  console.log(`   ❌ Error reading package.json files: ${error.message}`);
  errors.push(`Error reading package.json: ${error.message}`);
}

// 3. Check configuration files
console.log('\n3️⃣ Checking configuration files...');

// Tailwind config
if (fs.existsSync('frontend/tailwind.config.js')) {
  console.log('   ✅ Tailwind config exists');
} else {
  console.log('   ❌ Tailwind config missing');
  errors.push('Missing Tailwind config');
}

// PostCSS config
if (fs.existsSync('frontend/postcss.config.js')) {
  console.log('   ✅ PostCSS config exists');
} else {
  console.log('   ❌ PostCSS config missing');
  errors.push('Missing PostCSS config');
}

// Check if index.css uses CDN (which is good for our fix)
if (fs.existsSync('frontend/src/index.css')) {
  const indexCss = fs.readFileSync('frontend/src/index.css', 'utf8');
  if (indexCss.includes('cdn.jsdelivr.net')) {
    console.log('   ✅ index.css uses CDN (Tailwind fix applied)');
  } else if (indexCss.includes('@tailwind')) {
    console.log('   ⚠️  index.css uses @tailwind (may cause compilation issues)');
    warnings.push('index.css uses @tailwind - may need CDN fix');
  } else {
    console.log('   ❌ index.css has unexpected content');
    errors.push('index.css has unexpected content');
  }
}

// 4. Check main.js configuration
console.log('\n4️⃣ Checking main.js configuration...');
try {
  const mainJs = fs.readFileSync('main.js', 'utf8');
  
  if (mainJs.includes('assets/icon.svg')) {
    console.log('   ✅ Icon path updated to .svg');
  } else if (mainJs.includes('assets/icon.png')) {
    console.log('   ❌ Icon path still references .png');
    errors.push('main.js references icon.png instead of icon.svg');
  }

  if (mainJs.includes('contextIsolation: false')) {
    console.log('   ⚠️  contextIsolation is false (security concern)');
    warnings.push('contextIsolation is disabled in main.js');
  }

  if (mainJs.includes('nodeIntegration: true')) {
    console.log('   ⚠️  nodeIntegration is true (security concern)');
    warnings.push('nodeIntegration is enabled in main.js');
  }
} catch (error) {
  console.log(`   ❌ Error reading main.js: ${error.message}`);
  errors.push(`Error reading main.js: ${error.message}`);
}

// 5. Check backend server configuration
console.log('\n5️⃣ Checking backend configuration...');
try {
  const serverJs = fs.readFileSync('backend/server.js', 'utf8');
  
  if (serverJs.includes('mongoose.connect')) {
    console.log('   ✅ MongoDB connection configured');
  } else {
    console.log('   ❌ MongoDB connection not found');
    errors.push('MongoDB connection missing in server.js');
  }

  if (serverJs.includes('cors()')) {
    console.log('   ✅ CORS enabled');
  } else {
    console.log('   ❌ CORS not enabled');
    errors.push('CORS not enabled in server.js');
  }
} catch (error) {
  console.log(`   ❌ Error reading server.js: ${error.message}`);
  errors.push(`Error reading server.js: ${error.message}`);
}

// 6. Check for missing directories
console.log('\n6️⃣ Checking for required directories...');
const requiredDirs = ['backend', 'frontend', 'frontend/src', 'frontend/src/components', 'frontend/src/features', 'frontend/src/app', 'assets'];
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`   ✅ ${dir}`);
  } else {
    console.log(`   ❌ ${dir} - MISSING`);
    errors.push(`Missing directory: ${dir}`);
  }
});

// 7. Summary
console.log('\n' + '='.repeat(50));
console.log('📋 ERROR CHECK SUMMARY');
console.log('='.repeat(50));

if (errors.length === 0) {
  console.log('✅ No critical errors found!');
} else {
  console.log(`❌ Found ${errors.length} critical errors:`);
  errors.forEach(error => console.log(`   • ${error}`));
}

if (warnings.length > 0) {
  console.log(`\n⚠️  Found ${warnings.length} warnings:`);
  warnings.forEach(warning => console.log(`   • ${warning}`));
}

console.log('\n💡 Next Steps:');
if (errors.length > 0) {
  console.log('1. Fix the critical errors listed above');
  console.log('2. Run: node check-all-errors.js again to verify');
} else {
  console.log('1. Install dependencies: npm run install:all');
  console.log('2. Start MongoDB service');
  console.log('3. Test the application: node test-application.js');
  console.log('4. Start development: npm run dev');
}

console.log('\n📚 For help, check:');
console.log('• README.md - Setup instructions');
console.log('• TAILWIND_TROUBLESHOOTING.md - CSS issues');
console.log('• PROJECT_SUMMARY.md - Project overview');
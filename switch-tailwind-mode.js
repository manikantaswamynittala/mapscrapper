const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'frontend', 'src', 'index.css');
const cdnPath = path.join(__dirname, 'frontend', 'src', 'index-cdn.css');
const backupPath = path.join(__dirname, 'frontend', 'src', 'index-backup.css');

function switchToCDN() {
  console.log('🔄 Switching to CDN Tailwind CSS...');
  
  // Backup current index.css
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, backupPath);
    console.log('   ✅ Backed up current index.css');
  }
  
  // Replace with CDN version
  if (fs.existsSync(cdnPath)) {
    fs.copyFileSync(cdnPath, indexPath);
    console.log('   ✅ Switched to CDN version');
    console.log('   📋 Next: Restart your development server');
  } else {
    console.log('   ❌ CDN version not found');
  }
}

function switchToNPM() {
  console.log('🔄 Switching to NPM Tailwind CSS...');
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, indexPath);
    console.log('   ✅ Restored NPM version');
    console.log('   📋 Next: Restart your development server');
  } else {
    console.log('   ❌ Backup not found');
  }
}

function showStatus() {
  const currentContent = fs.readFileSync(indexPath, 'utf8');
  if (currentContent.includes('cdn.jsdelivr.net')) {
    console.log('📊 Current mode: CDN (External)');
  } else if (currentContent.includes('@tailwind')) {
    console.log('📊 Current mode: NPM (Local)');
  } else {
    console.log('📊 Current mode: Unknown');
  }
}

// Parse command line arguments
const mode = process.argv[2];

switch (mode) {
  case 'cdn':
    switchToCDN();
    break;
  case 'npm':
    switchToNPM();
    break;
  case 'status':
    showStatus();
    break;
  default:
    console.log('Usage: node switch-tailwind-mode.js [cdn|npm|status]');
    console.log('  cdn    - Switch to CDN version');
    console.log('  npm    - Switch to NPM version');
    console.log('  status - Show current mode');
}

console.log('\n💡 Tip: Use "node switch-tailwind-mode.js status" to check current mode');
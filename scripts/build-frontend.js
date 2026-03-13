const { exec } = require('child_process');
const path = require('path');

console.log('Building frontend...');

const frontendPath = path.join(__dirname, '..', 'frontend');
const buildProcess = exec('npm run build', { cwd: frontendPath });

buildProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

buildProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Frontend build completed successfully!');
  } else {
    console.error(`❌ Frontend build failed with code ${code}`);
    process.exit(1);
  }
});
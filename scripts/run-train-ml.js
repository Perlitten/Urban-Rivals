const { spawnSync } = require('child_process');
const path = require('path');

// Determine which script to run depending on the platform
const script = process.platform === 'win32'
  ? path.join(__dirname, 'train-ml-models.bat')
  : path.join(__dirname, 'train-ml-models.sh');

const result = spawnSync(script, { stdio: 'inherit', shell: true });

if (result.error) {
  console.error('ML training failed:', result.error);
  process.exit(1);
}
process.exit(result.status);

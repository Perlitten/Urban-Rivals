const fs = require('fs');
const path = require('path');

// Attempt to locate models_metadata.json
const locations = [
  path.join(__dirname, '..', 'public', 'assets', 'models', 'models_metadata.json'),
  path.join(__dirname, '..', 'trained_models', 'models_metadata.json')
];

let metaPath = null;
for (const loc of locations) {
  if (fs.existsSync(loc)) {
    metaPath = loc;
    break;
  }
}

if (!metaPath) {
  console.error('❌ models_metadata.json not found. Run "npm run train:ml" first.');
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
console.log('📊 ML Model Status');
console.log('==================');
console.log(`Metadata file: ${metaPath}`);
console.log(`Version: ${metadata.version}`);
console.log(`Created: ${metadata.created}`);

if (metadata.models) {
  for (const [name, info] of Object.entries(metadata.models)) {
    let line = `- ${name}`;
    if (info.accuracy !== undefined) line += ` accuracy: ${info.accuracy}`;
    if (info.mse !== undefined) line += ` MSE: ${info.mse}`;
    console.log(line);
  }
}

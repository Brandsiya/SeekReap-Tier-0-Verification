#!/usr/bin/env node

console.log('🧪 SeekReap Tier 0 Test');
console.log('=======================');

// Test 1: CLI loads and shows version
try {
  const { execSync } = require('child_process');
  const output = execSync('node cli.js --version', { encoding: 'utf8' }).trim();
  
  // Check for required strings in output
  const requiredStrings = [
    'seekreap/1.1.0',
    'Tier 0 (OSS Pilot)',
    'Status: FROZEN',
    'Build: source',
    'Deterministic: declared'
  ];
  
  let allPresent = true;
  for (const str of requiredStrings) {
    if (!output.includes(str)) {
      console.log(`❌ Missing in output: "${str}"`);
      allPresent = false;
    }
  }
  
  if (allPresent) {
    console.log('✅ CLI version correct');
  } else {
    console.log('❌ CLI version output incorrect');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ CLI failed to run:', error.message);
  process.exit(1);
}

// Test 2: Package version matches
const packageJson = require('./package.json');
if (packageJson.version === '1.1.0') {
  console.log(`✅ Package version correct: ${packageJson.version}`);
} else {
  console.log(`❌ Package version incorrect: ${packageJson.version}`);
  process.exit(1);
}

// Test 3: Determinism check (no timestamps in output)
try {
  const { execSync } = require('child_process');
  const output = execSync('node cli.js --version', { encoding: 'utf8' });
  
  // Check for timestamp patterns that should NOT be present
  // These are patterns that would indicate non-deterministic output
  const timestampPatterns = [
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,  // ISO timestamp
    /\d{2}:\d{2}:\d{2}\.\d{3}/,             // HH:MM:SS.mmm
    /20[0-9]{2}-[01][0-9]-[0-3][0-9]/,      // YYYY-MM-DD
    /\d{1,2}\/\d{1,2}\/20[0-9]{2}/,         // MM/DD/YYYY
    /\d{1,2}:[0-5][0-9]:[0-5][0-9]/         // HH:MM:SS
  ];
  
  let hasTimestamp = false;
  for (const pattern of timestampPatterns) {
    if (pattern.test(output)) {
      console.log(`❌ Found timestamp pattern: ${pattern}`);
      hasTimestamp = true;
      break;
    }
  }
  
  if (!hasTimestamp) {
    console.log('✅ No timestamps in output');
  } else {
    console.log('❌ Output contains timestamps');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Failed to check timestamps:', error.message);
  process.exit(1);
}

console.log('\n✅ All Tier 0 tests passed');
console.log('Tier 0 is frozen and complete.');

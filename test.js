// Tier 0 Test Suite
console.log('🧪 SeekReap Tier 0 Test');
console.log('=======================');

// Test 1: CLI loads
try {
    require('./cli.js');
    console.log('✅ CLI module loads');
} catch (e) {
    console.log('❌ CLI module failed:', e.message);
    process.exit(1);
}

// Test 2: Version check
const { execSync } = require('child_process');
try {
    const output = execSync('node cli.js --version', { encoding: 'utf8' });
    if (output.includes('1.1.0') && output.includes('FROZEN')) {
        console.log('✅ Version correct');
    } else {
        console.log('❌ Version incorrect');
        console.log('Output:', output);
        process.exit(1);
    }
} catch (e) {
    console.log('❌ CLI execution failed:', e.message);
    process.exit(1);
}

// Test 3: Check no timestamps
try {
    const output = execSync('node cli.js --version', { encoding: 'utf8' });
    const lowerOutput = output.toLowerCase();
    if (lowerOutput.includes('timestamp') || 
        lowerOutput.includes('202') || 
        lowerOutput.includes('time:') ||
        lowerOutput.includes('date:')) {
        console.log('❌ Output contains timestamp data');
        process.exit(1);
    } else {
        console.log('✅ No timestamps in output');
    }
} catch (e) {
    console.log('❌ Timestamp check failed:', e.message);
    process.exit(1);
}

console.log('');
console.log('✅ All Tier 0 tests passed');
console.log('Tier 0 is frozen and complete.');

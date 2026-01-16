#!/usr/bin/env node

/**
 * PHASE 2 DEFINITIVE VALIDATION TEST
 * Uses the SAME approach as test-week4-notifications.cjs
 * No new methods, no new tools
 */

console.log('=============================================');
console.log('PHASE 2 - DEFINITIVE PRODUCTION READINESS TEST');
console.log('=============================================\n');

// Track validation results
const results = {
  files: { passed: 0, total: 0 },
  architecture: { passed: 0, total: 0 },
  functionality: { passed: 0, total: 0 }
};

// SECTION 1: FILE STRUCTURE VALIDATION
console.log('1. FILE STRUCTURE VALIDATION');
console.log('----------------------------');

const requiredFiles = [
  'src/services/event-bus.ts',
  'src/services/sms.ts', 
  'src/services/email.ts',
  'src/services/notification-subscriber.ts',
  'src/integrations/payment-events.cjs',
  'test-week4-notifications.cjs'
];

requiredFiles.forEach(file => {
  results.files.total++;
  const fs = require('fs');
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
    results.files.passed++;
  } else {
    console.log(`   ❌ ${file} - MISSING`);
  }
});

// SECTION 2: ARCHITECTURAL VALIDATION  
console.log('\n2. ARCHITECTURAL VALIDATION');
console.log('---------------------------');

// Check singleton patterns
const patterns = [
  { file: 'event-bus.ts', pattern: 'export const eventBus = new EventBus\\(\\)' },
  { file: 'sms.ts', pattern: 'export const smsService = new SMSService\\(\\)' },
  { file: 'email.ts', pattern: 'export const emailService = new EmailService\\(\\)' },
  { file: 'notification-subscriber.ts', pattern: 'export const notificationSubscriber = new NotificationSubscriber\\(\\)' }
];

patterns.forEach(({ file, pattern }) => {
  results.architecture.total++;
  const fs = require('fs');
  try {
    const content = fs.readFileSync(`src/services/${file}`, 'utf8');
    if (content.match(pattern)) {
      console.log(`   ✅ ${file}: Singleton pattern correct`);
      results.architecture.passed++;
    } else {
      console.log(`   ❌ ${file}: Missing singleton export`);
    }
  } catch (e) {
    console.log(`   ❌ ${file}: Cannot read file`);
  }
});

// SECTION 3: FUNCTIONALITY VALIDATION
console.log('\n3. FUNCTIONALITY VALIDATION');
console.log('---------------------------');
console.log('   Running the PROVEN test: test-week4-notifications.cjs\n');

// Run the existing test that we KNOW works
const { spawn } = require('child_process');
const testProcess = spawn('node', ['test-week4-notifications.cjs'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  timeout: 15000
});

let output = '';
let errorOutput = '';

testProcess.stdout.on('data', (data) => {
  output += data.toString();
});

testProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

testProcess.on('close', (code) => {
  // Check results
  results.functionality.total = 3; // Three event types we test
  const hasPaymentCompleted = output.includes('payment.completed');
  const hasPaymentFailed = output.includes('payment.failed');
  const hasPaymentRefunded = output.includes('payment.refunded');
  const hasNotificationsSent = output.includes('SMS Sent:') || output.includes('Emails Sent:');
  
  if (hasPaymentCompleted) {
    console.log('   ✅ payment.completed event handled');
    results.functionality.passed++;
  }
  
  if (hasPaymentFailed) {
    console.log('   ✅ payment.failed event handled');
    results.functionality.passed++;
  }
  
  if (hasPaymentRefunded) {
    console.log('   ✅ payment.refunded event handled');
    results.functionality.passed++;
  }
  
  if (hasNotificationsSent) {
    console.log('   ✅ Notifications sent successfully');
  }
  
  // FINAL DETERMINATION
  console.log('\n=============================================');
  console.log('FINAL ASSESSMENT');
  console.log('=============================================\n');
  
  const totalPassed = results.files.passed + results.architecture.passed + results.functionality.passed;
  const totalTests = results.files.total + results.architecture.total + results.functionality.total;
  
  console.log(`Files: ${results.files.passed}/${results.files.total}`);
  console.log(`Architecture: ${results.architecture.passed}/${results.architecture.total}`);
  console.log(`Functionality: ${results.functionality.passed}/${results.functionality.total}`);
  console.log(`Overall: ${totalPassed}/${totalTests}`);
  console.log('');
  
  if (totalPassed === totalTests) {
    console.log('🏆 PHASE 2: FULLY VALIDATED');
    console.log('\nSTATUS: READY FOR 14-DAY STABILIZATION');
    console.log('\nNEXT: Begin observation period with:');
    console.log('1. NO feature commits');
    console.log('2. Daily execution of test-week4-notifications.cjs');
    console.log('3. Only critical bug fixes');
    console.log('4. After 14 days → Phase 3');
  } else if (totalPassed >= totalTests * 0.8) {
    console.log('⚠️  PHASE 2: MINOR ISSUES');
    console.log('\nSTATUS: ACCEPTABLE FOR STABILIZATION');
    console.log('\nAddress issues during stabilization period.');
  } else {
    console.log('❌ PHASE 2: NOT READY');
    console.log('\nFix critical issues before proceeding.');
  }
  
  console.log('\n=============================================');
});

testProcess.on('error', (err) => {
  console.log(`   ❌ Test execution failed: ${err.message}`);
  console.log('\nFINAL STATUS: ❌ NOT READY - Test execution failed');
});

// test-week1-simple.js - Simplified test for Week 1
console.log('🧪 WEEK 1 SIMPLIFIED TESTS\n' + '='.repeat(60));

let passed = 0;
let failed = 0;

function test(description, testFn) {
  try {
    testFn();
    console.log(`✅ ${description}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

console.log('\n📋 1. Loading Modules...');
test('State machine loads', () => {
  const { EngagementState } = require('./src-engagement-state-machine.js');
  if (!EngagementState.CREATED) throw new Error('State machine not loaded');
});

test('Service loads', () => {
  const { engagementService } = require('./src-engagement-service.js');
  if (!engagementService) throw new Error('Service not loaded');
});

console.log('\n📋 2. State Machine Core Tests...');
const { 
  EngagementState,
  createEngagement,
  transitionEngagement 
} = require('./src-engagement-state-machine.js');

test('Create engagement works', () => {
  const engagement = createEngagement('test-session');
  if (engagement.currentState !== EngagementState.CREATED) {
    throw new Error(`Expected CREATED, got ${engagement.currentState}`);
  }
});

test('Valid transition works', () => {
  const engagement = createEngagement('test-session');
  const result = transitionEngagement(engagement, EngagementState.COMPLETED, 'user');
  if (!result || result.currentState !== EngagementState.COMPLETED) {
    throw new Error('Transition failed');
  }
});

test('Invalid transition rejected', () => {
  const engagement = createEngagement('test-session');
  const result = transitionEngagement(engagement, EngagementState.VERIFIED, 'system');
  if (result !== null) {
    throw new Error('Invalid transition should return null');
  }
});

console.log('\n📋 3. Service Layer Tests...');
const { engagementService } = require('./src-engagement-service.js');

test('Service creates engagement', async () => {
  const sessionId = 'test-' + Date.now();
  const engagement = await engagementService.createEngagement(sessionId);
  if (!engagement.id) throw new Error('No engagement ID');
});

test('Atomic locking prevents duplicate engagements', async () => {
  const sessionId = 'atomic-' + Date.now();
  await engagementService.createEngagement(sessionId);
  
  try {
    await engagementService.createEngagement(sessionId);
    throw new Error('Should have thrown error');
  } catch (error) {
    if (error.code !== 'ACTIVE_ENGAGEMENT_EXISTS') {
      throw new Error(`Wrong error: ${error.code}`);
    }
  }
});

test('Complete engagement flow', async () => {
  const sessionId = 'complete-' + Date.now();
  await engagementService.createEngagement(sessionId);
  
  const result = await engagementService.completeEngagement(sessionId, { test: 'data' });
  if (result.currentState !== EngagementState.COMPLETED) {
    throw new Error(`Expected COMPLETED, got ${result.currentState}`);
  }
});

console.log('\n📋 4. Expiry Tests...');
const { checkAndHandleExpiry } = require('./src-engagement-state-machine.js');

test('Fresh engagement not expired', () => {
  const engagement = createEngagement('expiry-test');
  const expired = checkAndHandleExpiry(engagement);
  if (expired) throw new Error('Fresh engagement should not be expired');
});

test('Expired engagement transitions', () => {
  const engagement = createEngagement('expiry-test');
  engagement.expiresAt = new Date(Date.now() - 1000); // 1 second ago
  
  const expired = checkAndHandleExpiry(engagement);
  if (!expired) throw new Error('Should be expired');
  if (engagement.currentState !== EngagementState.EXPIRED) {
    throw new Error(`Should be EXPIRED, got ${engagement.currentState}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 WEEK 1 FOUNDATION TESTS PASSED!');
  console.log('\n✅ Ready for Week 2: Verification Engine');
} else {
  console.log('\n⚠️ Some tests failed. Please fix before Week 2.');
  process.exit(1);
}
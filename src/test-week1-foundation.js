// test-week1-foundation.js
const { 
  engagementService,
  EngagementError 
} = require('./src-engagement-service.cjs');

const { 
  EngagementState,
  EngagementStateMachine,
  createEngagement,
  transitionEngagement,
  checkAndHandleExpiry,
  validateEngagement,
  isActiveState
} = require('./src-engagement-state-machine.cjs');

console.log('🧪 WEEK 1 FOUNDATION TESTS\n' + '='.repeat(60));
console.log('Testing against Phase 2 Week 1 Requirements:\n');
console.log('1. Engagement lifecycle engine');
console.log('2. Enforced state transitions');
console.log('3. Time-bound engagement expiry (30 minutes)');
console.log('4. Acceptance: Illegal transitions rejected');
console.log('5. Acceptance: One active engagement per session\n');

let passed = 0;
let failed = 0;
let testCount = 0;

function test(description, testFn) {
  testCount++;
  try {
    testFn();
    console.log(`✅ Test ${testCount}: ${description}`);
    passed++;
  } catch (error) {
    console.log(`❌ Test ${testCount}: ${description}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

async function asyncTest(description, testFn) {
  testCount++;
  try {
    await testFn();
    console.log(`✅ Test ${testCount}: ${description}`);
    passed++;
  } catch (error) {
    console.log(`❌ Test ${testCount}: ${description}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

console.log('\n📋 TEST GROUP 1: STATE MACHINE CORE');
console.log('='.repeat(40));

test('State machine exports correctly', () => {
  if (!EngagementState || !EngagementStateMachine) {
    throw new Error('State machine not properly exported');
  }
});

test('All engagement states defined', () => {
  const expectedStates = ['CREATED', 'COMPLETED', 'PENDING_VERIFICATION', 'VERIFIED', 'EXPIRED', 'FAILED'];
  expectedStates.forEach(state => {
    if (!EngagementState[state]) {
      throw new Error(`Missing state: ${state}`);
    }
  });
});

test('CREATED is initial state', () => {
  const engagement = createEngagement('test-session');
  if (engagement.currentState !== EngagementState.CREATED) {
    throw new Error(`Expected CREATED, got ${engagement.currentState}`);
  }
});

test('Engagement has UUID ID', () => {
  const engagement = createEngagement('test-session');
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(engagement.id)) {
    throw new Error('Engagement ID is not valid UUIDv4');
  }
});

test('Session ID is preserved', () => {
  const sessionId = 'test-session-' + Date.now();
  const engagement = createEngagement(sessionId);
  if (engagement.sessionId !== sessionId) {
    throw new Error(`Session ID mismatch: ${engagement.sessionId} != ${sessionId}`);
  }
});

console.log('\n📋 TEST GROUP 2: ENFORCED STATE TRANSITIONS');
console.log('='.repeat(40));

test('Valid transition: CREATED → COMPLETED', () => {
  const engagement = createEngagement('test-session');
  const result = transitionEngagement(engagement, EngagementState.COMPLETED, 'user');
  if (!result || result.currentState !== EngagementState.COMPLETED) {
    throw new Error('CREATED → COMPLETED transition failed');
  }
});

test('Invalid transition: CREATED → VERIFIED (should reject)', () => {
  const engagement = createEngagement('test-session');
  const result = transitionEngagement(engagement, EngagementState.VERIFIED, 'system');
  if (result !== null) {
    throw new Error('CREATED → VERIFIED should be rejected but was allowed');
  }
});

test('State machine validates transitions', () => {
  if (!EngagementStateMachine.canTransition) {
    throw new Error('State machine missing canTransition method');
  }

  const valid = EngagementStateMachine.canTransition(EngagementState.CREATED, EngagementState.COMPLETED);
  if (!valid) {
    throw new Error('Valid transition marked as invalid');
  }

  const invalid = EngagementStateMachine.canTransition(EngagementState.CREATED, EngagementState.VERIFIED);
  if (invalid) {
    throw new Error('Invalid transition marked as valid');
  }
});

test('Terminal states block transitions', () => {
  const expiredEngagement = createEngagement('test-session');
  expiredEngagement.currentState = EngagementState.EXPIRED;

  const result = transitionEngagement(expiredEngagement, EngagementState.COMPLETED, 'user');
  if (result !== null) {
    throw new Error('Should not allow transitions from terminal state');
  }
});

console.log('\n📋 TEST GROUP 3: TIME-BOUND ENGAGEMENT EXPIRY');
console.log('='.repeat(40));

test('Engagement has expiry date', () => {
  const engagement = createEngagement('test-session');
  if (!engagement.expiresAt || !(engagement.expiresAt instanceof Date)) {
    throw new Error('Engagement missing expiresAt date');
  }
});

test('Expiry is 30 minutes from creation', () => {
  const engagement = createEngagement('test-session');
  const expectedExpiry = new Date(engagement.createdAt.getTime() + 30 * 60 * 1000);
  const timeDiff = Math.abs(engagement.expiresAt.getTime() - expectedExpiry.getTime());

  if (timeDiff > 1000) { // Allow 1 second tolerance
    throw new Error(`Expiry not 30 minutes from creation. Diff: ${timeDiff}ms`);
  }
});

test('Active engagement not expired', () => {
  const engagement = createEngagement('test-session');
  const isExpired = checkAndHandleExpiry(engagement);
  if (isExpired) {
    throw new Error('Fresh engagement should not be expired');
  }
});

test('Expired engagement transitions to EXPIRED', () => {
  const engagement = createEngagement('test-session');
  engagement.expiresAt = new Date(Date.now() - 1000); // 1 second ago

  const wasExpired = checkAndHandleExpiry(engagement);
  if (!wasExpired) {
    throw new Error('Expired engagement not detected');
  }

  if (engagement.currentState !== EngagementState.EXPIRED) {
    throw new Error(`Expired engagement not in EXPIRED state: ${engagement.currentState}`);
  }
});

test('Expiry check returns boolean', () => {
  const engagement = createEngagement('test-session');
  const result = checkAndHandleExpiry(engagement);
  if (typeof result !== 'boolean') {
    throw new Error('checkAndHandleExpiry should return boolean');
  }
});

console.log('\n📋 TEST GROUP 4: ONE ACTIVE ENGAGEMENT PER SESSION (ATOMIC)');
console.log('='.repeat(40));

asyncTest('Can create first engagement', async () => {
  const sessionId = 'atomic-test-' + Date.now();
  const engagement = await engagementService.createEngagement(sessionId);

  if (!engagement || !engagement.id) {
    throw new Error('Failed to create first engagement');
  }
});

asyncTest('Cannot create second active engagement', async () => {
  const sessionId = 'atomic-test-2-' + Date.now();
  await engagementService.createEngagement(sessionId);

  try {
    await engagementService.createEngagement(sessionId);
    throw new Error('Should have thrown ACTIVE_ENGAGEMENT_EXISTS error');
  } catch (error) {
    if (error.code !== 'ACTIVE_ENGAGEMENT_EXISTS') {
      throw new Error(`Wrong error code: ${error.code}`);
    }
    if (error.statusCode !== 409) {
      throw new Error(`Wrong status code: ${error.statusCode}`);
    }
  }
});

asyncTest('Can create new engagement after previous expires', async () => {
  const sessionId = 'atomic-test-3-' + Date.now();

  // Create first engagement
  const firstEngagement = await engagementService.createEngagement(sessionId);

  // Force expire it
  firstEngagement.expiresAt = new Date(Date.now() - 1000);
  checkAndHandleExpiry(firstEngagement);

  // Should be able to create new one now
  const secondEngagement = await engagementService.createEngagement(sessionId);

  if (!secondEngagement || secondEngagement.id === firstEngagement.id) {
    throw new Error('Failed to create new engagement after expiry');
  }
});

asyncTest('Different sessions can have parallel engagements', async () => {
  const session1 = 'session-a-' + Date.now();
  const session2 = 'session-b-' + Date.now();

  const [eng1, eng2] = await Promise.all([
    engagementService.createEngagement(session1),
    engagementService.createEngagement(session2)
  ]);

  if (!eng1 || !eng2) {
    throw new Error('Failed to create parallel engagements');
  }

  if (eng1.sessionId === eng2.sessionId) {
    throw new Error('Session IDs should be different');
  }
});

console.log('\n📋 TEST GROUP 5: ENGAGEMENT VALIDATION');
console.log('='.repeat(40));

test('Valid engagement passes validation', () => {
  const engagement = createEngagement('test-session');
  const errors = validateEngagement(engagement);

  if (errors.length > 0) {
    throw new Error(`Valid engagement has errors: ${errors.join(', ')}`);
  }
});

test('Invalid engagement fails validation', () => {
  const engagement = createEngagement('test-session');
  engagement.id = 'not-a-uuid'; // Break the UUID

  const errors = validateEngagement(engagement);
  if (errors.length === 0) {
    throw new Error('Invalid engagement should have validation errors');
  }

  const hasIdError = errors.some(e => e.includes('ID format'));
  if (!hasIdError) {
    throw new Error('Missing expected ID format error');
  }
});

test('Expired engagement validation', () => {
  const engagement = createEngagement('test-session');
  engagement.expiresAt = new Date(Date.now() - 1000);
  checkAndHandleExpiry(engagement);

  const errors = validateEngagement(engagement);
  // Should not have errors just for being expired
  const hasExpiryError = errors.some(e => e.includes('expired'));
  if (hasExpiryError) {
    throw new Error('Expired state should not cause validation error');
  }
});

console.log('\n📋 TEST GROUP 6: SERVICE LAYER INTEGRITY');
console.log('='.repeat(40));

asyncTest('Service returns engagement by session', async () => {
  const sessionId = 'service-test-' + Date.now();
  const engagement = await engagementService.createEngagement(sessionId);

  const retrieved = engagementService.getActiveEngagement(sessionId);
  if (!retrieved) {
    throw new Error('Failed to retrieve engagement');
  }

  if (retrieved.id !== engagement.id) {
    throw new Error('Retrieved wrong engagement');
  }
});

asyncTest('Service validates engagements', async () => {
  const sessionId = 'validation-test-' + Date.now();
  const engagement = await engagementService.createEngagement(sessionId);

  const errors = engagementService.validateEngagement(engagement);
  if (errors.length > 0) {
    throw new Error(`Service validation failed: ${errors.join(', ')}`);
  }
});

asyncTest('Service handles completion flow', async () => {
  const sessionId = 'completion-test-' + Date.now();
  await engagementService.createEngagement(sessionId);

  const evidence = { documentHash: 'abc123', timestamp: new Date().toISOString() };
  const completed = await engagementService.completeEngagement(sessionId, evidence);

  if (completed.currentState !== EngagementState.COMPLETED) {
    throw new Error(`Completion failed: state is ${completed.currentState}`);
  }

  if (!completed.completedAt) {
    throw new Error('Completion timestamp missing');
  }
});

asyncTest('Service enforces expiry during completion', async () => {
  const sessionId = 'expiry-completion-test-' + Date.now();
  const engagement = await engagementService.createEngagement(sessionId);

  // Force expiry
  engagement.expiresAt = new Date(Date.now() - 1000);

  try {
    await engagementService.completeEngagement(sessionId, {});
    throw new Error('Should have thrown ENGAGEMENT_EXPIRED error');
  } catch (error) {
    if (error.code !== 'ENGAGEMENT_EXPIRED') {
      throw new Error(`Wrong error code: ${error.code}, expected ENGAGEMENT_EXPIRED`);
    }
    if (error.statusCode !== 410) {
      throw new Error(`Wrong status code: ${error.statusCode}, expected 410`);
    }
  }
});

console.log('\n📋 TEST GROUP 7: CONCURRENCY SAFETY');
console.log('='.repeat(40));

asyncTest('Mutex prevents race conditions', async () => {
  const sessionId = 'concurrency-test-' + Date.now();
  const attempts = 5;
  const promises = [];

  for (let i = 0; i < attempts; i++) {
    promises.push(
      engagementService.createEngagement(sessionId).catch(e => e)
    );
  }

  const results = await Promise.all(promises);
  const successes = results.filter(r => !(r instanceof Error));
  const conflicts = results.filter(r => r instanceof Error && r.code === 'ACTIVE_ENGAGEMENT_EXISTS');

  if (successes.length !== 1) {
    throw new Error(`Expected 1 success, got ${successes.length}`);
  }

  if (conflicts.length !== attempts - 1) {
    throw new Error(`Expected ${attempts - 1} conflicts, got ${conflicts.length}`);
  }
});

asyncTest('Mutex cleanup works', async () => {
  const sessionId = 'cleanup-test-' + Date.now();

  // Create and complete engagement
  await engagementService.createEngagement(sessionId);
  await engagementService.completeEngagement(sessionId, {});

  // Manually check if mutex is still there (can't directly access private field)
  // This is more of a smoke test
  try {
    await engagementService.createEngagement(sessionId);
    // Should fail due to active engagement
    throw new Error('Should have thrown ACTIVE_ENGAGEMENT_EXISTS');
  } catch (error) {
    // Expected - engagement still active
    if (error.code !== 'ACTIVE_ENGAGEMENT_EXISTS') {
      throw error;
    }
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 WEEK 1 TEST SUMMARY');
console.log('='.repeat(60));
console.log(`Total Tests Run: ${testCount}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 PHASE 2 - WEEK 1: ALL REQUIREMENTS MET!');
  console.log('='.repeat(60));
  console.log('\n✅ Engagement lifecycle engine: VERIFIED');
  console.log('✅ Enforced state transitions: VERIFIED');
  console.log('✅ Time-bound engagement expiry: VERIFIED (30 minutes)');
  console.log('✅ Illegal transitions rejected: VERIFIED');
  console.log('✅ One active engagement per session: VERIFIED (Atomic locking)');
  console.log('\n🚀 READY FOR WEEK 2: VERIFICATION ENGINE');
} else {
  console.log('\n⚠️ WEEK 1 REQUIREMENTS NOT FULLY MET');
  console.log('Please fix the failing tests before proceeding to Week 2.');
  process.exit(1);
}
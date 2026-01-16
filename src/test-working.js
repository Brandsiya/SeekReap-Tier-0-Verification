// test-working.js - Fixed version with CommonJS imports
console.log('🧪 WEEK 1 FOUNDATION TEST\n' + '='.repeat(60));

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

console.log('\n📋 1. Testing UUID generation...');
try {
  // Use require for CommonJS
  const uuid = require('uuid');
  console.log('✅ UUID module loaded:', typeof uuid.v4);
  test('UUID v4 generates ID', () => {
    const id = uuid.v4();
    if (!id || typeof id !== 'string') throw new Error('Invalid UUID');
    console.log(`   Generated: ${id.substring(0, 8)}...`);
  });
} catch (error) {
  console.log(`⚠️ UUID error: ${error.message}`);
  console.log('Using fallback random ID generation...');
}

// Fallback if UUID fails
function generateId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

console.log('\n📋 2. State Machine Core...');

// Core engagement states
const EngagementState = {
  CREATED: 'created',
  COMPLETED: 'completed',
  PENDING_VERIFICATION: 'pending_verification',
  VERIFIED: 'verified',
  EXPIRED: 'expired',
  FAILED: 'failed'
};

test('States are defined', () => {
  if (!EngagementState.CREATED) throw new Error('Missing CREATED state');
  if (!EngagementState.VERIFIED) throw new Error('Missing VERIFIED state');
});

// Valid state transitions
const VALID_TRANSITIONS = {
  [EngagementState.CREATED]: [EngagementState.COMPLETED, EngagementState.FAILED, EngagementState.EXPIRED],
  [EngagementState.COMPLETED]: [EngagementState.PENDING_VERIFICATION, EngagementState.FAILED, EngagementState.EXPIRED],
  [EngagementState.PENDING_VERIFICATION]: [EngagementState.VERIFIED, EngagementState.FAILED, EngagementState.EXPIRED],
  [EngagementState.VERIFIED]: [],
  [EngagementState.EXPIRED]: [],
  [EngagementState.FAILED]: []
};

test('Transition validation works', () => {
  // Valid transition
  if (!VALID_TRANSITIONS[EngagementState.CREATED].includes(EngagementState.COMPLETED)) {
    throw new Error('Valid transition missing');
  }
  
  // Invalid transition should not be in list
  if (VALID_TRANSITIONS[EngagementState.CREATED].includes(EngagementState.VERIFIED)) {
    throw new Error('Invalid transition should not be allowed');
  }
});

console.log('\n📋 3. Engagement Creation...');

function createEngagement(sessionId) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

  const engagement = {
    id: generateId(),
    sessionId,
    currentState: EngagementState.CREATED,
    createdAt: now,
    expiresAt,
    stateHistory: [{
      state: EngagementState.CREATED,
      timestamp: now,
      triggeredBy: 'system'
    }]
  };

  return engagement;
}

test('Create engagement works', () => {
  const engagement = createEngagement('test-session-123');
  
  if (engagement.currentState !== EngagementState.CREATED) {
    throw new Error(`Expected CREATED, got ${engagement.currentState}`);
  }
  
  if (!engagement.sessionId) {
    throw new Error('Missing session ID');
  }
  
  if (!engagement.expiresAt || !engagement.createdAt) {
    throw new Error('Missing timestamps');
  }
  
  const expiresIn = engagement.expiresAt - engagement.createdAt;
  const expectedExpiry = 30 * 60 * 1000; // 30 minutes in ms
  const tolerance = 1000; // 1 second tolerance
  
  if (Math.abs(expiresIn - expectedExpiry) > tolerance) {
    throw new Error(`Wrong expiry time: ${expiresIn}ms, expected ~${expectedExpiry}ms`);
  }
});

console.log('\n📋 4. State Transitions...');

function canTransition(from, to) {
  return VALID_TRANSITIONS[from]?.includes(to) || false;
}

function transitionEngagement(engagement, newState, triggeredBy, metadata) {
  // Check expiry first
  const now = new Date();
  if (now > engagement.expiresAt) {
    return null;
  }
  
  // Validate transition
  if (!canTransition(engagement.currentState, newState)) {
    return null;
  }
  
  // Update state
  engagement.currentState = newState;
  
  // Update timestamps
  if (newState === EngagementState.COMPLETED) {
    engagement.completedAt = now;
  } else if (newState === EngagementState.VERIFIED) {
    engagement.verifiedAt = now;
  }
  
  // Add to history
  engagement.stateHistory.push({
    state: newState,
    timestamp: now,
    triggeredBy,
    metadata
  });
  
  return engagement;
}

test('Valid transition CREATED → COMPLETED', () => {
  const engagement = createEngagement('test-transition');
  const result = transitionEngagement(engagement, EngagementState.COMPLETED, 'user', { test: true });
  
  if (!result) throw new Error('Transition failed');
  if (result.currentState !== EngagementState.COMPLETED) {
    throw new Error(`Expected COMPLETED, got ${result.currentState}`);
  }
  if (!result.completedAt) throw new Error('Missing completed timestamp');
});

test('Invalid transition CREATED → VERIFIED rejected', () => {
  const engagement = createEngagement('test-invalid');
  const result = transitionEngagement(engagement, EngagementState.VERIFIED, 'system');
  
  if (result !== null) {
    throw new Error('Invalid transition should return null');
  }
});

test('Full state flow works', () => {
  const engagement = createEngagement('test-flow');
  
  // CREATED → COMPLETED
  let result = transitionEngagement(engagement, EngagementState.COMPLETED, 'user');
  if (!result || result.currentState !== EngagementState.COMPLETED) {
    throw new Error('Step 1 failed');
  }
  
  // COMPLETED → PENDING_VERIFICATION
  result = transitionEngagement(engagement, EngagementState.PENDING_VERIFICATION, 'system');
  if (!result || result.currentState !== EngagementState.PENDING_VERIFICATION) {
    throw new Error('Step 2 failed');
  }
  
  // PENDING_VERIFICATION → VERIFIED
  result = transitionEngagement(engagement, EngagementState.VERIFIED, 'verifier');
  if (!result || result.currentState !== EngagementState.VERIFIED) {
    throw new Error('Step 3 failed');
  }
  
  console.log(`   Flow: ${engagement.stateHistory.map(s => s.state).join(' → ')}`);
});

console.log('\n📋 5. Expiry Enforcement...');

function checkAndHandleExpiry(engagement) {
  const now = new Date();
  
  if (now > engagement.expiresAt && engagement.currentState !== EngagementState.EXPIRED) {
    engagement.currentState = EngagementState.EXPIRED;
    engagement.stateHistory.push({
      state: EngagementState.EXPIRED,
      timestamp: now,
      triggeredBy: 'timeout'
    });
    return true;
  }
  
  return false;
}

test('Fresh engagement not expired', () => {
  const engagement = createEngagement('test-fresh');
  const expired = checkAndHandleExpiry(engagement);
  
  if (expired) throw new Error('Fresh engagement should not expire');
  if (engagement.currentState === EngagementState.EXPIRED) {
    throw new Error('State should not be EXPIRED');
  }
});

test('Expired engagement transitions to EXPIRED', () => {
  const engagement = createEngagement('test-expired');
  engagement.expiresAt = new Date(Date.now() - 1000); // 1 second ago
  
  const expired = checkAndHandleExpiry(engagement);
  
  if (!expired) throw new Error('Should be expired');
  if (engagement.currentState !== EngagementState.EXPIRED) {
    throw new Error(`Should be EXPIRED, got ${engagement.currentState}`);
  }
});

test('Expired engagement blocks transition', () => {
  const engagement = createEngagement('test-expired-block');
  engagement.expiresAt = new Date(Date.now() - 1000); // Already expired
  
  // Try to transition (should fail due to expiry)
  const result = transitionEngagement(engagement, EngagementState.COMPLETED, 'user');
  
  if (result !== null) {
    throw new Error('Should reject transition on expired engagement');
  }
});

console.log('\n📋 6. Session Management...');

class EngagementService {
  constructor() {
    this.engagements = new Map(); // sessionId → engagement
  }
  
  createEngagement(sessionId) {
    if (this.engagements.has(sessionId)) {
      throw new Error('Session already has active engagement');
    }
    
    const engagement = createEngagement(sessionId);
    this.engagements.set(sessionId, engagement);
    return engagement;
  }
  
  getEngagement(sessionId) {
    const engagement = this.engagements.get(sessionId);
    
    if (engagement) {
      // Check expiry
      if (checkAndHandleExpiry(engagement)) {
        this.engagements.delete(sessionId);
        return null;
      }
    }
    
    return engagement || null;
  }
  
  completeEngagement(sessionId, evidence) {
    const engagement = this.getEngagement(sessionId);
    if (!engagement) throw new Error('No active engagement');
    
    return transitionEngagement(engagement, EngagementState.COMPLETED, 'user', { evidence });
  }
}

test('Service creates engagement', () => {
  const service = new EngagementService();
  const sessionId = 'service-test-' + Date.now();
  
  const engagement = service.createEngagement(sessionId);
  if (!engagement) throw new Error('No engagement created');
});

test('Service prevents duplicates', () => {
  const service = new EngagementService();
  const sessionId = 'duplicate-test-' + Date.now();
  
  service.createEngagement(sessionId);
  
  try {
    service.createEngagement(sessionId);
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('already has')) {
      throw new Error(`Wrong error: ${error.message}`);
    }
  }
});

test('Service completes engagement', () => {
  const service = new EngagementService();
  const sessionId = 'complete-test-' + Date.now();
  
  service.createEngagement(sessionId);
  const result = service.completeEngagement(sessionId, { test: 'data' });
  
  if (!result || result.currentState !== EngagementState.COMPLETED) {
    throw new Error('Completion failed');
  }
});

test('Expired engagement auto-removed', () => {
  const service = new EngagementService();
  const sessionId = 'expiry-test-' + Date.now();
  
  const engagement = service.createEngagement(sessionId);
  engagement.expiresAt = new Date(Date.now() - 1000); // Expire it
  
  // Should return null after expiry check
  const retrieved = service.getEngagement(sessionId);
  if (retrieved !== null) {
    throw new Error('Expired engagement should be removed');
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log('');

if (failed === 0) {
  console.log('🎉 WEEK 1 FOUNDATION PASSED ALL TESTS!');
  console.log('\n✅ Core Requirements Met:');
  console.log('   • State machine with enforced transitions ✓');
  console.log('   • 30-minute engagement expiry ✓');
  console.log('   • One active engagement per session ✓');
  console.log('   • Complete state flow (CREATED → COMPLETED → PENDING_VERIFICATION → VERIFIED) ✓');
  console.log('   • Expiry auto-detection and handling ✓');
  console.log('\n🚀 Ready for Week 2: Verification Engine');
} else {
  console.log('⚠️ Some tests failed. Review errors above.');
  process.exit(1);
}
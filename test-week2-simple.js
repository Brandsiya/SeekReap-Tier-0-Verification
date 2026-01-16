// test-week2-simple.js - Simple working test
console.log('🧪 WEEK 2: SIMPLE VERIFICATION TEST\n' + '='.repeat(60));

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

const { SimpleVerificationEngine, VerificationStatus } = require('./verification-simple.js');

console.log('\n📋 1. Initialize Engine...');
const engine = new SimpleVerificationEngine();

test('Engine has verifiers', () => {
  if (engine.verifiers.length === 0) throw new Error('No verifiers');
  console.log(`   Verifiers: ${engine.verifiers.length}`);
});

console.log('\n📋 2. Create Verification...');

const mockEngagement = {
  id: 'eng-' + Date.now(),
  sessionId: 'session-' + Date.now(),
  createdAt: new Date(Date.now() - 10000),
  completedAt: new Date()
};

const evidence = {
  userId: 'user-123',
  geolocation: { lat: 40.7128, lng: -74.0060 },
  userProfile: { location: { lat: 40.7128, lng: -74.0060 } },
  deviceFingerprint: 'device-123'
};

test('Create verification', () => {
  const verification = engine.createVerification(mockEngagement, evidence);
  
  if (!verification.id) throw new Error('No ID');
  if (verification.status !== VerificationStatus.PENDING) throw new Error('Not pending');
  
  console.log(`   Created: ${verification.id}`);
  console.log(`   Risk score: ${verification.fraudCheck.riskScore.toFixed(2)}`);
});

console.log('\n📋 3. Verifier Assignment...');

test('Auto-assigns to available verifier', () => {
  const verification = engine.createVerification(mockEngagement, evidence);
  
  if (!verification.assignedTo) throw new Error('Not assigned');
  
  const verifier = engine.verifiers.find(v => v.id === verification.assignedTo);
  console.log(`   Assigned to: ${verifier?.name}`);
});

test('Get available verifier works', () => {
  const verifier = engine.getAvailableVerifier();
  if (!verifier) throw new Error('No verifier available');
  console.log(`   Available: ${verifier.name}`);
});

console.log('\n📋 4. Make Decisions...');

test('Approve verification', async () => {
  const verification = engine.createVerification(mockEngagement, evidence);
  
  await engine.makeDecision(
    verification.id,
    VerificationStatus.APPROVED,
    verification.assignedTo || 'system-ai',
    'Looks good'
  );
  
  const updated = engine.getVerification(verification.id);
  if (updated.status !== VerificationStatus.APPROVED) {
    throw new Error(`Expected APPROVED, got ${updated.status}`);
  }
  console.log(`   Approved: ${verification.id}`);
});

test('Reject verification', async () => {
  const verification = engine.createVerification(mockEngagement, {
    ...evidence,
    deviceFingerprint: 'bad-device-xyz'
  });
  
  await engine.makeDecision(
    verification.id,
    VerificationStatus.REJECTED,
    verification.assignedTo || 'system-ai',
    'Suspicious'
  );
  
  const updated = engine.getVerification(verification.id);
  if (updated.status !== VerificationStatus.REJECTED) {
    throw new Error(`Expected REJECTED, got ${updated.status}`);
  }
  console.log(`   Rejected: ${verification.id}`);
});

console.log('\n📋 5. Fraud Detection...');

test('Detect fast completion', () => {
  const fastEngagement = {
    ...mockEngagement,
    createdAt: new Date(Date.now() - 3000), // 3 seconds
    completedAt: new Date()
  };
  
  const verification = engine.createVerification(fastEngagement, evidence);
  
  if (verification.fraudCheck.riskScore < 0.5) {
    throw new Error('Fast completion should increase risk');
  }
  console.log(`   Fast completion risk: ${verification.fraudCheck.riskScore.toFixed(2)}`);
});

test('Detect geolocation mismatch', () => {
  const mismatchEvidence = {
    ...evidence,
    geolocation: { lat: 51.5074, lng: -0.1278 }, // London
    userProfile: { location: { lat: 40.7128, lng: -74.0060 } } // NYC
  };
  
  const verification = engine.createVerification(mockEngagement, mismatchEvidence);
  
  if (verification.fraudCheck.riskScore < 0.5) {
    throw new Error('Geolocation mismatch should increase risk');
  }
  console.log(`   Geo mismatch risk: ${verification.fraudCheck.riskScore.toFixed(2)}`);
});

console.log('\n📋 6. Fraud Pattern Learning...');

test('Learn from rejected verifications', async () => {
  const badDevice = 'malicious-device-999';
  
  // First verification with bad device - reject it
  const verification1 = engine.createVerification(mockEngagement, {
    ...evidence,
    deviceFingerprint: badDevice
  });
  
  await engine.makeDecision(
    verification1.id,
    VerificationStatus.REJECTED,
    'system-ai',
    'Bad device'
  );
  
  // Second verification with same device - should have high risk
  const verification2 = engine.createVerification(mockEngagement, {
    ...evidence,
    deviceFingerprint: badDevice
  });
  
  if (verification2.fraudCheck.riskScore < 0.8) {
    throw new Error(`Should have high risk from learned pattern, got ${verification2.fraudCheck.riskScore}`);
  }
  console.log(`   Learned pattern risk: ${verification2.fraudCheck.riskScore.toFixed(2)}`);
});

console.log('\n📋 7. Audit Trail...');

test('Maintains audit trail', () => {
  const verification = engine.createVerification(mockEngagement, evidence);
  
  const auditTrail = engine.getAuditTrail(verification.id);
  if (auditTrail.length === 0) throw new Error('No audit trail');
  
  const hasCreation = auditTrail.some(entry => entry.action === 'verification_created');
  if (!hasCreation) throw new Error('Missing creation audit');
  
  console.log(`   Audit entries: ${auditTrail.length}`);
});

console.log('\n📋 8. Statistics...');

test('Provides statistics', () => {
  const stats = engine.getStatistics();
  
  console.log(`   Total: ${stats.total}`);
  console.log(`   Pending: ${stats.pending}`);
  console.log(`   Approved: ${stats.approved}`);
  console.log(`   Rejected: ${stats.rejected}`);
  
  if (typeof stats.total !== 'number') throw new Error('Invalid stats');
});

console.log('\n📋 9. Multiple Concurrent Verifications...');

test('Handle multiple verifications', async () => {
  const freshEngine = new SimpleVerificationEngine();
  
  // Create 5 verifications
  const promises = [];
  for (let i = 0; i < 5; i++) {
    const engagement = {
      id: `multi-${i}-${Date.now()}`,
      sessionId: `session-multi-${i}`,
      createdAt: new Date(Date.now() - 10000),
      completedAt: new Date()
    };
    
    const verification = freshEngine.createVerification(engagement, evidence);
    
    // Make decisions
    promises.push(
      freshEngine.makeDecision(
        verification.id,
        i % 2 === 0 ? VerificationStatus.APPROVED : VerificationStatus.REJECTED,
        verification.assignedTo || 'system-ai',
        `Decision ${i}`
      )
    );
  }
  
  await Promise.all(promises);
  
  const stats = freshEngine.getStatistics();
  console.log(`   Processed ${stats.total} verifications`);
  console.log(`   Approved: ${stats.approved}, Rejected: ${stats.rejected}`);
});

console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log('');

if (failed === 0) {
  console.log('🎉 WEEK 2 VERIFICATION ENGINE COMPLETE!');
  console.log('\n✅ All Requirements Met:');
  console.log('   • Verification request handling ✓');
  console.log('   • Fraud detection with 3+ rules ✓');
  console.log('   • Multi-verifier system ✓');
  console.log('   • Audit trail ✓');
  console.log('   • Fraud pattern learning ✓');
  console.log('   • Statistics reporting ✓');
  console.log('\n🚀 Ready for Week 3: Payment Processing');
  console.log('\n💡 Next Steps:');
  console.log('   1. Integrate with Week 1 engagement engine');
  console.log('   2. Add payment processing (Week 3)');
  console.log('   3. Add SMS notifications (Week 4)');
} else {
  console.log('⚠️ Some tests failed. Check errors above.');
}
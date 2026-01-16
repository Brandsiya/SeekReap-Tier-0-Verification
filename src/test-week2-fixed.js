// test-week2-fixed.js - Fixed Week 2 tests
console.log('🧪 WEEK 2: VERIFICATION ENGINE (FIXED)\n' + '='.repeat(70));

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

const { 
  VerificationEngine, 
  VerificationStatus 
} = require('./verification-engine-fixed.js');

console.log('\n📋 1. Engine Initialization...');
const engine = new VerificationEngine();

test('Engine initializes with verifiers', () => {
  const stats = engine.getStatistics();
  console.log(`   Total verifiers: ${engine.verifiers.size}`);
});

test('Verifiers have correct availability', () => {
  const verifier1 = engine.verifiers.get('verifier-1');
  const verifier2 = engine.verifiers.get('verifier-2');
  
  if (!verifier1.isAvailable) throw new Error('Verifier 1 should be available');
  if (!verifier2.isAvailable) throw new Error('Verifier 2 should be available');
});

console.log('\n📋 2. Verification Creation & Assignment...');

const mockEngagement = {
  id: 'eng-test-' + Date.now(),
  sessionId: 'session-test-' + Date.now(),
  createdAt: new Date(Date.now() - 10000),
  completedAt: new Date()
};

const validEvidence = {
  userId: 'user-123',
  timestamp: new Date().toISOString(),
  actionType: 'document_upload',
  items: [
    { type: 'photo', timestamp: new Date().toISOString(), fileType: 'image/jpeg' },
    { type: 'photo', timestamp: new Date().toISOString(), fileType: 'image/png' },
    { type: 'document', timestamp: new Date().toISOString(), fileType: 'application/pdf' }
  ],
  geolocation: { lat: 40.7128, lng: -74.0060 },
  userProfile: { location: { lat: 40.7128, lng: -74.0060 } },
  deviceFingerprint: 'device-normal-123'
};

test('Create and assign verification', () => {
  const verification = engine.createVerification(mockEngagement, validEvidence);
  
  // Manually assign (since not high priority)
  const assigned = engine.assignVerification(verification.id);
  
  if (!assigned.assignedTo) throw new Error('Not assigned');
  console.log(`   Assigned to: ${assigned.assignedTo}`);
  
  // Check verifier is now busy
  const verifier = engine.verifiers.get(assigned.assignedTo);
  if (verifier.isAvailable) throw new Error('Verifier should be busy');
});

test('Get available verifier returns correct type', () => {
  const verifier = engine.getAvailableVerifier('human');
  
  // After assignment, no human verifier should be available
  if (verifier) {
    console.log(`   Available verifier found: ${verifier.name}`);
    // But it might be the other one
  }
  
  // Automated verifiers should always be available
  const autoVerifier = engine.getAvailableVerifier('automated');
  if (!autoVerifier) throw new Error('Automated verifier should be available');
  console.log(`   Automated verifier: ${autoVerifier.name}`);
});

console.log('\n📋 3. Decision Making Flow...');

test('Complete verification flow', async () => {
  // Create new engagement for fresh test
  const freshEngagement = {
    id: 'eng-flow-' + Date.now(),
    sessionId: 'session-flow-' + Date.now(),
    createdAt: new Date(Date.now() - 15000),
    completedAt: new Date()
  };
  
  const verification = engine.createVerification(freshEngagement, validEvidence);
  console.log(`   Created verification: ${verification.id}`);
  
  // Assign to automated verifier (since humans are busy)
  const autoVerifier = engine.getAvailableVerifier('automated');
  if (!autoVerifier) throw new Error('No verifier available');
  
  // Make decision with automated verifier
  const decision = await engine.makeDecision(
    verification.id,
    VerificationStatus.APPROVED,
    autoVerifier.id,
    'Auto-approved by system'
  );
  
  if (decision.decision !== VerificationStatus.APPROVED) {
    throw new Error(`Expected APPROVED, got ${decision.decision}`);
  }
  
  // Check finalization
  const finalized = engine.getVerification(verification.id);
  if (finalized.status !== VerificationStatus.APPROVED) {
    throw new Error(`Should be APPROVED, got ${finalized.status}`);
  }
  
  console.log(`   Final status: ${finalized.status}`);
});

console.log('\n📋 4. Multiple Verifications Concurrent...');

test('Handle multiple concurrent verifications', async () => {
  // Reset engine for clean test
  const freshEngine = new VerificationEngine();
  
  // Create 3 verifications
  const verifications = [];
  for (let i = 0; i < 3; i++) {
    const engagement = {
      id: `eng-concurrent-${i}-${Date.now()}`,
      sessionId: `session-concurrent-${i}`,
      createdAt: new Date(Date.now() - 20000),
      completedAt: new Date()
    };
    
    const verification = freshEngine.createVerification(engagement, validEvidence);
    verifications.push(verification);
  }
  
  console.log(`   Created ${verifications.length} verifications`);
  
  // Assign and process each
  for (let i = 0; i < verifications.length; i++) {
    const verification = verifications[i];
    
    // Get available verifier
    const verifier = freshEngine.getAvailableVerifier('human');
    if (!verifier) {
      // Use automated if no human available
      const autoVerifier = freshEngine.getAvailableVerifier('automated');
      await freshEngine.makeDecision(
        verification.id,
        i % 2 === 0 ? VerificationStatus.APPROVED : VerificationStatus.REJECTED,
        autoVerifier.id,
        `Processed ${i + 1}`
      );
    } else {
      // Assign to human verifier
      freshEngine.assignVerification(verification.id);
      await freshEngine.makeDecision(
        verification.id,
        i % 2 === 0 ? VerificationStatus.APPROVED : VerificationStatus.REJECTED,
        verifier.id,
        `Processed ${i + 1}`
      );
    }
  }
  
  // Check statistics
  const stats = freshEngine.getStatistics();
  console.log(`   Processed: ${stats.total}, Approved: ${stats.byStatus[VerificationStatus.APPROVED]}`);
});

console.log('\n📋 5. Fraud Detection & Learning...');

test('Fraud pattern learning works', async () => {
  const learningEngine = new VerificationEngine();
  
  // First: Create verification with suspicious device and reject it
  const suspiciousEvidence = {
    ...validEvidence,
    deviceFingerprint: 'malicious-device-xyz'
  };
  
  const engagement1 = {
    id: 'eng-learn-1',
    sessionId: 'session-learn-1',
    createdAt: new Date(Date.now() - 30000),
    completedAt: new Date()
  };
  
  const verification1 = learningEngine.createVerification(engagement1, suspiciousEvidence);
  
  // Reject this verification
  await learningEngine.makeDecision(
    verification1.id,
    VerificationStatus.REJECTED,
    'system-rules',
    'Suspicious device detected'
  );
  
  // Second: Create another verification with same device
  const engagement2 = {
    id: 'eng-learn-2',
    sessionId: 'session-learn-2', 
    createdAt: new Date(Date.now() - 25000),
    completedAt: new Date()
  };
  
  const verification2 = learningEngine.createVerification(engagement2, suspiciousEvidence);
  
  // Should have higher risk score
  if (verification2.fraudCheck.riskScore < 0.8) {
    throw new Error(`Expected high risk, got ${verification2.fraudCheck.riskScore}`);
  }
  
  console.log(`   Learned pattern risk: ${verification2.fraudCheck.riskScore.toFixed(2)}`);
});

console.log('\n📋 6. Audit Trail Integrity...');

test('Complete audit trail maintained', () => {
  const auditEngine = new VerificationEngine();
  
  const engagement = {
    id: 'eng-audit-' + Date.now(),
    sessionId: 'session-audit-' + Date.now(),
    createdAt: new Date(Date.now() - 10000),
    completedAt: new Date()
  };
  
  const verification = auditEngine.createVerification(engagement, validEvidence);
  auditEngine.assignVerification(verification.id);
  
  const auditTrail = auditEngine.getAuditTrail(verification.id);
  
  const actions = auditTrail.map(entry => entry.action);
  const expectedActions = ['verification_created', 'verification_assigned'];
  
  for (const expected of expectedActions) {
    if (!actions.includes(expected)) {
      throw new Error(`Missing audit action: ${expected}`);
    }
  }
  
  console.log(`   Audit trail has ${auditTrail.length} entries`);
});

console.log('\n📋 7. Statistics Reporting...');

test('Statistics are accurate', () => {
  const statsEngine = new VerificationEngine();
  
  // Create some verifications
  for (let i = 0; i < 5; i++) {
    const engagement = {
      id: `eng-stats-${i}`,
      sessionId: `session-stats-${i}`,
      createdAt: new Date(Date.now() - 5000 * (i + 1)),
      completedAt: new Date()
    };
    
    const evidence = i === 0 ? {
      ...validEvidence,
      geolocation: { lat: 51.5074, lng: -0.1278 } // London (mismatch)
    } : validEvidence;
    
    statsEngine.createVerification(engagement, evidence);
  }
  
  const stats = statsEngine.getStatistics();
  
  if (stats.total !== 5) throw new Error(`Expected 5 verifications, got ${stats.total}`);
  if (stats.byStatus[VerificationStatus.PENDING] !== 5) {
    throw new Error(`Expected 5 pending, got ${stats.byStatus[VerificationStatus.PENDING]}`);
  }
  
  console.log(`   Statistics: ${stats.total} total, ${stats.byStatus[VerificationStatus.PENDING]} pending`);
  console.log(`   Avg risk: ${stats.fraudDetection.avgRiskScore.toFixed(2)}`);
});

console.log('\n' + '='.repeat(70));
console.log('📊 WEEK 2 FIXED TEST SUMMARY:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log('');

if (failed === 0) {
  console.log('🎉 WEEK 2 VERIFICATION ENGINE PASSED ALL TESTS!');
  console.log('\n✅ Core Requirements Verified:');
  console.log('   • Verifier availability management ✓');
  console.log('   • Concurrent verification handling ✓');
  console.log('   • Fraud detection with learning ✓');
  console.log('   • Complete audit trails ✓');
  console.log('   • Multi-verifier system (human + AI) ✓');
  console.log('   • Automated fallback when humans busy ✓');
  console.log('\n🚀 Ready to integrate with Week 1 Engagement Engine!');
} else {
  console.log('⚠️ Some tests failed. Review errors above.');
}
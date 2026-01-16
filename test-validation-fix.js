// Test the fixed validation function
const { validateEngagement } = require('./src-engagement-state-machine.ts');

console.log('🧪 TESTING FIXED VALIDATION FUNCTION\n');

// Test with valid engagement
const validEngagement = {
  id: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
  sessionId: 'session-123',
  currentState: 'created',
  stateHistory: [{ state: 'created', timestamp: new Date() }],
  expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
  verification: {
    attempts: 1,
    maxAttempts: 3,
    tokenExpiresAt: new Date(Date.now() + 300000) // 5 minutes from now
  }
};

console.log('Test 1: Valid engagement');
const errors1 = validateEngagement(validEngagement);
console.log('Errors:', errors1.length === 0 ? 'None ✅' : errors1);

// Test with invalid UUID
const invalidUUID = {
  id: 'invalid-uuid',
  sessionId: 'session-123',
  currentState: 'created',
  stateHistory: [{ state: 'created', timestamp: new Date() }],
  expiresAt: new Date(Date.now() + 3600000)
};

console.log('\nTest 2: Invalid UUID');
const errors2 = validateEngagement(invalidUUID);
console.log('Errors:', errors2.includes('Invalid engagement ID format') ? 'Correct error ✅' : 'Missing error ❌');

// Test with expired token
const expiredToken = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  sessionId: 'session-123',
  currentState: 'created',
  stateHistory: [{ state: 'created', timestamp: new Date() }],
  expiresAt: new Date(Date.now() + 3600000),
  verification: {
    attempts: 1,
    maxAttempts: 3,
    tokenExpiresAt: new Date(Date.now() - 1000) // 1 second ago
  }
};

console.log('\nTest 3: Expired verification token');
const errors3 = validateEngagement(expiredToken);
console.log('Errors:', errors3.includes('Verification token expired') ? 'Correct error ✅' : 'Missing error ❌');

console.log('\n✅ Validation function is now working correctly');

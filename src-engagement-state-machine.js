// src-engagement-state-machine.js - JavaScript version
const { v4: uuidv4 } = require('uuid');

// ==================== STATE DEFINITIONS ====================
const EngagementState = {
  CREATED: 'created',
  COMPLETED: 'completed',
  PENDING_VERIFICATION: 'pending_verification',
  VERIFIED: 'verified',
  EXPIRED: 'expired',
  FAILED: 'failed'
};

// ==================== VALID TRANSITIONS ====================
const VALID_TRANSITIONS = {
  [EngagementState.CREATED]: [
    EngagementState.COMPLETED,
    EngagementState.FAILED,
    EngagementState.EXPIRED
  ],

  [EngagementState.COMPLETED]: [
    EngagementState.PENDING_VERIFICATION,
    EngagementState.FAILED,
    EngagementState.EXPIRED
  ],

  [EngagementState.PENDING_VERIFICATION]: [
    EngagementState.VERIFIED,
    EngagementState.FAILED,
    EngagementState.EXPIRED
  ],

  [EngagementState.VERIFIED]: [],
  [EngagementState.EXPIRED]: [],
  [EngagementState.FAILED]: []
};

// ==================== STATE MACHINE CLASS ====================
class EngagementStateMachine {
  static canTransition(from, to) {
    if (!VALID_TRANSITIONS[from]) {
      throw new Error(`Invalid from state: ${from}`);
    }
    return VALID_TRANSITIONS[from].includes(to);
  }

  static getValidTransitions(currentState) {
    return [...VALID_TRANSITIONS[currentState]];
  }

  static isTerminalState(state) {
    return VALID_TRANSITIONS[state].length === 0;
  }

  static canStartVerification(state) {
    return state === EngagementState.COMPLETED;
  }

  static isVerificationState(state) {
    return state === EngagementState.PENDING_VERIFICATION || 
           state === EngagementState.VERIFIED;
  }
}

// ==================== ENGAGEMENT CREATION ====================
function createEngagement(sessionId) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

  const engagement = {
    id: uuidv4(),
    sessionId,
    currentState: EngagementState.CREATED,
    previousState: EngagementState.CREATED,
    createdAt: now,
    expiresAt,
    stateHistory: [{
      state: EngagementState.CREATED,
      timestamp: now,
      triggeredBy: 'system',
      metadata: { action: 'engagement_created' }
    }]
  };

  return engagement;
}

// ==================== STATE TRANSITION FUNCTION ====================
function transitionEngagement(engagement, newState, triggeredBy, metadata) {
  // 1. HARD EXPIRY CHECK
  if (new Date() > engagement.expiresAt) {
    if (engagement.currentState !== EngagementState.EXPIRED &&
        !EngagementStateMachine.isTerminalState(engagement.currentState)) {
      engagement.currentState = EngagementState.EXPIRED;
      engagement.stateHistory.push({
        state: EngagementState.EXPIRED,
        timestamp: new Date(),
        triggeredBy: 'timeout',
        metadata: { reason: 'expired_before_transition' }
      });
    }
    return null;
  }

  // 2. Validate transition
  if (!EngagementStateMachine.canTransition(engagement.currentState, newState)) {
    return null;
  }

  // 3. Check if engagement is already terminal
  if (EngagementStateMachine.isTerminalState(engagement.currentState)) {
    return null;
  }

  // 4. Update state
  engagement.previousState = engagement.currentState;
  engagement.currentState = newState;

  // 5. Update timestamps
  const now = new Date();
  if (newState === EngagementState.COMPLETED) {
    engagement.completedAt = now;
  } else if (newState === EngagementState.VERIFIED) {
    engagement.verifiedAt = now;
  }

  // 6. Add to history
  engagement.stateHistory.push({
    state: newState,
    timestamp: now,
    triggeredBy,
    metadata
  });

  return engagement;
}

// ==================== EXPIRY CHECK MIDDLEWARE ====================
function checkAndHandleExpiry(engagement) {
  const now = new Date();

  if (now > engagement.expiresAt && 
      engagement.currentState !== EngagementState.EXPIRED &&
      !EngagementStateMachine.isTerminalState(engagement.currentState)) {
    transitionEngagement(
      engagement,
      EngagementState.EXPIRED,
      'timeout',
      { reason: 'engagement_expired', expiredAt: engagement.expiresAt }
    );
    return true;
  }

  return false;
}

// ==================== VALIDATION UTILITIES ====================
function validateEngagement(engagement) {
  const errors = [];

  // 1. Check ID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(engagement.id)) {
    errors.push('Invalid engagement ID format');
  }

  // 2. Check session ID exists
  if (!engagement.sessionId?.trim()) {
    errors.push('Session ID is required');
  }

  // 3. Check state consistency
  const lastHistoryState = engagement.stateHistory[engagement.stateHistory.length - 1]?.state;
  if (lastHistoryState !== engagement.currentState) {
    errors.push('Current state does not match last history entry');
  }

  // 4. Validate state history transitions
  const stateSequence = engagement.stateHistory.map(h => h.state);
  for (let i = 0; i < stateSequence.length - 1; i++) {
    if (!EngagementStateMachine.canTransition(stateSequence[i], stateSequence[i + 1])) {
      errors.push(`Invalid transition at step ${i}: ${stateSequence[i]} → ${stateSequence[i + 1]}`);
    }
  }

  // 5. HARD EXPIRY CHECK
  if (engagement.currentState !== EngagementState.EXPIRED && 
      new Date() > engagement.expiresAt) {
    errors.push('Engagement is expired but not in EXPIRED state - SYSTEM INTEGRITY VIOLATION');
  }

  return errors;
}

// ==================== TYPE GUARDS ====================
function isActiveState(state) {
  return !EngagementStateMachine.isTerminalState(state);
}

function isVerificationState(state) {
  return EngagementStateMachine.isVerificationState(state);
}

function isVerificationReady(state) {
  return EngagementStateMachine.canStartVerification(state);
}

// ==================== EXPORTS ====================
module.exports = {
  EngagementState,
  EngagementStateMachine,
  createEngagement,
  transitionEngagement,
  checkAndHandleExpiry,
  validateEngagement,
  isActiveState,
  isVerificationState,
  isVerificationReady
};
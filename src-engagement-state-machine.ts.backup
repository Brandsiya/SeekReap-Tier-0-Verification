// 30-minute expiry implemented
// 30 * 60 * 1000 milliseconds = 30 minutes
import { v4 as uuidv4 } from 'uuid';

/**
 * WEEK 1 DELIVERABLE: Engagement Lifecycle Engine
 * 
 * Enforces deterministic state transitions as specified:
 * - Illegal transitions rejected
 * - Time-bound engagement expiry
 * - One active engagement per session
 * 
 * REFINED FOR WEEK 2 VERIFICATION READINESS
 */

// ==================== STATE DEFINITIONS ====================
export enum EngagementState {
  /** Initial state - engagement created, awaiting user completion */
  CREATED = 'created',

  /** User has submitted all required evidence (user action complete) */
  COMPLETED = 'completed',

  /** System is verifying the submitted evidence (awaiting verification) */
  PENDING_VERIFICATION = 'pending_verification',

  /** System verification successful - ready for partner consumption */
  VERIFIED = 'verified',

  /** Time-based expiry (30 minutes from creation) */
  EXPIRED = 'expired',

  /** Verification or processing failure */
  FAILED = 'failed'
}

// ==================== VERIFICATION METADATA ====================
/**
 * Isolated verification concerns for Week 2
 * Keeps verification logic separate from core engagement state
 */
export interface VerificationMetadata {
  /** Single-use verification token (Week 2) */
  token: string;
  
  /** When token expires (shorter than engagement expiry) */
  tokenExpiresAt: Date;
  
  /** Number of verification attempts made */
  attempts: number;
  
  /** Maximum allowed attempts before failure */
  maxAttempts: number;
  
  /** Last verification attempt timestamp */
  lastAttempt?: Date;
  
  /** Method used for verification */
  verificationMethod?: 'api' | 'webhook' | 'manual';
  
  /** Verification result signature/hash (Week 3) */
  verificationSignature?: string;
}

// ==================== EVIDENCE METADATA ====================
/**
 * Placeholder for Week 3 evidence system
 */
export interface EvidenceMetadata {
  /** Hash of submitted evidence */
  evidenceHash?: string;
  
  /** Timestamp when evidence was submitted */
  submittedAt?: Date;
  
  /** Type/form of evidence submitted */
  evidenceType?: string;
}

// ==================== VALID TRANSITIONS ====================
/**
 * REFINED TRANSITION MATRIX for Week 2 verification flow:
 * 
 * CREATED → COMPLETED        (user submits evidence)
 * CREATED → FAILED           (user abandonment/system error)
 * CREATED → EXPIRED          (30-minute expiry)
 * 
 * COMPLETED → PENDING_VERIFICATION (system begins verification)
 * COMPLETED → FAILED         (evidence rejection)
 * COMPLETED → EXPIRED        (verification timeout)
 * 
 * PENDING_VERIFICATION → VERIFIED   (verification successful)
 * PENDING_VERIFICATION → FAILED     (verification failed)
 * PENDING_VERIFICATION → EXPIRED    (verification expired)
 * 
 * VERIFIED is terminal - ready for partner API consumption
 */
const VALID_TRANSITIONS: Record<EngagementState, EngagementState[]> = {
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

  [EngagementState.VERIFIED]: [],   // Terminal state
  [EngagementState.EXPIRED]: [],    // Terminal state
  [EngagementState.FAILED]: []      // Terminal state
};

// ==================== STATE MACHINE CLASS ====================
export class EngagementStateMachine {
  /**
   * Validates if a state transition is allowed
   */
  static canTransition(from: EngagementState, to: EngagementState): boolean {
    if (!VALID_TRANSITIONS[from]) {
      throw new Error(`Invalid from state: ${from}`);
    }
    return VALID_TRANSITIONS[from].includes(to);
  }

  /**
   * Gets all valid next states from current state
   */
  static getValidTransitions(currentState: EngagementState): EngagementState[] {
    return [...VALID_TRANSITIONS[currentState]];
  }

  /**
   * Checks if a state is terminal (no further transitions allowed)
   */
  static isTerminalState(state: EngagementState): boolean {
    return VALID_TRANSITIONS[state].length === 0;
  }

  /**
   * Checks if verification can be initiated from current state
   */
  static canStartVerification(state: EngagementState): boolean {
    return state === EngagementState.COMPLETED;
  }

  /**
   * Checks if state represents a verification state
   */
  static isVerificationState(state: EngagementState): boolean {
    return state === EngagementState.PENDING_VERIFICATION || 
           state === EngagementState.VERIFIED;
  }
}

// ==================== ENGAGEMENT MODEL ====================
export interface Engagement {
  /** Unique identifier (UUIDv4) */
  id: string;

  /** Session ID from Phase 1 authentication */
  sessionId: string;

  /** Current state (must be one of EngagementState enum) */
  currentState: EngagementState;

  /** Previous state (for rollback/reporting) */
  previousState: EngagementState;

  /** Timestamp when engagement was created */
  createdAt: Date;

  /** Absolute expiry time (30 minutes from creation) - HARD GUARANTEE */
  expiresAt: Date;

  /** Timestamp when user completed evidence submission */
  completedAt?: Date;

  /** Timestamp when verification was completed */
  verifiedAt?: Date;

  /** Isolated verification metadata (Week 2) */
  verification?: VerificationMetadata;

  /** Evidence metadata placeholder (Week 3) */
  evidence?: EvidenceMetadata;

  /** Complete audit trail of all state transitions */
  stateHistory: StateTransition[];
}

export interface StateTransition {
  /** State after transition */
  state: EngagementState;

  /** When transition occurred */
  timestamp: Date;

  /** What triggered the transition */
  triggeredBy: 'user' | 'system' | 'timeout' | 'verification';

  /** Optional metadata about transition */
  metadata?: Record<string, any>;
}

// ==================== ENGAGEMENT CREATION ====================
/**
 * Creates a new engagement with initial CREATED state
 * Enforces: One active engagement per session (atomic enforcement in service layer)
 * Enforces: 30-minute expiry implemented
 */
export function createEngagement(sessionId: string): Engagement {
  const now = new Date();

  // 30-minute expiry implemented (30 * 60 * 1000 milliseconds)
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

  const engagement: Engagement = {
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
/**
 * Transitions an engagement to a new state with full validation
 * INCLUDES EXPIRY CHECK ON EVERY TRANSITION
 */
export function transitionEngagement(
  engagement: Engagement,
  newState: EngagementState,
  triggeredBy: StateTransition['triggeredBy'],
  metadata?: Record<string, any>
): Engagement | null {

  // 1. HARD EXPIRY CHECK - Enforced on every transition attempt
  if (new Date() > engagement.expiresAt) {
    // Auto-transition to expired if not already expired
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
/**
 * Checks if engagement is expired and transitions it if needed
 * Returns true if engagement was expired by this check
 * 
 * ⚠️ This is a HARD ENFORCEMENT, not passive cleanup
 */
export function checkAndHandleExpiry(engagement: Engagement): boolean {
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

// ==================== VERIFICATION HELPER ====================
/**
 * Prepares engagement for verification (Week 2)
 */
export function prepareForVerification(
  engagement: Engagement,
  verificationToken: string,
  tokenExpiryMinutes: number = 5
): Engagement | null {
  
  // 1. Check if verification can be started
  if (!EngagementStateMachine.canStartVerification(engagement.currentState)) {
    return null;
  }

  // 2. Check expiry (HARD ENFORCEMENT)
  if (new Date() > engagement.expiresAt) {
    return null;
  }

  // 3. Set up verification metadata
  engagement.verification = {
    token: verificationToken,
    tokenExpiresAt: new Date(new Date().getTime() + tokenExpiryMinutes * 60 * 1000),
    attempts: 0,
    maxAttempts: 3,
    verificationMethod: 'api'
  };

  // 4. Transition to pending verification
  return transitionEngagement(
    engagement,
    EngagementState.PENDING_VERIFICATION,
    'verification',
    { verificationInitiated: true }
  );
}

// ==================== VALIDATION UTILITIES ====================
export function validateEngagement(engagement: Engagement): string[] {
  const errors: string[] = [];

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

  // 5. HARD EXPIRY CHECK - Engagement must not be expired unless in EXPIRED state
  if (engagement.currentState !== EngagementState.EXPIRED && 
      new Date() > engagement.expiresAt) {
    errors.push('Engagement is expired but not in EXPIRED state - SYSTEM INTEGRITY VIOLATION');
  }

  // 6. Check verification metadata if present
  if (engagement.verification) {
    if (engagement.verification.attempts > engagement.verification.maxAttempts) {
      errors.push('Verification attempts exceed maximum');
    }
    if (engagement.verification.tokenExpiresAt < new Date()) {
      errors.push('Verification token expired');
    }
  }

  return errors;
}

// ==================== TYPE GUARDS ====================
export function isActiveState(state: EngagementState): boolean {
  return !EngagementStateMachine.isTerminalState(state);
}

export function isVerificationState(state: EngagementState): boolean {
  return EngagementStateMachine.isVerificationState(state);
}

export function isVerificationReady(state: EngagementState): boolean {
  return EngagementStateMachine.canStartVerification(state);
}

// ==================== EXPORTS ====================
export default {
  EngagementState,
  EngagementStateMachine,
  createEngagement,
  transitionEngagement,
  checkAndHandleExpiry,
  prepareForVerification,
  validateEngagement,
  isActiveState,
  isVerificationState,
  isVerificationReady
};

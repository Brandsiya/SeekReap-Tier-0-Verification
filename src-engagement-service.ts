// 30-minute expiry implemented
// 30 * 60 * 1000 milliseconds = 30 minutes
import { Mutex } from 'async-mutex';
import { 
  Engagement,
  EngagementState, 
  EngagementStateMachine, 
  createEngagement, 
  transitionEngagement, 
  checkAndHandleExpiry,
  prepareForVerification,
  validateEngagement,
  isActiveState,
  isVerificationReady
} from './src-engagement-state-machine';

/**
 * Engagement Service Layer
 * 
 * ⚠️ CONCURRENCY SAFETY NOTE:
 * Session-level mutex guarantees atomicity within a single runtime process.
 * 
 * SCALING REQUIREMENT:
 * This implementation provides atomicity within a single Node.js process.
 * For horizontal scaling (multiple instances), Redis or database-level
 * distributed locking will be required (planned for Phase 3 scaling).
 */

export class EngagementService {
  private engagements = new Map<string, Engagement>(); // engagementId -> Engagement
  private sessionMutexes = new Map<string, Mutex>();

  /**
   * Creates a new engagement with atomic session protection
   * Guarantees: One active engagement per session
   * Time Complexity: O(1) with mutex overhead
   */
  async createEngagement(sessionId: string): Promise<Engagement> {
    // Get or create mutex for this session
    let mutex = this.sessionMutexes.get(sessionId);
    if (!mutex) {
      mutex = new Mutex();
      this.sessionMutexes.set(sessionId, mutex);
    }

    // Execute with session-level atomicity
    return mutex.runExclusive(async () => {
      // HARD ENFORCEMENT: Check for existing active engagement
      const existing = this.getActiveEngagement(sessionId);
      if (existing && isActiveState(existing.currentState)) {
        throw new EngagementError(
          'ACTIVE_ENGAGEMENT_EXISTS',
          'Session already has an active engagement',
          409 // Conflict
        );
      }

      // Create new engagement with 30-minute expiry
      const engagement = createEngagement(sessionId);
      this.engagements.set(engagement.id, engagement);

      // Clean up old mutex if no engagements remain for this session
      this.cleanupMutex(sessionId);

      return engagement;
    });
  }

  /**
   * Gets active engagement for session with expiry check
   * Performs HARD expiry enforcement on every read
   */
  getActiveEngagement(sessionId: string): Engagement | null {
    const engagement = Array.from(this.engagements.values())
      .find(e => e.sessionId === sessionId && isActiveState(e.currentState));

    if (engagement) {
      // EXPIRY ENFORCEMENT: Check and handle expiry on every read
      const wasExpired = checkAndHandleExpiry(engagement);
      if (wasExpired) {
        return null; // Engagement just expired
      }
    }

    return engagement || null;
  }

  /**
   * Gets engagement by ID (for routes that need specific engagement)
   */
  getEngagementById(sessionId: string, engagementId: string): Engagement | null {
    const engagement = this.engagements.get(engagementId);
    if (!engagement || engagement.sessionId !== sessionId) {
      return null;
    }

    // Apply expiry check
    checkAndHandleExpiry(engagement);
    return engagement;
  }

  /**
   * Verification endpoint (Week 2 implementation)
   * Includes atomic session protection and verification token logic
   */
  async verifyEngagement(sessionId: string, verificationToken: string): Promise<Engagement> {
    const mutex = this.sessionMutexes.get(sessionId);
    if (!mutex) {
      throw new EngagementError('NO_ACTIVE_SESSION', 'No active session found', 404);
    }

    return mutex.runExclusive(async () => {
      const engagement = this.getActiveEngagement(sessionId);
      if (!engagement) {
        throw new EngagementError('NO_ACTIVE_ENGAGEMENT', 'No active engagement found', 404);
      }

      // HARD EXPIRY CHECK - Must pass before verification
      if (checkAndHandleExpiry(engagement)) {
        throw new EngagementError('ENGAGEMENT_EXPIRED', 'Engagement has expired', 410);
      }

      // Week 2: Prepare for verification with token
      const prepared = prepareForVerification(engagement, verificationToken, 5); // 5-minute token expiry
      if (!prepared) {
        throw new EngagementError(
          'VERIFICATION_NOT_READY',
          'Engagement is not ready for verification',
          400
        );
      }

      // Check verification metadata
      if (!prepared.verification) {
        throw new EngagementError(
          'VERIFICATION_METADATA_MISSING',
          'Verification metadata not found',
          500
        );
      }

      // Verify token matches
      if (prepared.verification.token !== verificationToken) {
        // Increment attempt counter
        prepared.verification.attempts++;
        prepared.verification.lastAttempt = new Date();

        // Check if max attempts exceeded
        if (prepared.verification.attempts >= prepared.verification.maxAttempts) {
          const failedResult = transitionEngagement(
            prepared,
            EngagementState.FAILED,
            'verification',
            { reason: 'max_verification_attempts_exceeded' }
          );
          throw new EngagementError(
            'MAX_ATTEMPTS_EXCEEDED',
            'Maximum verification attempts exceeded',
            429
          );
        }

        throw new EngagementError(
          'INVALID_TOKEN',
          'Invalid verification token',
          401
        );
      }

      // Check token expiry
      if (prepared.verification.tokenExpiresAt < new Date()) {
        throw new EngagementError(
          'TOKEN_EXPIRED',
          'Verification token has expired',
          401
        );
      }

      // All checks passed - transition to VERIFIED
      const result = transitionEngagement(
        prepared,
        EngagementState.VERIFIED,
        'verification',
        { 
          tokenUsed: verificationToken,
          attempts: prepared.verification.attempts,
          verifiedAt: new Date()
        }
      );

      if (!result) {
        throw new EngagementError('VERIFICATION_FAILED', 'Verification transition failed', 500);
      }

      return result;
    });
  }

  /**
   * Completes an engagement (user submits evidence)
   * Includes atomic session protection
   */
  async completeEngagement(sessionId: string, evidenceData?: any): Promise<Engagement> {
    const mutex = this.sessionMutexes.get(sessionId);
    if (!mutex) {
      throw new EngagementError('NO_ACTIVE_SESSION', 'No active session found', 404);
    }

    return mutex.runExclusive(async () => {
      const engagement = this.getActiveEngagement(sessionId);
      if (!engagement) {
        throw new EngagementError('NO_ACTIVE_ENGAGEMENT', 'No active engagement found', 404);
      }

      // HARD EXPIRY CHECK - Must pass before completion
      if (checkAndHandleExpiry(engagement)) {
        throw new EngagementError('ENGAGEMENT_EXPIRED', 'Engagement has expired', 410);
      }

      // Transition to completed state
      const result = transitionEngagement(
        engagement,
        EngagementState.COMPLETED,
        'user',
        { evidenceSubmitted: true, evidenceData }
      );

      if (!result) {
        throw new EngagementError('COMPLETION_FAILED', 'Cannot complete engagement', 400);
      }

      return result;
    });
  }

  /**
   * Validates engagement integrity
   */
  validateEngagement(engagement: Engagement): string[] {
    return validateEngagement(engagement);
  }

  /**
   * Checks if engagement is active (not terminal) - kept for backward compatibility
   */
  private isActive(engagement: Engagement): boolean {
    return isActiveState(engagement.currentState);
  }

  /**
   * Cleans up mutex if no engagements remain for session
   */
  private cleanupMutex(sessionId: string): void {
    const hasEngagements = Array.from(this.engagements.values())
      .some(e => e.sessionId === sessionId && isActiveState(e.currentState));

    if (!hasEngagements) {
      this.sessionMutexes.delete(sessionId);
    }
  }

  /**
   * Gets all engagements (for debugging/admin)
   */
  getAllEngagements(): Engagement[] {
    return Array.from(this.engagements.values());
  }

  /**
   * Checks if verification is ready for engagement
   */
  isVerificationReady(sessionId: string): boolean {
    const engagement = this.getActiveEngagement(sessionId);
    return engagement ? isVerificationReady(engagement.currentState) : false;
  }

  /**
   * Force expire an engagement (for testing/admin)
   */
  async forceExpireEngagement(sessionId: string): Promise<boolean> {
    const mutex = this.sessionMutexes.get(sessionId);
    if (!mutex) {
      return false;
    }

    return mutex.runExclusive(async () => {
      const engagement = this.getActiveEngagement(sessionId);
      if (!engagement) {
        return false;
      }

      // Set expiry to past
      engagement.expiresAt = new Date(Date.now() - 1000);
      return checkAndHandleExpiry(engagement);
    });
  }
}

/**
 * Engagement-specific error class
 */
export class EngagementError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'EngagementError';
  }
}

// Singleton service instance
export const engagementService = new EngagementService();

export default engagementService;
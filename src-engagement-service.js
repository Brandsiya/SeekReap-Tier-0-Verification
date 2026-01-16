// src-engagement-service.js - JavaScript version
const { Mutex } = require('async-mutex');
const { 
  EngagementState,
  EngagementStateMachine,
  createEngagement,
  transitionEngagement,
  checkAndHandleExpiry,
  validateEngagement,
  isActiveState,
  isVerificationReady
} = require('./src-engagement-state-machine.js');

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

class EngagementService {
  constructor() {
    this.engagements = new Map(); // engagementId -> Engagement
    this.sessionMutexes = new Map();
  }
  
  /**
   * Creates a new engagement with atomic session protection
   */
  async createEngagement(sessionId) {
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
   */
  getActiveEngagement(sessionId) {
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
   * Gets engagement by ID
   */
  getEngagementById(sessionId, engagementId) {
    const engagement = this.engagements.get(engagementId);
    if (!engagement || engagement.sessionId !== sessionId) {
      return null;
    }
    
    // Apply expiry check
    checkAndHandleExpiry(engagement);
    return engagement;
  }
  
  /**
   * Completes an engagement (user submits evidence)
   */
  async completeEngagement(sessionId, evidenceData) {
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
  validateEngagement(engagement) {
    return validateEngagement(engagement);
  }
  
  /**
   * Checks if engagement is active (not terminal)
   */
  isActive(engagement) {
    return isActiveState(engagement.currentState);
  }
  
  /**
   * Cleans up mutex if no engagements remain for session
   */
  cleanupMutex(sessionId) {
    const hasEngagements = Array.from(this.engagements.values())
      .some(e => e.sessionId === sessionId && isActiveState(e.currentState));
    
    if (!hasEngagements) {
      this.sessionMutexes.delete(sessionId);
    }
  }
  
  /**
   * Gets all engagements (for debugging/admin)
   */
  getAllEngagements() {
    return Array.from(this.engagements.values());
  }

  /**
   * Checks if verification is ready for engagement
   */
  isVerificationReady(sessionId) {
    const engagement = this.getActiveEngagement(sessionId);
    return engagement ? isVerificationReady(engagement.currentState) : false;
  }

  /**
   * Force expire an engagement (for testing/admin)
   */
  async forceExpireEngagement(sessionId) {
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
class EngagementError extends Error {
  constructor(code, message, statusCode = 400, details) {
    super(message);
    this.name = 'EngagementError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Singleton service instance
const engagementService = new EngagementService();

module.exports = {
  engagementService,
  EngagementError
};
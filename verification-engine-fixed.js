// verification-engine-fixed.js - Fixed version with proper verifier management
const EventEmitter = require('events');

// ==================== VERIFICATION STATES ====================
const VerificationStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged',
  CANCELLED: 'cancelled'
};

// ==================== VERIFICATION OUTCOMES ====================
const VerificationOutcome = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  SUSPICIOUS: 'suspicious'
};

// ==================== FRAUD DETECTION RULES ====================
const FraudDetectionRules = {
  TOO_FAST: {
    name: 'completion_too_fast',
    threshold: 5000,
    message: 'Engagement completed too quickly'
  },
  GEO_MISMATCH: {
    name: 'geolocation_mismatch',
    message: 'IP geolocation does not match user profile'
  },
  DEVICE_FINGERPRINT: {
    name: 'suspicious_device',
    message: 'Device fingerprint matches known patterns'
  }
};

// ==================== VERIFICATION ENGINE CLASS ====================
class VerificationEngine extends EventEmitter {
  constructor() {
    super();
    this.verifications = new Map();
    this.verifiers = new Map();
    this.fraudPatterns = new Set();
    this.initializeDefaultVerifiers();
    
    // Track verifier availability separately
    this.availableVerifiers = new Set();
  }

  // ==================== VERIFIER MANAGEMENT ====================
  initializeDefaultVerifiers() {
    // Clear any existing
    this.verifiers.clear();
    this.availableVerifiers.clear();
    
    // System verifiers (always available)
    this.addVerifier({
      id: 'system-ai',
      name: 'AI Fraud Detection',
      type: 'automated',
      trustScore: 0.95,
      alwaysAvailable: true
    });

    this.addVerifier({
      id: 'system-rules',
      name: 'Rule Engine',
      type: 'automated',
      trustScore: 0.99,
      alwaysAvailable: true
    });

    // Human verifiers
    this.addVerifier({
      id: 'verifier-1',
      name: 'Primary Human Verifier',
      type: 'human',
      trustScore: 0.85
    });

    this.addVerifier({
      id: 'verifier-2', 
      name: 'Secondary Human Verifier',
      type: 'human',
      trustScore: 0.80
    });
    
    console.log('✅ Initialized verifiers:', Array.from(this.verifiers.keys()));
  }

  addVerifier(verifier) {
    const verifierData = {
      ...verifier,
      metrics: {
        totalAssignments: 0,
        completedAssignments: 0,
        approvalRate: 0,
        avgProcessingTime: 0
      },
      currentAssignment: null,
      isAvailable: !verifier.alwaysAvailable ? true : false
    };
    
    this.verifiers.set(verifier.id, verifierData);
    
    if (verifierData.isAvailable) {
      this.availableVerifiers.add(verifier.id);
    }
  }

  getAvailableVerifier(type = 'human') {
    // For automated verifiers, always return them
    if (type === 'automated') {
      return Array.from(this.verifiers.values())
        .filter(v => v.type === 'automated')[0];
    }
    
    // For human verifiers, check availability
    const availableIds = Array.from(this.availableVerifiers);
    if (availableIds.length === 0) {
      return null;
    }
    
    // Get the highest trust score available verifier
    return availableIds
      .map(id => this.verifiers.get(id))
      .filter(v => v.type === 'human')
      .sort((a, b) => b.trustScore - a.trustScore)[0] || null;
  }

  markVerifierBusy(verifierId) {
    const verifier = this.verifiers.get(verifierId);
    if (verifier && !verifier.alwaysAvailable) {
      verifier.isAvailable = false;
      verifier.currentAssignment = Date.now();
      this.availableVerifiers.delete(verifierId);
    }
  }

  markVerifierAvailable(verifierId) {
    const verifier = this.verifiers.get(verifierId);
    if (verifier && !verifier.alwaysAvailable) {
      verifier.isAvailable = true;
      verifier.currentAssignment = null;
      this.availableVerifiers.add(verifierId);
      
      // Update metrics
      if (verifier.metrics.totalAssignments > 0) {
        verifier.metrics.avgProcessingTime = 
          (verifier.metrics.avgProcessingTime * (verifier.metrics.completedAssignments - 1) + 
           (Date.now() - verifier.currentAssignment)) / verifier.metrics.completedAssignments;
      }
    }
  }

  // ==================== VERIFICATION CREATION ====================
  createVerification(engagement, evidence) {
    const verificationId = `verif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fraudCheck = this.runFraudDetection(engagement, evidence);
    
    const verification = {
      id: verificationId,
      engagementId: engagement.id,
      sessionId: engagement.sessionId,
      status: VerificationStatus.PENDING,
      evidence,
      fraudCheck,
      createdAt: new Date(),
      assignedTo: null,
      decisions: [],
      auditTrail: [{
        action: 'verification_created',
        timestamp: new Date(),
        actor: 'system',
        details: { engagementId: engagement.id, fraudCheck }
      }],
      metadata: {
        priority: fraudCheck.riskScore > 0.7 ? 'high' : 'normal',
        requiredVerifications: 1 // Simplified for testing
      }
    };

    this.verifications.set(verificationId, verification);
    
    // Auto-assign if high priority
    if (verification.metadata.priority === 'high') {
      this.assignVerification(verificationId);
    }

    this.emit('verification.created', verification);
    return verification;
  }

  // ==================== FRAUD DETECTION ====================
  runFraudDetection(engagement, evidence) {
    const riskFactors = [];
    let riskScore = 0;

    // Check completion speed
    if (engagement.completedAt && engagement.createdAt) {
      const completionTime = engagement.completedAt - engagement.createdAt;
      if (completionTime < FraudDetectionRules.TOO_FAST.threshold) {
        riskFactors.push({
          rule: FraudDetectionRules.TOO_FAST,
          value: completionTime,
          risk: 0.7
        });
        riskScore += 0.7;
      }
    }

    // Check geolocation
    if (evidence.geolocation && evidence.userProfile?.location) {
      const distance = this.calculateDistance(
        evidence.geolocation,
        evidence.userProfile.location
      );
      if (distance > 100) {
        riskFactors.push({
          rule: FraudDetectionRules.GEO_MISMATCH,
          value: `${distance}km`,
          risk: 0.6
        });
        riskScore += 0.6;
      }
    }

    // Check device fingerprint
    if (evidence.deviceFingerprint) {
      if (this.fraudPatterns.has(evidence.deviceFingerprint)) {
        riskFactors.push({
          rule: FraudDetectionRules.DEVICE_FINGERPRINT,
          risk: 0.9
        });
        riskScore += 0.9;
      }
    }

    riskScore = Math.min(1, riskScore);

    return {
      riskScore,
      riskFactors,
      requiresHumanReview: riskScore > 0.5,
      flagged: riskScore > 0.7
    };
  }

  calculateDistance(loc1, loc2) {
    return Math.sqrt(
      Math.pow(loc1.lat - loc2.lat, 2) + 
      Math.pow(loc1.lng - loc2.lng, 2)
    ) * 111;
  }

  // ==================== VERIFICATION ASSIGNMENT ====================
  assignVerification(verificationId) {
    const verification = this.verifications.get(verificationId);
    if (!verification) {
      throw new VerificationError('VERIFICATION_NOT_FOUND', 'Verification not found', 404);
    }

    if (verification.status !== VerificationStatus.PENDING) {
      throw new VerificationError('INVALID_STATUS', 'Verification not pending', 400);
    }

    const verifier = this.getAvailableVerifier('human');
    if (!verifier) {
      // Fallback to automated verifier
      const autoVerifier = this.getAvailableVerifier('automated');
      if (!autoVerifier) {
        throw new VerificationError('NO_VERIFIER_AVAILABLE', 'No verifier available', 503);
      }
      verification.assignedTo = autoVerifier.id;
    } else {
      verification.assignedTo = verifier.id;
      this.markVerifierBusy(verifier.id);
      
      // Update metrics
      const verifierData = this.verifiers.get(verifier.id);
      verifierData.metrics.totalAssignments++;
    }

    verification.auditTrail.push({
      action: 'verification_assigned',
      timestamp: new Date(),
      actor: 'system',
      details: { verifierId: verification.assignedTo }
    });

    this.emit('verification.assigned', { verificationId, verifierId: verification.assignedTo });
    return verification;
  }

  // ==================== DECISION MAKING ====================
  async makeDecision(verificationId, decision, verifierId, notes = '') {
    const verification = this.verifications.get(verificationId);
    if (!verification) {
      throw new VerificationError('VERIFICATION_NOT_FOUND', 'Verification not found', 404);
    }

    // For automated verifiers, skip assignment check
    const verifier = this.verifiers.get(verifierId);
    if (verifier && verifier.type === 'human' && verification.assignedTo !== verifierId) {
      throw new VerificationError('UNAUTHORIZED', 'Not assigned to this verification', 403);
    }

    if (![VerificationStatus.APPROVED, VerificationStatus.REJECTED, VerificationStatus.FLAGGED].includes(decision)) {
      throw new VerificationError('INVALID_DECISION', 'Invalid decision', 400);
    }

    // Record decision
    const decisionRecord = {
      decision,
      verifierId,
      timestamp: new Date(),
      notes,
      fraudCheck: verification.fraudCheck
    };

    verification.decisions.push(decisionRecord);
    verification.auditTrail.push({
      action: 'decision_made',
      timestamp: new Date(),
      actor: verifierId,
      details: decisionRecord
    });

    // Finalize if we have enough decisions
    if (verification.decisions.length >= verification.metadata.requiredVerifications) {
      await this.finalizeVerification(verificationId);
    }

    // Release human verifier
    if (verifier && verifier.type === 'human') {
      this.markVerifierAvailable(verifierId);
    }

    this.emit('decision.made', { verificationId, decision, verifierId });
    return decisionRecord;
  }

  // ==================== FINALIZATION ====================
  async finalizeVerification(verificationId) {
    const verification = this.verifications.get(verificationId);
    if (!verification) return;

    const decisions = verification.decisions;
    const approvalCount = decisions.filter(d => d.decision === VerificationStatus.APPROVED).length;
    const rejectionCount = decisions.filter(d => d.decision === VerificationStatus.REJECTED).length;

    let finalStatus, outcome;
    
    if (approvalCount > rejectionCount) {
      finalStatus = VerificationStatus.APPROVED;
      outcome = VerificationOutcome.SUCCESS;
    } else {
      finalStatus = VerificationStatus.REJECTED;
      outcome = VerificationOutcome.FAILURE;
      
      // Learn from rejections
      if (verification.evidence.deviceFingerprint) {
        this.fraudPatterns.add(verification.evidence.deviceFingerprint);
      }
    }

    verification.status = finalStatus;
    verification.finalizedAt = new Date();
    verification.finalOutcome = outcome;

    verification.auditTrail.push({
      action: 'verification_finalized',
      timestamp: new Date(),
      actor: 'system',
      details: { finalStatus, outcome }
    });

    this.emit('verification.finalized', verification);
    return verification;
  }

  // ==================== QUERY METHODS ====================
  getVerification(id) {
    return this.verifications.get(id);
  }

  getVerificationsByStatus(status) {
    return Array.from(this.verifications.values())
      .filter(v => v.status === status);
  }

  getAuditTrail(verificationId) {
    const verification = this.verifications.get(verificationId);
    return verification ? verification.auditTrail : [];
  }

  getStatistics() {
    const allVerifications = Array.from(this.verifications.values());
    const total = allVerifications.length;

    return {
      total,
      byStatus: {
        [VerificationStatus.PENDING]: allVerifications.filter(v => v.status === VerificationStatus.PENDING).length,
        [VerificationStatus.APPROVED]: allVerifications.filter(v => v.status === VerificationStatus.APPROVED).length,
        [VerificationStatus.REJECTED]: allVerifications.filter(v => v.status === VerificationStatus.REJECTED).length,
        [VerificationStatus.FLAGGED]: allVerifications.filter(v => v.status === VerificationStatus.FLAGGED).length
      },
      fraudDetection: {
        avgRiskScore: total > 0 ? 
          allVerifications.reduce((sum, v) => sum + v.fraudCheck.riskScore, 0) / total : 0
      }
    };
  }
}

// ==================== ERROR CLASS ====================
class VerificationError extends Error {
  constructor(code, message, statusCode = 400, details) {
    super(message);
    this.name = 'VerificationError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// ==================== EXPORTS ====================
module.exports = {
  VerificationEngine,
  VerificationStatus,
  VerificationOutcome,
  FraudDetectionRules,
  VerificationError
};
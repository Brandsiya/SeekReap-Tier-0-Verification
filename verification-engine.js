// verification-engine.js - Week 2: Verification Engine
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
  // Time-based rules
  TOO_FAST: {
    name: 'completion_too_fast',
    threshold: 5000, // 5 seconds minimum
    message: 'Engagement completed too quickly (potential automation)'
  },
  
  REPEATED_PATTERN: {
    name: 'repeated_pattern',
    threshold: 3,
    message: 'Repeated pattern detected across multiple engagements'
  },
  
  GEO_MISMATCH: {
    name: 'geolocation_mismatch',
    message: 'IP geolocation does not match user profile location'
  },
  
  DEVICE_FINGERPRINT: {
    name: 'suspicious_device',
    message: 'Device fingerprint matches known suspicious patterns'
  }
};

// ==================== EVIDENCE VALIDATION RULES ====================
const EvidenceValidationRules = {
  MIN_EVIDENCE_COUNT: 3,
  REQUIRED_FIELDS: ['userId', 'timestamp', 'actionType'],
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  TIMESTAMP_TOLERANCE: 5 * 60 * 1000 // 5 minutes
};

// ==================== VERIFICATION ENGINE CLASS ====================
class VerificationEngine extends EventEmitter {
  constructor() {
    super();
    this.verifications = new Map(); // verificationId → Verification
    this.verifiers = new Map(); // verifierId → Verifier
    this.fraudPatterns = new Set();
    this.initializeDefaultVerifiers();
  }

  // ==================== VERIFIER MANAGEMENT ====================
  initializeDefaultVerifiers() {
    // System verifiers (automated)
    this.addVerifier({
      id: 'system-ai',
      name: 'AI Fraud Detection',
      type: 'automated',
      trustScore: 0.95
    });

    this.addVerifier({
      id: 'system-rules',
      name: 'Rule Engine',
      type: 'automated',
      trustScore: 0.99
    });

    // Human verifiers
    this.addVerifier({
      id: 'verifier-1',
      name: 'Primary Human Verifier',
      type: 'human',
      trustScore: 0.85,
      available: true
    });

    this.addVerifier({
      id: 'verifier-2',
      name: 'Secondary Human Verifier',
      type: 'human',
      trustScore: 0.80,
      available: true
    });
  }

  addVerifier(verifier) {
    this.verifiers.set(verifier.id, {
      ...verifier,
      metrics: {
        totalAssignments: 0,
        completedAssignments: 0,
        approvalRate: 0,
        avgProcessingTime: 0
      }
    });
  }

  getAvailableVerifier(type = 'human') {
    return Array.from(this.verifiers.values())
      .filter(v => v.type === type && v.available === true)
      .sort((a, b) => b.trustScore - a.trustScore)[0];
  }

  // ==================== VERIFICATION CREATION ====================
  createVerification(engagement, evidence) {
    const verificationId = `verif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate evidence
    const evidenceValidation = this.validateEvidence(evidence);
    if (!evidenceValidation.valid) {
      throw new VerificationError(
        'INVALID_EVIDENCE',
        evidenceValidation.errors.join(', '),
        400
      );
    }

    // Run initial fraud detection
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
        requiredVerifications: fraudCheck.riskScore > 0.8 ? 2 : 1
      }
    };

    this.verifications.set(verificationId, verification);
    
    // Auto-assign if needed
    if (verification.metadata.priority === 'high') {
      this.assignVerification(verificationId);
    }

    this.emit('verification.created', verification);
    return verification;
  }

  // ==================== EVIDENCE VALIDATION ====================
  validateEvidence(evidence) {
    const errors = [];

    // Check minimum evidence count
    if (!evidence.items || evidence.items.length < EvidenceValidationRules.MIN_EVIDENCE_COUNT) {
      errors.push(`Minimum ${EvidenceValidationRules.MIN_EVIDENCE_COUNT} evidence items required`);
    }

    // Check required fields
    EvidenceValidationRules.REQUIRED_FIELDS.forEach(field => {
      if (!evidence[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate evidence items
    if (evidence.items) {
      evidence.items.forEach((item, index) => {
        // File type validation
        if (item.fileType && !EvidenceValidationRules.ALLOWED_FILE_TYPES.includes(item.fileType)) {
          errors.push(`Item ${index}: Invalid file type ${item.fileType}`);
        }

        // File size validation
        if (item.fileSize && item.fileSize > EvidenceValidationRules.MAX_FILE_SIZE) {
          errors.push(`Item ${index}: File size exceeds ${EvidenceValidationRules.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
        }

        // Timestamp validation
        if (item.timestamp) {
          const itemTime = new Date(item.timestamp);
          const now = new Date();
          const diff = Math.abs(now - itemTime);
          
          if (diff > EvidenceValidationRules.TIMESTAMP_TOLERANCE) {
            errors.push(`Item ${index}: Timestamp outside acceptable range`);
          }
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ==================== FRAUD DETECTION ====================
  runFraudDetection(engagement, evidence) {
    const riskFactors = [];
    let riskScore = 0;

    // 1. Check completion speed
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

    // 2. Check evidence consistency
    if (evidence.items) {
      const uniqueTimestamps = new Set(evidence.items.map(item => item.timestamp));
      if (uniqueTimestamps.size === 1 && evidence.items.length > 1) {
        riskFactors.push({
          rule: { name: 'identical_timestamps', message: 'All evidence has identical timestamps' },
          risk: 0.5
        });
        riskScore += 0.5;
      }
    }

    // 3. Check device fingerprint (simplified)
    if (evidence.deviceFingerprint) {
      if (this.fraudPatterns.has(evidence.deviceFingerprint)) {
        riskFactors.push({
          rule: FraudDetectionRules.DEVICE_FINGERPRINT,
          risk: 0.9
        });
        riskScore += 0.9;
      }
    }

    // 4. Check geolocation (simplified)
    if (evidence.geolocation && evidence.userProfile?.location) {
      const distance = this.calculateDistance(
        evidence.geolocation,
        evidence.userProfile.location
      );
      if (distance > 100) { // More than 100km difference
        riskFactors.push({
          rule: FraudDetectionRules.GEO_MISMATCH,
          value: `${distance}km`,
          risk: 0.6
        });
        riskScore += 0.6;
      }
    }

    riskScore = Math.min(1, riskScore); // Cap at 1

    return {
      riskScore,
      riskFactors,
      requiresHumanReview: riskScore > 0.5,
      flagged: riskScore > 0.7
    };
  }

  calculateDistance(loc1, loc2) {
    // Simplified distance calculation (Haversine formula would be used in production)
    return Math.sqrt(
      Math.pow(loc1.lat - loc2.lat, 2) + 
      Math.pow(loc1.lng - loc2.lng, 2)
    ) * 111; // Approximate km per degree
  }

  // ==================== VERIFICATION ASSIGNMENT ====================
  assignVerification(verificationId) {
    const verification = this.verifications.get(verificationId);
    if (!verification) {
      throw new VerificationError('VERIFICATION_NOT_FOUND', 'Verification not found', 404);
    }

    if (verification.status !== VerificationStatus.PENDING) {
      throw new VerificationError('INVALID_STATUS', 'Verification not in pending state', 400);
    }

    const verifier = this.getAvailableVerifier();
    if (!verifier) {
      throw new VerificationError('NO_VERIFIER_AVAILABLE', 'No verifier available', 503);
    }

    verification.assignedTo = verifier.id;
    verification.status = VerificationStatus.PENDING;
    
    // Update verifier metrics
    const verifierData = this.verifiers.get(verifier.id);
    verifierData.metrics.totalAssignments++;
    verifierData.available = false;

    verification.auditTrail.push({
      action: 'verification_assigned',
      timestamp: new Date(),
      actor: 'system',
      details: { verifierId: verifier.id, verifierName: verifier.name }
    });

    this.emit('verification.assigned', { verificationId, verifier });
    return verification;
  }

  // ==================== DECISION MAKING ====================
  async makeDecision(verificationId, decision, verifierId, notes = '') {
    const verification = this.verifications.get(verificationId);
    if (!verification) {
      throw new VerificationError('VERIFICATION_NOT_FOUND', 'Verification not found', 404);
    }

    if (verification.assignedTo !== verifierId) {
      throw new VerificationError('UNAUTHORIZED', 'Not assigned to this verification', 403);
    }

    if (![VerificationStatus.APPROVED, VerificationStatus.REJECTED, VerificationStatus.FLAGGED].includes(decision)) {
      throw new VerificationError('INVALID_DECISION', 'Invalid decision type', 400);
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

    // Check if we have enough decisions
    const required = verification.metadata.requiredVerifications;
    if (verification.decisions.length >= required) {
      await this.finalizeVerification(verificationId);
    }

    // Release verifier
    const verifier = this.verifiers.get(verifierId);
    if (verifier) {
      verifier.available = true;
      verifier.metrics.completedAssignments++;
    }

    this.emit('decision.made', { verificationId, decision, verifierId });
    return decisionRecord;
  }

  // ==================== FINALIZATION ====================
  async finalizeVerification(verificationId) {
    const verification = this.verifications.get(verificationId);
    if (!verification) return;

    // Determine final outcome based on decisions
    const decisions = verification.decisions;
    const approvalCount = decisions.filter(d => d.decision === VerificationStatus.APPROVED).length;
    const rejectionCount = decisions.filter(d => d.decision === VerificationStatus.REJECTED).length;
    const flagCount = decisions.filter(d => d.decision === VerificationStatus.FLAGGED).length;

    let finalStatus;
    let outcome;

    if (flagCount > 0) {
      finalStatus = VerificationStatus.FLAGGED;
      outcome = VerificationOutcome.SUSPICIOUS;
    } else if (approvalCount > rejectionCount) {
      finalStatus = VerificationStatus.APPROVED;
      outcome = VerificationOutcome.SUCCESS;
    } else {
      finalStatus = VerificationStatus.REJECTED;
      outcome = VerificationOutcome.FAILURE;
    }

    verification.status = finalStatus;
    verification.finalizedAt = new Date();
    verification.finalOutcome = outcome;

    verification.auditTrail.push({
      action: 'verification_finalized',
      timestamp: new Date(),
      actor: 'system',
      details: {
        finalStatus,
        outcome,
        decisionSummary: { approvalCount, rejectionCount, flagCount },
        totalDecisions: decisions.length
      }
    });

    // Update fraud patterns if rejected/flagged
    if (finalStatus === VerificationStatus.REJECTED || finalStatus === VerificationStatus.FLAGGED) {
      if (verification.evidence.deviceFingerprint) {
        this.fraudPatterns.add(verification.evidence.deviceFingerprint);
      }
    }

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

  getVerificationsBySession(sessionId) {
    return Array.from(this.verifications.values())
      .filter(v => v.sessionId === sessionId);
  }

  getVerifierMetrics(verifierId) {
    return this.verifiers.get(verifierId)?.metrics;
  }

  // ==================== AUDIT TRAIL ====================
  getAuditTrail(verificationId) {
    const verification = this.verifications.get(verificationId);
    return verification ? verification.auditTrail : [];
  }

  // ==================== STATISTICS ====================
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
      avgProcessingTime: total > 0 ? 
        allVerifications
          .filter(v => v.finalizedAt)
          .reduce((sum, v) => sum + (v.finalizedAt - v.createdAt), 0) / 
        allVerifications.filter(v => v.finalizedAt).length : 0,
      fraudDetection: {
        totalFlagged: allVerifications.filter(v => v.fraudCheck.flagged).length,
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
  EvidenceValidationRules,
  VerificationError
};
// verification-simple.js - Simplified working version
const EventEmitter = require('events');

const VerificationStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged'
};

class SimpleVerificationEngine extends EventEmitter {
  constructor() {
    super();
    this.verifications = new Map();
    this.verifiers = [
      { id: 'verifier-1', name: 'Primary Verifier', type: 'human', available: true },
      { id: 'verifier-2', name: 'Secondary Verifier', type: 'human', available: true },
      { id: 'system-ai', name: 'AI System', type: 'automated', available: true }
    ];
    this.fraudPatterns = new Set();
  }

  createVerification(engagement, evidence) {
    const verificationId = `verif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
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
        details: { fraudScore: fraudCheck.riskScore }
      }]
    };

    this.verifications.set(verificationId, verification);
    
    // Auto-assign to available verifier
    this.autoAssign(verificationId);
    
    return verification;
  }

  runFraudDetection(engagement, evidence) {
    let riskScore = 0;
    const riskFactors = [];

    // Rule 1: Fast completion
    if (engagement.completedAt && engagement.createdAt) {
      const completionTime = engagement.completedAt - engagement.createdAt;
      if (completionTime < 5000) { // 5 seconds
        riskScore += 0.7;
        riskFactors.push('Completed too fast');
      }
    }

    // Rule 2: Geolocation mismatch
    if (evidence.geolocation && evidence.userProfile?.location) {
      const loc1 = evidence.geolocation;
      const loc2 = evidence.userProfile.location;
      const distance = Math.sqrt(
        Math.pow(loc1.lat - loc2.lat, 2) + Math.pow(loc1.lng - loc2.lng, 2)
      ) * 111;
      
      if (distance > 100) {
        riskScore += 0.6;
        riskFactors.push('Geolocation mismatch');
      }
    }

    // Rule 3: Known fraud pattern
    if (evidence.deviceFingerprint && this.fraudPatterns.has(evidence.deviceFingerprint)) {
      riskScore += 0.9;
      riskFactors.push('Known fraud device');
    }

    riskScore = Math.min(1, riskScore);

    return {
      riskScore,
      riskFactors,
      requiresHumanReview: riskScore > 0.5
    };
  }

  autoAssign(verificationId) {
    const verification = this.verifications.get(verificationId);
    if (!verification || verification.assignedTo) return;

    // Find available verifier
    const verifier = this.verifiers.find(v => v.available);
    if (verifier) {
      verification.assignedTo = verifier.id;
      verification.auditTrail.push({
        action: 'verification_assigned',
        timestamp: new Date(),
        actor: 'system',
        details: { verifierId: verifier.id }
      });
      
      // Mark as busy temporarily (will be released after decision)
      verifier.available = false;
    }
  }

  getAvailableVerifier() {
    return this.verifiers.find(v => v.available) || null;
  }

  async makeDecision(verificationId, decision, verifierId, notes = '') {
    const verification = this.verifications.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    // Allow any verifier to make decision (simplified)
    const decisionRecord = {
      decision,
      verifierId,
      timestamp: new Date(),
      notes
    };

    verification.decisions.push(decisionRecord);
    verification.auditTrail.push({
      action: 'decision_made',
      timestamp: new Date(),
      actor: verifierId,
      details: { decision }
    });

    // Finalize immediately (single decision required)
    verification.status = decision;
    verification.finalizedAt = new Date();

    // Release verifier
    const verifier = this.verifiers.find(v => v.id === verifierId);
    if (verifier) {
      verifier.available = true;
    }

    // Learn from rejections
    if (decision === VerificationStatus.REJECTED && verification.evidence.deviceFingerprint) {
      this.fraudPatterns.add(verification.evidence.deviceFingerprint);
    }

    this.emit('decision.made', { verificationId, decision });
    return decisionRecord;
  }

  getVerification(id) {
    return this.verifications.get(id);
  }

  getStatistics() {
    const all = Array.from(this.verifications.values());
    return {
      total: all.length,
      pending: all.filter(v => v.status === VerificationStatus.PENDING).length,
      approved: all.filter(v => v.status === VerificationStatus.APPROVED).length,
      rejected: all.filter(v => v.status === VerificationStatus.REJECTED).length,
      flagged: all.filter(v => v.status === VerificationStatus.FLAGGED).length
    };
  }

  getAuditTrail(verificationId) {
    const verification = this.verifications.get(verificationId);
    return verification ? verification.auditTrail : [];
  }
}

module.exports = {
  SimpleVerificationEngine,
  VerificationStatus
};
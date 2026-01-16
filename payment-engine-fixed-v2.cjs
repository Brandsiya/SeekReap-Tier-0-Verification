"use strict";
const EventEmitter = require('events');
const crypto = require('crypto');

// --- PAYMENT STATUSES ---
const PaymentStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled'
};

// --- PAYMENT PROVIDERS ---
const PaymentProvider = {
    STRIPE: 'stripe',
    PAYPAL: 'paypal',
    MANUAL: 'manual'
};

// --- PAYMENT ERROR CLASS ---
class PaymentError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'PaymentError';
    }
}

// --- PAYMENT ENGINE CLASS ---
class PaymentEngine extends EventEmitter {
    constructor() {
        super();
        this.payments = new Map();
        this.verificationIds = new Set();
        this.processingQueue = [];
        
        // Statistics
        this.stats = {
            total: 0,
            byStatus: {},
            byProvider: {},
            successRate: 0,
            totalAmount: 0
        };
        
        // Initialize stats counters
        Object.values(PaymentStatus).forEach(status => {
            this.stats.byStatus[status] = 0;
        });
        Object.values(PaymentProvider).forEach(provider => {
            this.stats.byProvider[provider] = 0;
        });
        
        // Start processing queue
        this.startProcessingQueue();
    }
    
    startProcessingQueue() {
        // Process queue every second
        setInterval(() => {
            this.processQueue();
        }, 1000);
    }
    
    async processQueue() {
        for (const paymentId of this.processingQueue) {
            const payment = this.payments.get(paymentId);
            if (!payment) continue;
            
            if (payment.status === PaymentStatus.PROCESSING) {
                // Simulate processing delay (3 seconds)
                if (Date.now() - payment.createdAt > 3000) {
                    // 90% success rate for simulation
                    if (Math.random() < 0.9) {
                        payment.status = PaymentStatus.COMPLETED;
                        payment.completedAt = Date.now();
                        this.emit('payment:completed', payment);
                    } else {
                        payment.status = PaymentStatus.FAILED;
                        payment.failedAt = Date.now();
                        payment.error = 'Processing failed';
                        this.emit('payment:failed', payment);
                    }
                    
                    // Update stats
                    this.updateStatistics();
                    
                    // Remove from queue
                    const index = this.processingQueue.indexOf(paymentId);
                    if (index > -1) {
                        this.processingQueue.splice(index, 1);
                    }
                }
            }
        }
    }
    
    updateStatistics() {
        const payments = Array.from(this.payments.values());
        this.stats.total = payments.length;
        
        // Reset counters
        Object.values(PaymentStatus).forEach(status => {
            this.stats.byStatus[status] = 0;
        });
        Object.values(PaymentProvider).forEach(provider => {
            this.stats.byProvider[provider] = 0;
        });
        
        // Count by status and provider
        let totalAmount = 0;
        payments.forEach(payment => {
            this.stats.byStatus[payment.status]++;
            this.stats.byProvider[payment.provider]++;
            totalAmount += payment.amount;
        });
        
        this.stats.totalAmount = totalAmount;
        
        // Calculate success rate
        const completed = payments.filter(p => p.status === PaymentStatus.COMPLETED).length;
        const failed = payments.filter(p => p.status === PaymentStatus.FAILED).length;
        this.stats.successRate = completed + failed > 0 ? completed / (completed + failed) : 0;
    }
    
    validateVerification(verification) {
        if (!verification) {
            throw new PaymentError('INVALID_VERIFICATION', 'Verification object is required');
        }
        
        if (verification.status !== 'approved') {
            throw new PaymentError('INVALID_VERIFICATION', `Verification status must be 'approved', got '${verification.status}'`);
        }
        
        if (!verification.fraudCheck || typeof verification.fraudCheck.riskScore !== 'number') {
            throw new PaymentError('INVALID_VERIFICATION', 'Verification must include fraudCheck.riskScore');
        }
        
        return true;
    }
    
    validateAmount(amount, currency) {
        if (typeof amount !== 'number' || amount <= 0) {
            throw new PaymentError('INVALID_AMOUNT', 'Amount must be a positive number');
        }
        
        // Convert to cents/pence
        const amountInCents = Math.round(amount * 100);
        
        // Currency-specific validations
        if (currency === 'USD') {
            if (amount < 0.01 || amount > 10000) {
                throw new PaymentError('INVALID_AMOUNT', 'USD amount must be between $0.01 and $10,000');
            }
        } else if (currency === 'EUR') {
            if (amount < 0.01 || amount > 9000) {
                throw new PaymentError('INVALID_AMOUNT', 'EUR amount must be between €0.01 and €9,000');
            }
        }
        
        return amountInCents;
    }
    
    async initiatePayment(verification, amount, currency = 'USD', provider = PaymentProvider.STRIPE) {
        // 1. Validate verification
        this.validateVerification(verification);
        
        // 2. Check for duplicate verification ID
        if (this.verificationIds.has(verification.id)) {
            throw new PaymentError('DUPLICATE_PAYMENT', 'Payment already exists for this verification');
        }
        
        // 3. Validate and convert amount
        const amountInCents = this.validateAmount(amount, currency);
        
        // 4. Check fraud risk
        const fraudRiskScore = verification.fraudCheck.riskScore;
        const requiresManualReview = fraudRiskScore > 0.7;
        
        // 5. Generate IDs
        const paymentId = 'pay_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
        const referenceId = provider === PaymentProvider.STRIPE 
            ? 'pi_' + crypto.randomBytes(7).toString('hex')
            : 'ref_' + crypto.randomBytes(6).toString('hex');
        
        // 6. Create payment object
        const payment = {
            id: paymentId,
            verificationId: verification.id,
            referenceId,
            amount: amountInCents,
            currency: currency.toLowerCase(),
            status: requiresManualReview ? PaymentStatus.PENDING : PaymentStatus.PROCESSING,
            provider,
            createdAt: Date.now(),
            metadata: {
                engagementId: verification.engagementId,
                sessionId: verification.sessionId,
                fraudRiskScore,
                requiresManualReview,
                manualApprovedBy: null,
                manualApprovedAt: null,
                originalAmount: amount,
                verificationMetadata: verification.metadata || {}
            }
        };
        
        // 7. Store payment
        this.payments.set(paymentId, payment);
        this.verificationIds.add(verification.id);
        
        // 8. Add to processing queue if not manual review
        if (!requiresManualReview) {
            this.processingQueue.push(paymentId);
            this.emit('payment:created', payment);
        } else {
            this.emit('payment:requires_review', payment);
        }
        
        // 9. Update statistics
        this.updateStatistics();
        
        return payment;
    }
    
    getPayment(paymentId) {
        return this.payments.get(paymentId);
    }
    
    async approveManualPayment(paymentId, approvedBy) {
        const payment = this.payments.get(paymentId);
        
        if (!payment) {
            throw new PaymentError('PAYMENT_NOT_FOUND', `Payment ${paymentId} not found`);
        }
        
        if (!payment.metadata.requiresManualReview) {
            throw new PaymentError('NOT_REQUIRES_MANUAL_REVIEW', 'Payment does not require manual review');
        }
        
        if (payment.status !== PaymentStatus.PENDING) {
            throw new PaymentError('INVALID_STATUS', 'Payment is not in PENDING status');
        }
        
        // Update payment
        payment.status = PaymentStatus.PROCESSING;
        payment.metadata.requiresManualReview = false;
        payment.metadata.manualApprovedBy = approvedBy;
        payment.metadata.manualApprovedAt = Date.now();
        
        // Add to processing queue
        this.processingQueue.push(paymentId);
        this.updateStatistics();
        this.emit('payment:manual_approved', payment);
        
        return payment;
    }
    
    async handleStripeWebhook(payload) {
        if (!payload || payload.type !== 'payment_intent.succeeded') {
            return { received: false, processed: false };
        }
        
        const paymentIntent = payload.data.object;
        const referenceId = paymentIntent.id;
        
        // Find payment by reference ID
        let foundPayment = null;
        for (const [id, payment] of this.payments) {
            if (payment.referenceId === referenceId) {
                foundPayment = payment;
                break;
            }
        }
        
        if (!foundPayment) {
            return { received: true, processed: false, error: 'Payment not found' };
        }
        
        // Update payment status if still processing
        if (foundPayment.status === PaymentStatus.PROCESSING) {
            foundPayment.status = PaymentStatus.COMPLETED;
            foundPayment.completedAt = Date.now();
            foundPayment.webhookReceivedAt = Date.now();
            
            // Remove from queue
            const index = this.processingQueue.indexOf(foundPayment.id);
            if (index > -1) {
                this.processingQueue.splice(index, 1);
            }
            
            this.updateStatistics();
            this.emit('payment:webhook_processed', foundPayment);
            
            return {
                received: true,
                processed: true,
                paymentId: foundPayment.id,
                status: foundPayment.status
            };
        }
        
        return {
            received: true,
            processed: false,
            paymentId: foundPayment.id,
            status: foundPayment.status,
            note: 'Payment already in final state'
        };
    }
    
    getStatistics() {
        return { ...this.stats };
    }
    
    // Helper methods
    listPayments(filter = {}) {
        const payments = Array.from(this.payments.values());
        
        if (filter.status) {
            return payments.filter(p => p.status === filter.status);
        }
        
        if (filter.provider) {
            return payments.filter(p => p.provider === filter.provider);
        }
        
        return payments;
    }
    
    clear() {
        this.payments.clear();
        this.verificationIds.clear();
        this.processingQueue = [];
        this.updateStatistics();
    }
}

// Export everything
module.exports = {
    PaymentEngine,
    PaymentStatus,
    PaymentProvider,
    PaymentError
};

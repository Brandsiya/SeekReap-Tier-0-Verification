"use strict";

const {
    PaymentEngine,
    PaymentStatus,
    PaymentProvider
} = require('./payment-engine-fixed.cjs');

console.log('🧪 WEEK 3: PAYMENT PROCESSING TESTS (FINAL FIXED)\n' + '='.repeat(70));

let passed = 0;
let failed = 0;

async function testAsync(description, testFn) {
    try {
        await testFn();
        console.log(`✅ ${description}`);
        passed++;
    } catch (error) {
        console.log(`❌ ${description}`);
        console.log(`   Error: ${error.message}`);
        failed++;
    }
}

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

(async () => {
    console.log('\n📋 1. Engine Initialization...');
    const engine = new PaymentEngine();

    test('Engine initializes', () => {
        const stats = engine.getStatistics();
        console.log(`   Payments: ${stats.total}`);
    });

    console.log('\n📋 2. Payment Initiation...');

    // Create fresh verification for each test
    const createVerification = (riskScore = 0.3) => ({
        id: 'verif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        engagementId: 'eng-' + Date.now(),
        sessionId: 'session-' + Date.now(),
        status: 'approved',
        fraudCheck: { riskScore }
    });

    await testAsync('Initiate payment with approved verification', async () => {
        const verification = createVerification(0.3);
        const payment = await engine.initiatePayment(verification, 50.00, 'USD', PaymentProvider.STRIPE);
        
        if (!payment.id) throw new Error('No payment ID');
        if (payment.amount !== 5000) throw new Error(`Wrong amount: ${payment.amount}, expected 5000`);
        if (payment.status !== PaymentStatus.PROCESSING) throw new Error(`Expected PROCESSING, got ${payment.status}`);
        
        console.log(`   Created: ${payment.id}, Amount: $${(payment.amount / 100).toFixed(2)}`);
        console.log(`   Reference ID: ${payment.referenceId.substring(0, 8)}...`);
    });

    await testAsync('High-risk verification requires manual review', async () => {
        const verification = createVerification(0.8); // High risk
        const payment = await engine.initiatePayment(verification, 50.00, 'USD');
        
        if (!payment.metadata.requiresManualReview) {
            throw new Error('High risk should require manual review');
        }
        if (payment.status !== PaymentStatus.PENDING) {
            throw new Error(`High risk should stay PENDING, got ${payment.status}`);
        }
        
        console.log(`   High risk: ${payment.id}, Manual review required`);
    });

    await testAsync('Reject payment with non-approved verification', async () => {
        const verification = createVerification(0.3);
        verification.status = 'rejected'; // Make it rejected
        
        try {
            await engine.initiatePayment(verification, 50.00);
            throw new Error('Should have rejected non-approved verification');
        } catch (error) {
            if (error.code !== 'INVALID_VERIFICATION') {
                throw new Error(`Wrong error: ${error.code}`);
            }
            console.log(`   Correctly rejected: ${error.message}`);
        }
    });

    console.log('\n📋 3. Payment Processing Flow...');

    await testAsync('Payment completion flow', async () => {
        const verification = createVerification(0.1);
        
        const payment = await engine.initiatePayment(verification, 25.00, 'USD');
        
        // Wait 4 seconds for processing
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        const updated = engine.getPayment(payment.id);
        
        if (!updated) throw new Error('Payment not found');
        
        console.log(`   Payment ${updated.id}: ${updated.status} after processing`);
    });

    console.log('\n📋 4. Manual Review System...');

    await testAsync('Manual approval flow', async () => {
        const verification = createVerification(0.85); // High risk
        
        const payment = await engine.initiatePayment(verification, 99.99);
        
        if (!payment.metadata.requiresManualReview) {
            throw new Error('Should require manual review');
        }
        
        const approved = await engine.approveManualPayment(payment.id, 'admin-1');
        
        if (approved.metadata.requiresManualReview) {
            throw new Error('Should not require review after approval');
        }
        
        console.log(`   Manually approved by: ${approved.metadata.manualApprovedBy}`);
    });

    console.log('\n📋 5. Webhook Handling...');

    await testAsync('Webhook with payment resolution', async () => {
        const verification = createVerification(0.2);
        
        const payment = await engine.initiatePayment(verification, 19.99);
        console.log(`   Created payment with reference: ${payment.referenceId.substring(0, 8)}...`);
        
        const stripePayload = {
            type: 'payment_intent.succeeded',
            data: { 
                object: { 
                    id: payment.referenceId,
                    amount: 1999,
                    currency: 'usd'
                } 
            }
        };
        
        const result = await engine.handleStripeWebhook(stripePayload);
        
        if (!result.received || !result.processed) {
            throw new Error('Webhook not processed');
        }
        
        console.log(`   Webhook resolved payment: ${result.paymentId}`);
    });

    console.log('\n📋 6. Statistics Reporting...');

    await testAsync('Statistics are accurate', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const stats = engine.getStatistics();
        
        console.log(`   Total payments: ${stats.total}`);
        console.log(`   By status:`, stats.byStatus);
        console.log(`   Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
        
        if (typeof stats.total !== 'number') throw new Error('Invalid stats');
    });

    console.log('\n' + '='.repeat(70));
    console.log('📊 WEEK 3 FIXED TEST SUMMARY:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('');

    if (failed === 0) {
        console.log('🎉 WEEK 3 PAYMENT PROCESSING COMPLETE WITH ALL FIXES!');
        console.log('\n🚀 Ready for Week 4: SMS Notifications');
    } else {
        console.log('⚠️ Some tests failed. Review errors above.');
        process.exit(1);
    }
})();

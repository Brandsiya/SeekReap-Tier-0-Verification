"use strict";

const { PaymentEngine } = require('./payment-engine-fixed.cjs');

async function testCompletionFlow() {
    console.log("Testing payment completion flow...");
    
    const engine = new PaymentEngine();
    
    const verification = { 
        id: 'verif-complete-test-' + Date.now(),
        engagementId: 'eng-test',
        sessionId: 'session-test',
        status: 'approved',
        fraudCheck: { riskScore: 0.1 }
    };
    
    const payment = await engine.initiatePayment(verification, 25.00, 'USD');
    console.log(`Created payment: ${payment.id}, status: ${payment.status}`);
    
    // Wait longer (4 seconds instead of 2)
    console.log("Waiting for processing...");
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const updated = engine.getPayment(payment.id);
    console.log(`Payment after wait: ${updated.id}, status: ${updated.status}`);
    
    if (updated.status === 'completed') {
        console.log("✅ Payment completed successfully!");
    } else {
        console.log(`❌ Payment still ${updated.status} after 4 seconds`);
        console.log("Stats:", engine.getStatistics().byStatus);
    }
}

testCompletionFlow();

"use strict";

const { PaymentEngine, PaymentStatus } = require('./payment-engine-fixed.cjs');

async function debugPaymentProcessing() {
    console.log("🔍 DEBUG: Payment Processing Test");
    console.log("=".repeat(50));
    
    const engine = new PaymentEngine();
    
    // Listen to events
    engine.on('payment:created', (payment) => {
        console.log(`📅 ${new Date().toISOString()} - Payment created: ${payment.id}, status: ${payment.status}`);
    });
    
    engine.on('payment:completed', (payment) => {
        console.log(`✅ ${new Date().toISOString()} - Payment completed: ${payment.id}`);
    });
    
    const verification = {
        id: 'debug-verif-' + Date.now(),
        engagementId: 'debug-eng',
        sessionId: 'debug-session',
        status: 'approved',
        fraudCheck: { riskScore: 0.1 }
    };
    
    console.log("Creating payment...");
    const payment = await engine.initiatePayment(verification, 25.00, 'USD');
    
    console.log(`Payment created: ${payment.id}`);
    console.log(`Initial status: ${payment.status}`);
    console.log(`Created at: ${new Date(payment.createdAt).toISOString()}`);
    console.log(`Current time: ${new Date().toISOString()}`);
    console.log(`Processing queue length: ${engine.processingQueue.length}`);
    
    // Check status every second
    for (let i = 1; i <= 6; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const updated = engine.getPayment(payment.id);
        console.log(`After ${i}s: status = ${updated.status}`);
        
        // Check if in processing queue
        console.log(`  In queue: ${engine.processingQueue.includes(payment.id) ? 'Yes' : 'No'}`);
        console.log(`  Time since creation: ${Date.now() - payment.createdAt}ms`);
    }
    
    console.log("\nFinal stats:");
    console.log(engine.getStatistics().byStatus);
    
    const finalPayment = engine.getPayment(payment.id);
    if (finalPayment.status === 'completed') {
        console.log("\n🎉 SUCCESS: Payment completed!");
    } else {
        console.log(`\n⚠️ Payment still ${finalPayment.status}`);
        console.log("Checking processing interval...");
    }
}

debugPaymentProcessing().catch(console.error);

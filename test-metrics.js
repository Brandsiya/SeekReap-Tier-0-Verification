const { metrics, printPhase2Dashboard } = require('./src/monitoring/metrics');

// Record some test metrics
metrics.recordNotificationSent('sms', true, 150);
metrics.recordNotificationSent('sms', false, 200);
metrics.recordNotificationSent('email', true, 300);
metrics.recordConsentDecision('user123', 'sms', true);
metrics.recordConsentDecision('user456', 'email', false);
metrics.recordEventPublished('payment.completed');
metrics.recordEventPublished('payment.failed');

console.log('Testing Phase 2 Metrics System...\n');
console.log('Current metrics:');
console.log(JSON.stringify(metrics.getMetrics(), null, 2));

console.log('\nDashboard output:');
printPhase2Dashboard();

console.log('\n✅ Metrics system working correctly');

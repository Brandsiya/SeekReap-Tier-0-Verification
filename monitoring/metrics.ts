/**
 * Phase 2 Production Metrics Baseline
 * Simple counters for initial observability
 */

export class Phase2Metrics {
  private static instance: Phase2Metrics;
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  
  static getInstance(): Phase2Metrics {
    if (!Phase2Metrics.instance) {
      Phase2Metrics.instance = new Phase2Metrics();
    }
    return Phase2Metrics.instance;
  }
  
  increment(metric: string, value: number = 1): void {
    const current = this.counters.get(metric) || 0;
    this.counters.set(metric, current + value);
  }
  
  observe(metric: string, value: number): void {
    if (!this.histograms.has(metric)) {
      this.histograms.set(metric, []);
    }
    const values = this.histograms.get(metric)!;
    values.push(value);
    
    // Keep only last 1000 samples
    if (values.length > 1000) {
      values.shift();
    }
  }
  
  recordNotificationSent(channel: 'sms' | 'email', success: boolean, durationMs?: number): void {
    const base = `notifications.${channel}`;
    this.increment(`${base}.total`);
    this.increment(`${base}.${success ? 'success' : 'failure'}`);
    
    if (durationMs !== undefined) {
      this.observe(`${base}.duration_ms`, durationMs);
    }
  }
  
  recordEventPublished(event: string): void {
    this.increment(`events.published.${event}`);
  }
  
  recordEventSubscribed(event: string): void {
    this.increment(`events.subscribed.${event}`);
  }
  
  recordConsentDecision(userId: string, channel: 'sms' | 'email', granted: boolean): void {
    this.increment(`consent.decisions.total`);
    this.increment(`consent.${channel}.${granted ? 'granted' : 'denied'}`);
  }
  
  recordPaymentVerification(outcome: 'approved' | 'rejected' | 'error', durationMs?: number): void {
    this.increment(`payments.verification.${outcome}`);
    if (durationMs !== undefined) {
      this.observe(`payments.verification.duration_ms`, durationMs);
    }
  }
  
  getMetrics(): Record<string, any> {
    const result: Record<string, any> = {
      counters: Object.fromEntries(this.counters.entries()),
      histograms: {} as Record<string, any>
    };
    
    for (const [metric, values] of this.histograms.entries()) {
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        
        result.histograms[metric] = {
          count: values.length,
          avg: Number(avg.toFixed(2)),
          min: Number(min.toFixed(2)),
          max: Number(max.toFixed(2)),
          p95: this.calculatePercentile(values, 95)
        };
      }
    }
    
    return result;
  }
  
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return Number((sorted[Math.max(0, index)] || 0).toFixed(2));
  }
  
  reset(): void {
    this.counters.clear();
    this.histograms.clear();
  }
}

export const metrics = Phase2Metrics.getInstance();

export function printPhase2Dashboard(): void {
  const m = metrics.getMetrics();
  const { counters } = m;
  
  console.log('\n=== PHASE 2 PRODUCTION DASHBOARD ===');
  console.log(`Generated: ${new Date().toISOString()}`);
  console.log('-------------------------------------');
  
  const smsTotal = counters['notifications.sms.total'] || 0;
  const smsSuccess = counters['notifications.sms.success'] || 0;
  const emailTotal = counters['notifications.email.total'] || 0;
  const emailSuccess = counters['notifications.email.success'] || 0;
  
  console.log('\n📊 NOTIFICATIONS:');
  console.log(`  SMS:  ${smsSuccess}/${smsTotal} (${smsTotal ? ((smsSuccess/smsTotal)*100).toFixed(1) : '0'}%)`);
  console.log(`  Email: ${emailSuccess}/${emailTotal} (${emailTotal ? ((emailSuccess/emailTotal)*100).toFixed(1) : '0'}%)`);
  
  console.log('\n📊 EVENT BUS:');
  const eventKeys = Object.keys(counters).filter(k => k.startsWith('events.published.'));
  eventKeys.forEach(key => {
    const event = key.replace('events.published.', '');
    console.log(`  ${event}: ${counters[key]}`);
  });
  
  console.log('\n📊 CONSENT DECISIONS:');
  const consentTotal = counters['consent.decisions.total'] || 0;
  const smsGranted = counters['consent.sms.granted'] || 0;
  const emailGranted = counters['consent.email.granted'] || 0;
  console.log(`  Total Decisions: ${consentTotal}`);
  console.log(`  SMS Consent Rate: ${consentTotal ? ((smsGranted/consentTotal)*100).toFixed(1) : '0'}%`);
  console.log(`  Email Consent Rate: ${consentTotal ? ((emailGranted/consentTotal)*100).toFixed(1) : '0'}%`);
  
  if (m.histograms && Object.keys(m.histograms).length > 0) {
    console.log('\n📊 LATENCY (p95 ms):');
    Object.entries(m.histograms).forEach(([metric, stats]: [string, any]) => {
      console.log(`  ${metric}: ${stats.p95}ms`);
    });
  }
  
  console.log('\n=== END DASHBOARD ===\n');
}

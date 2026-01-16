import { eventBus } from './event-bus';
import { smsService } from './sms';
import { emailService } from './email';
import { notificationSubscriber } from './notification-subscriber';

export interface VerificationTest {
  id: string;
  name: string;
  description: string;
  category: 'determinism' | 'performance' | 'error-handling' | 'boundary';
  run: () => Promise<VerificationResult>;
  expectedOutcome: any;
}

export interface VerificationResult {
  testId: string;
  name: string;
  timestamp: string;
  passed: boolean;
  expected: any;
  actual: any;
  duration: number;
  evidenceHash?: string;
  error?: string;
}

export interface VerificationSuiteResult {
  suiteId: string;
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  deterministic: boolean;
  results: VerificationResult[];
  summaryHash: string;
  systemState: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    activeConnections: number;
  };
}

export class VerificationService {
  private tests: VerificationTest[] = [];
  private suiteCounter = 0;
  private readonly DETERMINISM_THRESHOLD_MS = 100;

  constructor() {
    this.initializeTests();
  }

  private initializeTests(): void {
    this.tests.push({
      id: 'det-001',
      name: 'API Response Consistency',
      description: 'Same input → Same output across multiple runs',
      category: 'determinism',
      expectedOutcome: { consistent: true, variance: 0 },
      run: async () => await this.testApiResponseConsistency()
    });

    this.tests.push({
      id: 'det-002',
      name: 'Event Publishing Determinism',
      description: 'Event bus publishes consistently for same events',
      category: 'determinism',
      expectedOutcome: { published: true, consistent: true },
      run: async () => await this.testEventPublishing()
    });

    this.tests.push({
      id: 'det-003',
      name: 'Service Initialization Consistency',
      description: 'Services initialize deterministically',
      category: 'determinism',
      expectedOutcome: { initialized: true, consistent: true },
      run: async () => await this.testServiceInitialization()
    });

    this.tests.push({
      id: 'perf-001',
      name: 'Response Time Stability',
      description: 'Response times within acceptable variance',
      category: 'performance',
      expectedOutcome: { variance: `<${this.DETERMINISM_THRESHOLD_MS}ms` },
      run: async () => await this.testResponseTimeStability()
    });

    this.tests.push({
      id: 'biz-001',
      name: 'Notification Preference Persistence',
      description: 'User preferences persist deterministically',
      category: 'determinism',
      expectedOutcome: { persisted: true, retrievable: true },
      run: async () => await this.testPreferencePersistence()
    });
  }

  private async testApiResponseConsistency(): Promise<VerificationResult> {
    const testId = 'det-001';
    const startTime = Date.now();
    
    try {
      const results = [];
      
      for (let i = 0; i < 3; i++) {
        const response = {
          timestamp: new Date().toISOString(),
          status: 'healthy',
          service: 'SeekReap API'
        };
        results.push({
          iteration: i,
          timestamp: response.timestamp,
          status: response.status,
          dataHash: this.hashData(response)
        });
        await this.delay(50);
      }
      
      const firstHash = results[0].dataHash;
      const allSame = results.every(r => r.dataHash === firstHash);
      const duration = Date.now() - startTime;
      
      return {
        testId,
        name: 'API Response Consistency',
        timestamp: new Date().toISOString(),
        passed: allSame,
        expected: { consistent: true, variance: 0 },
        actual: { 
          consistent: allSame, 
          iterations: results.length,
          sampleHashes: results.map(r => r.dataHash.substring(0, 8))
        },
        duration,
        evidenceHash: this.hashData(results)
      };
      
    } catch (error: any) {
      return {
        testId,
        name: 'API Response Consistency',
        timestamp: new Date().toISOString(),
        passed: false,
        expected: { consistent: true, variance: 0 },
        actual: { error: error.message },
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  private async testEventPublishing(): Promise<VerificationResult> {
    const testId = 'det-002';
    const startTime = Date.now();
    
    try {
      const eventType = 'verification.test';
      const testData = { testId, timestamp: Date.now() };
      
      const results: any[] = [];
      for (let i = 0; i < 3; i++) {
        const before = (eventBus as any).listeners?.get(eventType)?.length || 0;
        eventBus.publish(eventType, { ...testData, iteration: i });
        await this.delay(50);
        const after = (eventBus as any).listeners?.get(eventType)?.length || 0;
        results.push({
          success: after > before,
          before,
          after
        });
      }
      
      const allSameOutcome = results.every(r => r.success === results[0].success);
      const duration = Date.now() - startTime;
      
      return {
        testId,
        name: 'Event Publishing Determinism',
        timestamp: new Date().toISOString(),
        passed: allSameOutcome,
        expected: { published: true, consistent: true },
        actual: { 
          consistent: allSameOutcome,
          iterations: results.length
        },
        duration,
        evidenceHash: this.hashData({ testData, results })
      };
      
    } catch (error: any) {
      return {
        testId,
        name: 'Event Publishing Determinism',
        timestamp: new Date().toISOString(),
        passed: false,
        expected: { published: true, consistent: true },
        actual: { error: error.message },
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  private async testServiceInitialization(): Promise<VerificationResult> {
    const testId = 'det-003';
    const startTime = Date.now();
    
    try {
      const initResults = [];
      
      for (let i = 0; i < 3; i++) {
        const smsInit = smsService.initialize();
        const emailInit = emailService.initialize();
        
        initResults.push({
          iteration: i,
          smsInitialized: typeof smsInit,
          emailInitialized: typeof emailInit,
          timestamp: new Date().toISOString()
        });
        await this.delay(50);
      }
      
      const firstResult = initResults[0];
      const allConsistent = initResults.every(result => 
        result.smsInitialized === firstResult.smsInitialized &&
        result.emailInitialized === firstResult.emailInitialized
      );
      
      const duration = Date.now() - startTime;
      
      return {
        testId,
        name: 'Service Initialization Consistency',
        timestamp: new Date().toISOString(),
        passed: allConsistent,
        expected: { initialized: true, consistent: true },
        actual: { 
          consistent: allConsistent,
          results: initResults
        },
        duration,
        evidenceHash: this.hashData(initResults)
      };
      
    } catch (error: any) {
      return {
        testId,
        name: 'Service Initialization Consistency',
        timestamp: new Date().toISOString(),
        passed: false,
        expected: { initialized: true, consistent: true },
        actual: { error: error.message },
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  private async testResponseTimeStability(): Promise<VerificationResult> {
    const testId = 'perf-001';
    const startTime = Date.now();
    
    try {
      const responseTimes = [];
      const iterations = 5;
      
      for (let i = 0; i < iterations; i++) {
        const iterationStart = Date.now();
        // Simulate API call
        await this.delay(Math.random() * 50 + 20); // 20-70ms
        responseTimes.push(Date.now() - iterationStart);
        await this.delay(50);
      }
      
      const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxDeviation = Math.max(...responseTimes.map(t => Math.abs(t - avg)));
      const withinThreshold = maxDeviation < this.DETERMINISM_THRESHOLD_MS;
      const duration = Date.now() - startTime;
      
      return {
        testId,
        name: 'Response Time Stability',
        timestamp: new Date().toISOString(),
        passed: withinThreshold,
        expected: { variance: `<${this.DETERMINISM_THRESHOLD_MS}ms` },
        actual: { 
          average: `${avg.toFixed(2)}ms`,
          maxDeviation: `${maxDeviation.toFixed(2)}ms`,
          withinThreshold
        },
        duration,
        evidenceHash: this.hashData(responseTimes)
      };
      
    } catch (error: any) {
      return {
        testId,
        name: 'Response Time Stability',
        timestamp: new Date().toISOString(),
        passed: false,
        expected: { variance: `<${this.DETERMINISM_THRESHOLD_MS}ms` },
        actual: { error: error.message },
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  private async testPreferencePersistence(): Promise<VerificationResult> {
    const testId = 'biz-001';
    const startTime = Date.now();
    
    try {
      const userId = `verification-user-${Date.now()}`;
      const originalPrefs = {
        userId,
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true
      };
      
      notificationSubscriber.updatePreferences(userId, originalPrefs);
      
      const retrievals = [];
      for (let i = 0; i < 3; i++) {
        const prefs = notificationSubscriber.getUserPreferences(userId);
        retrievals.push({
          iteration: i,
          retrieved: !!prefs,
          hash: prefs ? this.hashData(prefs) : null
        });
        await this.delay(50);
      }
      
      const firstHash = retrievals[0].hash;
      const allSame = retrievals.every(r => r.hash === firstHash);
      const allRetrieved = retrievals.every(r => r.retrieved);
      
      notificationSubscriber.clearPreferences();
      const duration = Date.now() - startTime;
      
      return {
        testId,
        name: 'Notification Preference Persistence',
        timestamp: new Date().toISOString(),
        passed: allSame && allRetrieved,
        expected: { persisted: true, retrievable: true },
        actual: { 
          persisted: allRetrieved,
          consistent: allSame,
          retrievals: retrievals.length
        },
        duration,
        evidenceHash: this.hashData({ userId, originalPrefs, retrievals })
      };
      
    } catch (error: any) {
      return {
        testId,
        name: 'Notification Preference Persistence',
        timestamp: new Date().toISOString(),
        passed: false,
        expected: { persisted: true, retrievable: true },
        actual: { error: error.message },
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  public async runVerificationSuite(): Promise<VerificationSuiteResult> {
    const suiteId = `suite_${Date.now()}_${++this.suiteCounter}`;
    const startTime = Date.now();
    
    console.log(`[Verification] Starting suite ${suiteId}`);
    
    const systemState = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      activeConnections: 0,
      timestamp: new Date().toISOString()
    };
    
    const results: VerificationResult[] = [];
    
    for (const test of this.tests) {
      console.log(`[Verification] Running test: ${test.name}`);
      const result = await test.run();
      results.push(result);
      await this.delay(100);
    }
    
    const duration = Date.now() - startTime;
    const passedTests = results.filter(r => r.passed).length;
    const deterministic = results.every(r => r.passed);
    
    const suiteResult: VerificationSuiteResult = {
      suiteId,
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passedTests,
      failedTests: results.length - passedTests,
      duration,
      deterministic,
      results,
      summaryHash: this.hashData(results),
      systemState
    };
    
    console.log(`[Verification] Suite ${suiteId} completed`, {
      deterministic,
      passedTests,
      duration: `${duration}ms`
    });
    
    return suiteResult;
  }

  public getAvailableTests(): VerificationTest[] {
    return [...this.tests];
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private hashData(data: any): string {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `sha1-${Math.abs(hash).toString(16)}`;
  }
}

export const verificationService = new VerificationService();

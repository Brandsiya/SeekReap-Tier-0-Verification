import { smsService } from './sms';
import { emailService } from './email';
import { eventBus } from './event-bus';


interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
}

class NotificationSubscriber {
  private preferences = new Map<string, NotificationPreferences>();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Initialize individual services
    smsService.initialize();
    emailService.initialize();

    // Load user preferences (simulated)
    this.loadUserPreferences();

    console.log('[Notification Subscriber] All services initialized successfully');
  }

  private loadUserPreferences(): void {
    // In a real app, this would load from a database
    console.log('[Notification Subscriber] Loading user preferences');
    
    // Simulate some user preferences
    this.preferences.set('user123', {
      userId: 'user123',
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: false
    });
    
    this.preferences.set('user456', {
      userId: 'user456',
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true
    });
    
    this.preferences.set('user789', {
      userId: 'user789',
      emailEnabled: false,
      smsEnabled: true,
      pushEnabled: false
    });
    
    console.log(`[Notification Subscriber] Loaded ${this.preferences.size} user preferences`);
  }

  getUserPreferences(userId: string): NotificationPreferences | null {
    return this.preferences.get(userId) || null;
  }

  updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
    const existing = this.getUserPreferences(userId) || {
      userId,
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true
    };
    
    this.preferences.set(userId, {
      ...existing,
      ...preferences
    });
    
    console.log(`[Notification Subscriber] Updated preferences for user ${userId}`);
  }

  triggerTestEvent(eventType: string, data: any): void {
    console.log(`[Notification Subscriber] Triggering test event: ${eventType}`);
    eventBus.publish(eventType, data);
  }

  getEventStats(): Record<string, number> {
    const events = ['payment.completed', 'payment.failed', 'payment.refunded'];
    const stats: Record<string, number> = {};
    
    events.forEach(event => {
      // Access private property (for debugging only)
      const bus = eventBus as any;
      if (bus.listeners) {
        stats[event] = bus.listeners.get(event)?.length || 0;
      }
    });
    
    return stats;
  }

  clearPreferences(): void {
    this.preferences.clear();
    console.log('[Notification Subscriber] All preferences cleared');
  }
}

// Export a singleton instance
export const notificationSubscriber = new NotificationSubscriber();

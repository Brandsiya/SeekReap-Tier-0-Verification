/**
 * Payment Engine Integration Module
 * Connects PaymentEngine events to the notification system
 * Using CommonJS for compatibility with existing PaymentEngine
 */

// Note: We need to import TypeScript files properly
// First, check if we can require the compiled files, or use dynamic import

async function getEventBus() {
  try {
    // Try to require the TypeScript file (if ts-node is being used)
    return require('../services/event-bus').eventBus;
  } catch (error) {
    console.warn('Could not require TypeScript module directly:', error.message);
    
    // For testing without compilation, we'll create a simple mock
    console.log('Creating simple event bus for testing...');
    const listeners = new Map();
    
    return {
      publish: (event, data) => {
        console.log(`[Mock EventBus] Publishing: ${event}`, data);
        const eventListeners = listeners.get(event);
        if (eventListeners) {
          eventListeners.forEach(callback => callback(data));
        }
      },
      subscribe: (event, callback) => {
        if (!listeners.has(event)) {
          listeners.set(event, []);
        }
        listeners.get(event).push(callback);
        console.log(`[Mock EventBus] New subscriber for: ${event}`);
        return () => {
          const arr = listeners.get(event);
          const index = arr.indexOf(callback);
          if (index > -1) arr.splice(index, 1);
        };
      }
    };
  }
}

const eventBusPromise = getEventBus();

/**
 * Integrate with PaymentEngine
 */
async function integrateWithPaymentEngine(PaymentEngine) {
  console.log('[Payment Events] Integrating with PaymentEngine...');
  const eventBus = await eventBusPromise;
  
  if (PaymentEngine && PaymentEngine.on) {
    // Payment Completed
    PaymentEngine.on('payment:completed', (data) => {
      console.log('[Payment Events] Payment completed:', data);
      eventBus.publish('payment.completed', {
        userId: data.userId || data.customerId,
        amount: data.amount,
        currency: data.currency || 'USD',
        transactionId: data.transactionId || data.id,
        timestamp: new Date().toISOString()
      });
    });
    
    // Payment Failed
    PaymentEngine.on('payment:failed', (data) => {
      console.log('[Payment Events] Payment failed:', data);
      eventBus.publish('payment.failed', {
        userId: data.userId || data.customerId,
        amount: data.amount,
        currency: data.currency || 'USD',
        transactionId: data.transactionId || data.id,
        reason: data.reason || 'Unknown error',
        timestamp: new Date().toISOString()
      });
    });
    
    // Payment Refunded
    PaymentEngine.on('payment:refunded', (data) => {
      console.log('[Payment Events] Payment refunded:', data);
      eventBus.publish('payment.refunded', {
        userId: data.userId || data.customerId,
        amount: data.amount,
        currency: data.currency || 'USD',
        transactionId: data.originalTransactionId || data.id,
        refundId: data.refundId,
        timestamp: new Date().toISOString()
      });
    });
    
    console.log('[Payment Events] Successfully integrated with PaymentEngine');
    return true;
  } else {
    console.warn('[Payment Events] PaymentEngine does not have event emitter interface');
    return false;
  }
}

/**
 * Manually trigger payment events for testing
 */
async function triggerTestEvent(eventType, data) {
  const eventBus = await eventBusPromise;
  
  const events = {
    'payment.completed': {
      userId: 'test_user_' + Date.now(),
      amount: Math.random() * 100,
      currency: 'USD',
      transactionId: 'txn_' + Math.random().toString(36).substr(2, 9)
    },
    'payment.failed': {
      userId: 'test_user_' + Date.now(),
      amount: Math.random() * 100,
      currency: 'USD',
      transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
      reason: 'Insufficient funds'
    },
    'payment.refunded': {
      userId: 'test_user_' + Date.now(),
      amount: Math.random() * 100,
      currency: 'USD',
      transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
      refundId: 'ref_' + Math.random().toString(36).substr(2, 9)
    }
  };
  
  const eventData = data || events[eventType];
  if (eventData) {
    console.log(`[Payment Events] Triggering test event: ${eventType}`, eventData);
    eventBus.publish(eventType, eventData);
  }
}

module.exports = {
  integrateWithPaymentEngine,
  triggerTestEvent
};

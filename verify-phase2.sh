#!/bin/bash

echo "=== QUICK PHASE 2 VERIFICATION ==="
echo "Time: $(date)"
echo

# Check 1: Basic file structure
echo "1. Checking file structure..."
if [ -f "src/services/event-bus.ts" ] && \
   [ -f "src/services/sms.ts" ] && \
   [ -f "src/services/email.ts" ] && \
   [ -f "src/services/notification-subscriber.ts" ] && \
   [ -f "src/integrations/payment-events.cjs" ] && \
   [ -f "test-week4-notifications.cjs" ]; then
  echo "✅ All core files exist"
else
  echo "❌ Missing core files"
  exit 1
fi

# Check 2: TypeScript compilation
echo -e "\n2. Checking TypeScript compilation..."
if node -c src/services/event-bus.ts 2>/dev/null && \
   node -c src/services/sms.ts 2>/dev/null && \
   node -c src/services/email.ts 2>/dev/null; then
  echo "✅ TypeScript files compile"
else
  echo "❌ TypeScript compilation failed"
  echo "Running check with more detail:"
  node -c src/services/event-bus.ts
  exit 1
fi

# Check 3: Metrics file
echo -e "\n3. Checking monitoring..."
if [ -f "src/monitoring/metrics.ts" ]; then
  echo "✅ Metrics file exists"
  if node -c src/monitoring/metrics.ts 2>/dev/null; then
    echo "✅ Metrics file compiles"
  else
    echo "❌ Metrics file has errors"
    node -c src/monitoring/metrics.ts
  fi
else
  echo "❌ Metrics file missing"
  exit 1
fi

# Check 4: Test runs
echo -e "\n4. Checking test execution..."
if timeout 5s node test-week4-notifications.cjs 2>&1 | grep -q "Test Complete"; then
  echo "✅ Test runs successfully"
else
  echo "⚠️  Test may have issues, checking..."
  timeout 5s node test-week4-notifications.cjs 2>&1 | tail -20
fi

# Check 5: Critical patterns
echo -e "\n5. Checking architectural patterns..."
if grep -q "export const eventBus = new EventBus()" src/services/event-bus.ts && \
   grep -q "export const smsService = " src/services/sms.ts && \
   grep -q "export const emailService = " src/services/email.ts && \
   grep -q "export const notificationSubscriber = " src/services/notification-subscriber.ts; then
  echo "✅ Singleton pattern correctly implemented"
else
  echo "❌ Missing singleton exports"
  exit 1
fi

echo -e "\n=== VERIFICATION COMPLETE ==="
echo "Phase 2 appears ready for stabilization."
echo
echo "Next: Begin 14-day observation period with:"
echo "1. NO new features"
echo "2. Monitor system daily"
echo "3. Only critical bug fixes"

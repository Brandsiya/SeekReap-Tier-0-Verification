#!/bin/bash
echo "1. Core test file exists and runs:"
if timeout 15s node test-week4-notifications.cjs 2>&1 | grep -q "Test Complete"; then
    echo "   ✅ test-week4-notifications.cjs - FUNCTIONAL"
else
    echo "   ❌ test-week4-notifications.cjs - BROKEN"
    exit 1
fi

echo ""
echo "2. Daily check script created and executable:"
if [ -x "daily-stabilization-check.sh" ]; then
    echo "   ✅ daily-stabilization-check.sh - READY"
else
    echo "   ❌ daily-stabilization-check.sh - MISSING/BROKEN"
    exit 1
fi

echo ""
echo "3. All required files present:"
REQUIRED_FILES=(
    "src/services/event-bus.ts"
    "src/services/sms.ts"
    "src/services/email.ts"
    "src/services/notification-subscriber.ts"
    "src/integrations/payment-events.cjs"
    "test-week4-notifications.cjs"
)

ALL_GOOD=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - MISSING"
        ALL_GOOD=false
    fi
done

echo ""
if $ALL_GOOD; then
    echo "=== SYSTEM STATUS: READY FOR STABILIZATION ==="
    echo "✅ All components present"
    echo "✅ Core test functional"
    echo "✅ Daily check script ready"
    echo ""
    echo "DAY 1 VALIDATION CAN PROCEED"
else
    echo "=== SYSTEM STATUS: NOT READY ==="
    echo "❌ Missing components detected"
    exit 1
fi

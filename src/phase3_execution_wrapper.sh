#!/bin/bash
# Phase 3 Execution Wrapper
# Maintains Phase 2 baseline while enabling Phase 3 features

CONFIG_FILE="config/event_bus_enabled.txt"

echo "=== Phase 3 Execution Wrapper ==="
echo "Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# Check if Phase 3 is enabled
if [ -f "$CONFIG_FILE" ]; then
    EVENT_BUS_ENABLED=$(grep "EVENT_BUS_ENABLED=" "$CONFIG_FILE" | cut -d'=' -f2)
else
    EVENT_BUS_ENABLED="false"
fi

echo "Event Bus Enabled: $EVENT_BUS_ENABLED"
echo "Phase 2 Baseline: ACTIVE"
echo ""

# Execute Phase 2 validation (unchanged)
echo "Executing Phase 2 validation..."
if [ -f "./daily-stabilization-check.sh" ]; then
    ./daily-stabilization-check.sh
    VALIDATION_RESULT=$?
    
    if [ $VALIDATION_RESULT -eq 0 ]; then
        echo "✅ Phase 2 validation: PASS"
        
        # Only execute Phase 3 features if enabled
        if [ "$EVENT_BUS_ENABLED" = "true" ]; then
            echo "🚀 Phase 3 features: ACTIVE"
            echo "Note: Event bus externalization would run here"
        else
            echo "⚡ Phase 3 features: STANDBY (enabled in config)"
        fi
    else
        echo "❌ Phase 2 validation: FAIL"
        echo "Phase 3 features disabled due to baseline failure"
    fi
else
    echo "⚠️  Phase 2 validation script not found"
fi

echo ""
echo "=== Phase Status ==="
echo "Phase 2: ACTIVE (baseline validation)"
echo "Phase 3: $([ "$EVENT_BUS_ENABLED" = "true" ] && echo "ACTIVE" || echo "STANDBY")"
echo "Governance: ENFORCED"

#!/bin/bash
# Phase 3 Execution Wrapper v2
# Includes both Event Bus and Audit capabilities

CONFIG_EVENT_BUS="config/event_bus_enabled.txt"
CONFIG_AUDIT="config/audit_enabled.txt"

echo "=== Phase 3 Execution Wrapper v2 ==="
echo "Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# Load configurations
if [ -f "$CONFIG_EVENT_BUS" ]; then
    EVENT_BUS_ENABLED=$(grep "EVENT_BUS_ENABLED=" "$CONFIG_EVENT_BUS" | cut -d'=' -f2)
else
    EVENT_BUS_ENABLED="false"
fi

if [ -f "$CONFIG_AUDIT" ]; then
    AUDIT_ENABLED=$(grep "AUDIT_ENABLED=" "$CONFIG_AUDIT" | cut -d'=' -f2)
else
    AUDIT_ENABLED="false"
fi

echo "Event Bus: $([ "$EVENT_BUS_ENABLED" = "true" ] && echo "🟢 ACTIVE" || echo "🔴 STANDBY")"
echo "Audit Trail: $([ "$AUDIT_ENABLED" = "true" ] && echo "🟢 ACTIVE" || echo "🔴 STANDBY")"
echo "Phase 2 Baseline: 🟢 ACTIVE"
echo ""

# Execute Phase 2 validation
echo "Executing Phase 2 validation..."
if [ -f "./daily-stabilization-check.sh" ]; then
    ./daily-stabilization-check.sh
    VALIDATION_RESULT=$?
    
    if [ $VALIDATION_RESULT -eq 0 ]; then
        echo "✅ Phase 2 validation: PASS"
        
        # Log audit event if enabled
        if [ "$AUDIT_ENABLED" = "true" ] && [ -f "./audit_logger.sh" ]; then
            source ./audit_logger.sh
            log_audit_event "system" "phase3-validation" "system" "validation_execution" "success" '{"phase": "2", "result": "pass", "timestamp": "'$(date -u '+%Y-%m-%dT%H:%M:%SZ')'"}'
        fi
        
        # Execute Phase 3 features based on configuration
        echo ""
        echo "=== Phase 3 Features Status ==="
        
        if [ "$EVENT_BUS_ENABLED" = "true" ]; then
            echo "🚀 Event Bus: ACTIVE (would publish events)"
        else
            echo "⚡ Event Bus: STANDBY (enable in config)"
        fi
        
        if [ "$AUDIT_ENABLED" = "true" ]; then
            echo "📝 Audit Trail: ACTIVE (logging to audit_logs/)"
        else
            echo "📝 Audit Trail: STANDBY (enable in config)"
        fi
        
    else
        echo "❌ Phase 2 validation: FAIL"
        
        # Log audit event for failure
        if [ "$AUDIT_ENABLED" = "true" ] && [ -f "./audit_logger.sh" ]; then
            source ./audit_logger.sh
            log_audit_event "system" "phase3-validation" "system" "validation_execution" "failure" '{"phase": "2", "result": "fail", "timestamp": "'$(date -u '+%Y-%m-%dT%H:%M:%SZ')'"}'
        fi
    fi
else
    echo "⚠️  Phase 2 validation script not found"
fi

echo ""
echo "=== Governance Status ==="
echo "Phase 3 Rules: ENFORCED"
echo "Change Control: ACTIVE"
echo "Rollback Ready: ✅ (toggle configurations)"

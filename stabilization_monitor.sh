#!/bin/bash
# Phase 3 Stabilization Monitor
# Lightweight version for browser/replit compatibility

echo "=== Phase 3 Stabilization Monitor ==="
echo "Cycle: Event Bus Externalization"
echo "Start: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "Window: 48 hours"
echo ""

# Check system health
echo "Health Checks:"
echo "1. Phase 2 validation script: $(if [ -f "./daily-stabilization-check.sh" ]; then echo "✅ PRESENT"; else echo "❌ MISSING"; fi)"
echo "2. Phase 3 wrapper: $(if [ -f "./phase3_execution_wrapper.sh" ]; then echo "✅ PRESENT"; else echo "❌ MISSING"; fi)"
echo "3. Configuration: $(if [ -f "config/event_bus_enabled.txt" ]; then echo "✅ PRESENT"; else echo "❌ MISSING"; fi)"
echo "4. Schema definition: $(if [ -f "event_schema_v1.md" ]; then echo "✅ PRESENT"; else echo "❌ MISSING"; fi)"
echo ""

# Current toggle state
if [ -f "config/event_bus_enabled.txt" ]; then
    STATE=$(grep "EVENT_BUS_ENABLED=" config/event_bus_enabled.txt | cut -d'=' -f2)
    echo "Event Bus State: $STATE (false = Phase 2 baseline)"
else
    echo "Event Bus State: NOT CONFIGURED (defaults to Phase 2)"
fi

echo ""
echo "Stabilization Status: ACTIVE"
echo "Next check: 6 hours"
echo ""
echo "To enable Phase 3 features:"
echo "  echo 'EVENT_BUS_ENABLED=true' > config/event_bus_enabled.txt"
echo ""
echo "To rollback (immediate):"
echo "  echo 'EVENT_BUS_ENABLED=false' > config/event_bus_enabled.txt"

#!/bin/bash
# Config Validator - Bash only
ERRORS=()
CONFIGS_CHECKED=0

# Check Phase 2
if [ ! -f "./daily-stabilization-check.sh" ]; then
    ERRORS+=("Missing Phase 2 validation script")
fi
CONFIGS_CHECKED=$((CONFIGS_CHECKED + 1))

# Check Phase 3 configs
CONFIG_FILES=(
    "config/event_bus_enabled.txt"
    "config/audit_config.yaml"
    "config/query_api.txt"
)

for config in "${CONFIG_FILES[@]}"; do
    if [ ! -f "$config" ]; then
        ERRORS+=("Missing config: $config")
    fi
    CONFIGS_CHECKED=$((CONFIGS_CHECKED + 1))
done

# Output result
if [ ${#ERRORS[@]} -eq 0 ]; then
    echo "✅ All $CONFIGS_CHECKED configs valid"
    exit 0
else
    echo "❌ Config errors:"
    for error in "${ERRORS[@]}"; do
        echo "  - $error"
    done
    exit 1
fi

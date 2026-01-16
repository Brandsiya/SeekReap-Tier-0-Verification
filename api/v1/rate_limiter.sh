#!/bin/bash
# Rate Limiter (Token Bucket) - Cycle 3 / Checkpoint 1
# Governance: Read-only to Phase 2, only affects Cycle 3 Query API

# Load scope-based limits
RATE_CONFIG="config/rate_limits.conf"
declare -A BUCKET
declare -A LAST_TS

while read -r line; do
    [[ "$line" =~ ^#.*$ ]] && continue
    SCOPE=$(echo "$line" | cut -d',' -f1)
    LIMIT=$(echo "$line" | cut -d',' -f2)
    BUCKET["$SCOPE"]=$LIMIT
    LAST_TS["$SCOPE"]=$(date +%s)
done < "$RATE_CONFIG"

# Function: Check token availability
check_rate_limit() {
    local scope=$1
    local now=$(date +%s)
    local elapsed=$((now - LAST_TS[$scope]))
    # Refill tokens: 1 per second
    BUCKET[$scope]=$(( BUCKET[$scope] + elapsed ))
    if (( BUCKET[$scope] > $(grep "$scope" "$RATE_CONFIG" | cut -d',' -f2) )); then
        BUCKET[$scope]=$(grep "$scope" "$RATE_CONFIG" | cut -d',' -f2)
    fi
    LAST_TS[$scope]=$now

    if (( BUCKET[$scope] <= 0 )); then
        echo "429 Too Many Requests"
        return 1
    else
        BUCKET[$scope]=$(( BUCKET[$scope] - 1 ))
        return 0
    fi
}

# Main execution
if [ "$1" = "check_rate_limit" ]; then
    check_rate_limit "$2"
fi

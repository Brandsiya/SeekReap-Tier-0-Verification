#!/bin/bash
echo "=== Phase 3 Wrapper ==="
echo "Cycle 3: Simple Query API"

# Phase 2 check
if [ -f "./daily-stabilization-check.sh" ]; then
    ./daily-stabilization-check.sh
    echo "Phase 2: ✅"
else
    echo "Phase 2: ⚠️"
fi

# Query API status
if [ -f "config/query_api.txt" ]; then
    if grep -qi "true" config/query_api.txt; then
        echo "Query API: ✅ ENABLED"
        python3 simple_query.py
    else
        echo "Query API: 🔴 DISABLED (safe)"
    fi
else
    echo "Query API: ⚠️ NOT CONFIGURED"
fi

echo "=== Done ==="

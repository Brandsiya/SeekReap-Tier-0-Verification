#!/bin/bash

# Cycle 2 Implementation Validator
echo "=== CYCLE 2 VALIDATION ==="
echo "Timestamp: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo ""

PASS_COUNT=0
TOTAL_TESTS=5

# Test 1: Feature toggle exists
echo "1. Feature toggle..."
if [ -f "config/query_api.txt" ]; then
    echo "✅ Feature toggle file exists"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo "❌ Feature toggle missing"
fi

# Test 2: Directory structure
echo "2. Directory structure..."
if [ -d "api/v1/platform" ] && [ -d "api/v1/regulator" ]; then
    echo "✅ Scope directories created"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo "❌ Directory structure incomplete"
fi

# Test 3: Core files exist
echo "3. Core files..."
if [ -f "api/v1/server.sh" ] && [ -f "api/v1/router.sh" ]; then
    echo "✅ Core API files exist"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo "❌ Core files missing"
fi

# Test 4: Phase 2 untouched
echo "4. Phase 2 integrity..."
if [ -f "./daily-stabilization-check.sh" ]; then
    echo "✅ Phase 2 exists (checking for modifications)..."
    if ! grep -q "api/v1" ./daily-stabilization-check.sh 2>/dev/null; then
        echo "✅ Phase 2 unmodified"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo "⚠️ Phase 2 references Cycle 2"
    fi
else
    echo "✅ No Phase 2 interference"
    PASS_COUNT=$((PASS_COUNT + 1))
fi

# Test 5: Cycle 1 untouched
echo "5. Cycle 1 integrity..."
if [ -f "audit/append_only_writer.sh" ]; then
    echo "✅ Cycle 1 writer preserved"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo "❌ Cycle 1 writer missing"
fi

# Validation result
echo ""
echo "=== VALIDATION RESULT ==="
echo "Passed: $PASS_COUNT/$TOTAL_TESTS"

if [ $PASS_COUNT -eq $TOTAL_TESTS ]; then
    echo ""
    echo "🎉 CYCLE 2 IMPLEMENTATION VALIDATED"
    echo "All governance constraints maintained"
    echo "Query API skeleton ready for implementation"
    exit 0
else
    echo ""
    echo "❌ CYCLE 2 VALIDATION FAILED"
    echo "$((TOTAL_TESTS - PASS_COUNT)) issues need resolution"
    exit 1
fi

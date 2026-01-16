#!/bin/bash
# Query Execution Limits Test
echo "=== QUERY EXECUTION LIMITS TEST ==="
echo ""

# Test 1: Normal query
echo "1. Testing normal query..."
QUERY_ID="test_normal_$(date +%s)"
QUERY_CMD='echo "{\"test\":\"normal\"}"'
if ./api/v1/query_guard.sh "$QUERY_ID" "$QUERY_CMD" 2>/dev/null | grep -q "test"; then
    echo "✅ Normal query succeeded"
else
    echo "❌ Normal query failed"
fi

# Test 2: Timeout query
echo ""
echo "2. Testing timeout..."
QUERY_ID="test_timeout_$(date +%s)"
QUERY_CMD='sleep 10; echo "timeout test"'
./api/v1/query_guard.sh "$QUERY_ID" "$QUERY_CMD" 2>&1 | grep -q "Timeout" && echo "✅ Timeout enforced" || echo "❌ Timeout not working"

# Test 3: API integration
echo ""
echo "3. Testing API integration..."
HTTP_AUTHORIZATION='Bearer platform' \
REQUEST_PATH='/api/v1/platform/users' \
./api/v1/server.sh 2>/dev/null | grep -q "users" && echo "✅ API works with guard" || echo "❌ API integration failed"

echo ""
echo "=== TEST COMPLETE ==="

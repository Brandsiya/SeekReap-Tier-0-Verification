#!/bin/bash

echo "========================================="
echo "   FINAL PHASE 1 VERIFICATION TESTS     "
echo "========================================="
echo "Timestamp: $(date)"
echo ""

# Test 1: Valid API Key
echo "TEST 1: Valid API Key"
echo "---------------------"
RESPONSE1=$(curl -X POST http://localhost:3001/engagements/start \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev_key_12345" \
  -d '{"test": "phase1_final"}' \
  -s -w "%{http_code}" -o /dev/null)
echo "Expected: 200 or 201"
echo "Actual:   HTTP $RESPONSE1"
echo ""

# Test 2: No API Key (CRITICAL - should be 401)
echo "TEST 2: No API Key (Unauthorized)"
echo "----------------------------------"
RESPONSE2=$(curl -X POST http://localhost:3001/engagements/start \
  -H "Content-Type: application/json" \
  -d '{"test": "phase1_final"}' \
  -s -w "%{http_code}" -o /dev/null)
echo "Expected: 401 (Unauthorized)"
echo "Actual:   HTTP $RESPONSE2"
echo ""

# Test 3: Invalid API Key
echo "TEST 3: Invalid API Key"
echo "-----------------------"
RESPONSE3=$(curl -X POST http://localhost:3001/engagements/start \
  -H "Content-Type: application/json" \
  -H "x-api-key: totally_wrong_key_xyz123" \
  -d '{"test": "phase1_final"}' \
  -s -w "%{http_code}" -o /dev/null)
echo "Expected: 401 (Unauthorized)"
echo "Actual:   HTTP $RESPONSE3"
echo ""

# Test 4: Rate Limiting
echo "TEST 4: Rate Limiting"
echo "---------------------"
echo "Making requests to trigger rate limit (100 max)..."
echo ""

RATE_LIMIT_TRIGGERED=false
LAST_REQUEST=0

for i in {1..110}; do
  RESPONSE=$(curl -X POST http://localhost:3001/engagements/start \
    -H "Content-Type: application/json" \
    -H "x-api-key: dev_key_12345" \
    -d "{\"request\": $i}" \
    -s -w "%{http_code}" -o /dev/null)
  
  LAST_REQUEST=$i
  
  # Show first 5 and last 5 requests
  if [ $i -le 5 ] || [ $i -ge 96 ]; then
    echo "Request $i: HTTP $RESPONSE"
  fi
  
  if [ "$RESPONSE" = "429" ]; then
    echo ""
    echo "✅ RATE LIMIT HIT at request #$i"
    RATE_LIMIT_TRIGGERED=true
    break
  fi
  
  # Brief pause
  sleep 0.05
done

echo ""
echo "========================================="
echo "          VERIFICATION RESULTS          "
echo "========================================="
echo "1. Valid API Key Test:   HTTP $RESPONSE1"
echo "2. No API Key Test:      HTTP $RESPONSE2"
echo "3. Invalid API Key Test: HTTP $RESPONSE3"
echo "4. Rate Limit Test:      $LAST_REQUEST requests"

if [ "$RESPONSE2" = "401" ] && [ "$RESPONSE3" = "401" ]; then
  echo "   ✅ Authentication: PASS"
else
  echo "   ❌ Authentication: FAIL"
fi

if [ "$RATE_LIMIT_TRIGGERED" = true ]; then
  echo "   ✅ Rate Limiting:  PASS"
else
  echo "   ❌ Rate Limiting:  FAIL"
fi

echo ""
echo "========================================="
echo "     PHASE 1 EVIDENCE DOCUMENTATION     "
echo "========================================="
echo "To close Phase 1, save this output as:"
echo "1. Screenshot of terminal"
echo "2. Text log file"
echo "3. Add to project documentation"
echo ""
echo "Required for Phase 1 Closure:"
echo "✓ 401 responses for unauthorized access"
echo "✓ 429 response for rate limiting"
echo "✓ Production deployment (next step)"

#!/bin/bash

echo "=== PHASE 1 AUTHENTICATION TESTS ==="
echo ""

echo "1. Testing with VALID API key..."
curl -X POST http://localhost:3001/engagements/start \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev_key_12345" \
  -d '{"test": "data"}' \
  -w "HTTP Status: %{http_code}\n\n"

echo "2. Testing WITHOUT API key (should be 401)..."
curl -X POST http://localhost:3001/engagements/start \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -w "HTTP Status: %{http_code}\n\n"

echo "3. Testing with INVALID API key..."
curl -X POST http://localhost:3001/engagements/start \
  -H "Content-Type: application/json" \
  -H "x-api-key: wrong_key_99999" \
  -d '{"test": "data"}' \
  -w "HTTP Status: %{http_code}\n\n"

echo "4. Starting RATE LIMIT test (100 requests max)..."
echo "   Making 105 requests to trigger rate limit..."
echo ""

count=0
for i in {1..105}; do
  RESPONSE=$(curl -X POST http://localhost:3001/engagements/start \
    -H "Content-Type: application/json" \
    -H "x-api-key: dev_key_12345" \
    -d '{"test": "data"}' \
    -s -o /dev/null -w "%{http_code}")
  
  echo -n "Request $i: $RESPONSE | "
  
  if [ $((i % 10)) -eq 0 ]; then
    echo ""
  fi
  
  if [ "$RESPONSE" = "429" ]; then
    echo -e "\n\n✅ RATE LIMIT TRIGGERED at request $i"
    break
  fi
  
  sleep 0.05
  count=$i
done

echo -e "\n=== TEST COMPLETE ==="
echo "Total requests made: $count"
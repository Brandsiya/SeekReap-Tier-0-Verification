#!/bin/bash
echo "=== SeekReap API Test ==="
echo ""

# Test public endpoints
echo "1. Testing /health:"
curl -s http://localhost:3981/health
echo ""
echo ""

echo "2. Testing /pilot-info:"
curl -s http://localhost:3981/pilot-info
echo ""
echo ""

# Get token
echo "3. Getting observer token:"
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3981/admin/token \
  -H "Content-Type: application/json" \
  -d '{"key":"dev123","client":"TestClient"}')
echo "$TOKEN_RESPONSE"
echo ""

# Extract token (simple method)
if [[ "$TOKEN_RESPONSE" == *"token"* ]]; then
  TOKEN=$(echo "$TOKEN_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
  echo "Extracted token: ${TOKEN:0:20}..."
  echo ""
  
  # Test with token
  echo "4. Testing /verification/health WITH token:"
  curl -s -H "X-Token: $TOKEN" http://localhost:3981/verification/health
  echo ""
  echo ""
  
  echo "5. Testing /dashboard/stats WITH token:"
  curl -s -H "X-Token: $TOKEN" http://localhost:3981/dashboard/stats
  echo ""
  echo ""
else
  echo "ERROR: Could not get token"
  echo "$TOKEN_RESPONSE"
fi

# Test without token
echo "6. Testing /dashboard/stats WITHOUT token (should fail):"
curl -s http://localhost:3981/dashboard/stats
echo ""
echo ""

echo "=== Test Complete ==="

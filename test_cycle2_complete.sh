#!/bin/bash
echo "=== CYCLE 2 COMPLETE TEST ==="
echo ""

echo "1. API Health:"
REQUEST_PATH='/api/v1/audit/health' ./api/v1/server.sh
echo ""

echo "2. Platform Users (no auth - should fail):"
REQUEST_PATH='/api/v1/platform/users' ./api/v1/server.sh
echo ""

echo "3. Platform Users (with auth - should work):"
HTTP_AUTHORIZATION='Bearer platform' REQUEST_PATH='/api/v1/platform/users' ./api/v1/server.sh
echo ""

echo "4. Platform Metrics (with auth):"
HTTP_AUTHORIZATION='Bearer platform' REQUEST_PATH='/api/v1/platform/metrics' ./api/v1/server.sh
echo ""

echo "5. Regulator Audit (no auth - should fail):"
REQUEST_PATH='/api/v1/regulator/audit' ./api/v1/server.sh
echo ""

echo "6. Regulator Audit (with auth - should work):"
HTTP_AUTHORIZATION='Bearer regulator' REQUEST_PATH='/api/v1/regulator/audit' ./api/v1/server.sh
echo ""

echo "7. Regulator Compliance (with auth):"
HTTP_AUTHORIZATION='Bearer regulator' REQUEST_PATH='/api/v1/regulator/compliance' ./api/v1/server.sh
echo ""

echo "8. Invalid endpoint:"
REQUEST_PATH='/api/v1/invalid' ./api/v1/server.sh
echo ""

echo "=== CYCLE 2 TEST COMPLETE ==="

#!/bin/bash
echo "=== SeekReap API Deployment Verification ==="
echo ""

# Test live endpoints
echo "1. Testing LIVE API health:"
curl -s https://seekreap-api.onrender.com/health
echo ""
echo ""

echo "2. Testing LIVE API pilot info:"
curl -s https://seekreap-api.onrender.com/pilot-info
echo ""
echo ""

echo "3. Testing protected endpoint without token (should fail):"
curl -s https://seekreap-api.onrender.com/dashboard/stats
echo ""
echo ""

echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
echo "1. Set ADMIN_KEY in Render environment variables"
echo "2. Generate production tokens for clients"
echo "3. Share client access package"

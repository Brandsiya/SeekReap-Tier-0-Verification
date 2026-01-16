#!/bin/bash
echo "Test 1: Health"
REQUEST_PATH='/api/v1/audit/health' ./api/v1/server.sh
echo ""
echo "Test 2: Platform (no auth)"
REQUEST_PATH='/api/v1/platform/users' ./api/v1/server.sh
echo ""
echo "Test 3: Platform (with auth)"
HTTP_AUTHORIZATION='Bearer test' REQUEST_PATH='/api/v1/platform/users' ./api/v1/server.sh

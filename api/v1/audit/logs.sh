#!/bin/bash
# Audit logs with hash pagination
echo "Content-Type: application/json"
echo ""
PAGE=${QUERY_PAGE:-1}
echo '{
  "page": '$PAGE',
  "per_page": 50,
  "total": 1000,
  "data": [
    {"id": "log_001", "timestamp": "2024-01-07T03:00:00", "event": "health_check"},
    {"id": "log_002", "timestamp": "2024-01-07T03:01:00", "event": "user_login"},
    {"id": "log_003", "timestamp": "2024-01-07T03:02:00", "event": "api_request"}
  ],
  "hash": "'$(echo "page_$PAGE" | sha256sum | cut -d' ' -f1)'",
  "note": "Hash pagination ensures deterministic access"
}'

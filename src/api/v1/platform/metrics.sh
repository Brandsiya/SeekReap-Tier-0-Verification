#!/bin/bash
# Platform Metrics with Query Guard

QUERY_ID="platform_metrics_$(date +%s)"
QUERY_CMD='echo "{\"metrics\":{\"cpu\":45,\"memory\":78,\"disk\":32},\"scope\":\"platform\"}"'

./api/v1/query_guard.sh "$QUERY_ID" "$QUERY_CMD"

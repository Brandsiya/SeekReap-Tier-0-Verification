#!/bin/bash
# Regulator Audit with Query Guard

QUERY_ID="regulator_audit_$(date +%s)"
QUERY_CMD='sleep 1; echo "{\"audit_logs\":[\"log1\",\"log2\",\"log3\"],\"scope\":\"regulator\"}"'

./api/v1/query_guard.sh "$QUERY_ID" "$QUERY_CMD"

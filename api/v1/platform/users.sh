#!/bin/bash
# Platform Users with Query Guard

QUERY_ID="platform_users_$(date +%s)"
QUERY_CMD='sleep 2; echo "{\"users\":[\"user1\",\"user2\",\"user3\"],\"count\":3,\"scope\":\"platform\"}"'

./api/v1/query_guard.sh "$QUERY_ID" "$QUERY_CMD"

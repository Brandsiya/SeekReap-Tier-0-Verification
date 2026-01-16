#!/bin/bash
# Query Guard - Checkpoint 2
# Enforces execution bounds to prevent resource exhaustion

QUERY_ID="$1"
COMMAND="$2"
TIMEOUT=2  # 2 second timeout

# Execute with timeout
timeout $TIMEOUT bash -c "$COMMAND"
EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
    echo "Query timeout - execution bound exceeded"
    exit 124
elif [ $EXIT_CODE -eq 0 ]; then
    echo "Query completed successfully"
    exit 0
else
    echo "Query failed with code $EXIT_CODE"
    exit $EXIT_CODE
fi

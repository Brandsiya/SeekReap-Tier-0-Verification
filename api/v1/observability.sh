#!/bin/bash
# Operational Telemetry - Checkpoint 4
# Non-invasive observability without audit trails

METHOD="$1"
PATH="$2"
SCRIPT="$3"

# Create telemetry directory
TELEMETRY_DIR="/tmp/cycle3_telemetry"
mkdir -p "$TELEMETRY_DIR"

# Generate unique ID for this request
REQUEST_ID=$(date +%s%N | sha256sum | cut -c1-8)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Record start time
START_TIME=$(date +%s%N)

# Execute the actual script and capture its output
OUTPUT=$("$SCRIPT" 2>&1)
EXIT_CODE=$?

# Calculate duration
END_TIME=$(date +%s%N)
DURATION_MS=$(( (END_TIME - START_TIME) / 1000000 ))

# Extract status code if present (heuristic detection)
STATUS_CODE=$(echo "$OUTPUT" | grep -o "Status: [0-9][0-9][0-9]" | head -1 | cut -d' ' -f2 || echo "200")

# Record telemetry (NON-INVASIVE - doesn't modify original output)
{
    echo "timestamp=$TIMESTAMP"
    echo "method=$METHOD"
    echo "path=$PATH"
    echo "status=$STATUS_CODE"
    echo "duration_ms=$DURATION_MS"
    echo "request_id=$REQUEST_ID"
    echo "heuristic_status_detection=true"
    echo "governance_note=operational_telemetry_only"
} > "$TELEMETRY_DIR/${REQUEST_ID}_telemetry.tel"

# Output EXACTLY what the original script produced
echo "$OUTPUT"
exit $EXIT_CODE

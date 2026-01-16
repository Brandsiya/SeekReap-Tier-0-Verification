#!/bin/bash
# Phase 3 Audit Logger
# Minimal implementation for Cycle 2

AUDIT_CONFIG="config/audit_enabled.txt"
AUDIT_DIR="audit_logs"
TODAY=$(date -u '+%Y-%m-%d')
AUDIT_FILE="$AUDIT_DIR/audit_$TODAY.log"

# Check if audit is enabled
if [ -f "$AUDIT_CONFIG" ]; then
    AUDIT_ENABLED=$(grep "AUDIT_ENABLED=" "$AUDIT_CONFIG" | cut -d'=' -f2)
else
    AUDIT_ENABLED="false"
fi

log_audit_event() {
    local event_type="$1"
    local event_id="$2"
    local actor="$3"
    local action="$4"
    local outcome="$5"
    local details="$6"
    
    if [ "$AUDIT_ENABLED" != "true" ]; then
        return 0  # Audit disabled, silent success
    fi
    
    # Create audit directory if needed
    mkdir -p "$AUDIT_DIR"
    
    # Generate audit record
    local timestamp=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    local audit_id=$(uuidgen 2>/dev/null || echo "audit-$(date +%s)-$RANDOM")
    
    # Calculate previous hash for chain integrity
    local previous_hash=""
    if [ -f "$AUDIT_FILE" ]; then
        previous_hash=$(tail -1 "$AUDIT_FILE" | grep -o '"hash":"[^"]*"' | cut -d'"' -f4)
    fi
    
    # Create hash of this record (simplified for demo)
    local record_string="$timestamp|$event_type|$event_id|$actor|$action|$outcome|$details|$previous_hash"
    local record_hash=$(echo -n "$record_string" | sha256sum | cut -d' ' -f1)
    
    # Write audit record
    cat >> "$AUDIT_FILE" << AUDIT_RECORD
{
  "audit_id": "$audit_id",
  "version": "1.0",
  "timestamp": "$timestamp",
  "event_type": "$event_type",
  "event_id": "$event_id",
  "actor": "$actor",
  "action": "$action",
  "outcome": "$outcome",
  "details": $details,
  "previous_hash": "$previous_hash",
  "hash": "$record_hash"
}
AUDIT_RECORD
    
    echo "Audit logged: $action ($outcome)"
}

# Export function for use in other scripts
export -f log_audit_event

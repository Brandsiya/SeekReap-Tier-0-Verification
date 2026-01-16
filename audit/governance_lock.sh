#!/bin/bash
# AUDIT GOVERNANCE ENFORCER

AUDIT_FILE="audit/seekreap_audit.log"

enforce_append_only() {
    echo "🔒 Enforcing audit governance..."
    
    # Create audit file if doesn't exist
    touch "$AUDIT_FILE"
    
    # Make append-only if supported
    if command -v chattr >/dev/null 2>&1; then
        chattr +a "$AUDIT_FILE" 2>/dev/null && echo "✅ Filesystem append-only lock enabled"
    else
        echo "⚠️  chattr not available (filesystem lock skipped)"
    fi
    
    echo "✅ Governance constraints active"
}

enforce_append_only

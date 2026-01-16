#!/bin/bash
# AUDIT INTEGRITY VERIFIER

AUDIT_FILE="audit/seekreap_audit.log"

verify_audit_trail() {
    echo "🔍 AUDIT INTEGRITY VERIFICATION"
    echo "================================"
    
    if [ ! -f "$AUDIT_FILE" ]; then
        echo "❌ No audit file found"
        return 1
    fi
    
    local line_num=0
    local errors=0
    
    while IFS= read -r line; do
        line_num=$((line_num + 1))
        
        # Check JSON validity
        if ! echo "$line" | jq . >/dev/null 2>&1; then
            echo "❌ Line $line_num: Invalid JSON"
            errors=$((errors + 1))
            continue
        fi
        
        echo "✅ Line $line_num: Valid audit event"
        
    done < "$AUDIT_FILE"
    
    # Summary
    echo ""
    echo "📊 VERIFICATION SUMMARY"
    echo "Total events: $line_num"
    echo "Integrity errors: $errors"
    
    if [ $errors -eq 0 ]; then
        echo "✅ AUDIT TRAIL VALID"
        return 0
    else
        echo "❌ AUDIT TRAIL COMPROMISED"
        return 1
    fi
}

verify_audit_trail

#!/bin/bash
# ROBUST AUDIT VERIFIER
# Works with or without jq

AUDIT_FILE="audit/seekreap_audit.log"
TEMP_FILE="/tmp/audit_check_$$"

verify_audit_trail() {
    echo "🔍 ROBUST AUDIT VERIFICATION"
    echo "============================="
    
    if [ ! -f "$AUDIT_FILE" ]; then
        echo "❌ No audit file found"
        return 1
    fi
    
    local line_num=0
    local valid_count=0
    local error_count=0
    local skip_header=0
    
    while IFS= read -r line; do
        line_num=$((line_num + 1))
        
        # Skip header lines (starting with #)
        if [[ "$line" =~ ^# ]]; then
            echo "📝 Line $line_num: Header/comment"
            continue
        fi
        
        # Skip empty lines
        if [[ -z "$line" ]]; then
            continue
        fi
        
        # Method 1: Try jq first
        if command -v jq >/dev/null 2>&1; then
            if echo "$line" | jq empty 2>/dev/null; then
                local event_id=$(echo "$line" | jq -r '.event_id // empty')
                if [ -n "$event_id" ]; then
                    echo "✅ Line $line_num: Valid JSON (Event: $event_id)"
                    valid_count=$((valid_count + 1))
                else
                    echo "⚠️  Line $line_num: Valid JSON but missing event_id"
                    error_count=$((error_count + 1))
                fi
            else
                echo "❌ Line $line_num: Invalid JSON"
                echo "   Content: ${line:0:50}..."
                error_count=$((error_count + 1))
            fi
        else
            # Method 2: Basic pattern matching without jq
            if [[ "$line" =~ ^\{.*\}$ ]] && [[ "$line" =~ \"event_id\" ]]; then
                echo "✅ Line $line_num: Basic validation passed"
                valid_count=$((valid_count + 1))
            else
                echo "❌ Line $line_num: Basic validation failed"
                error_count=$((error_count + 1))
            fi
        fi
        
    done < "$AUDIT_FILE"
    
    # Summary
    echo ""
    echo "📊 VERIFICATION SUMMARY"
    echo "Total lines processed: $line_num"
    echo "Valid audit events: $valid_count"
    echo "Errors: $error_count"
    echo ""
    
    if [ $error_count -eq 0 ] && [ $valid_count -gt 0 ]; then
        echo "✅ AUDIT TRAIL VALID: $valid_count events verified"
        return 0
    elif [ $error_count -gt 0 ]; then
        echo "❌ AUDIT TRAIL COMPROMISED: $error_count errors"
        return 1
    else
        echo "⚠️  NO AUDIT EVENTS FOUND"
        return 2
    fi
}

verify_audit_trail

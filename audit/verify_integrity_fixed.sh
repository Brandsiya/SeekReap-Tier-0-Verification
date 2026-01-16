#!/bin/bash
# FIXED INTEGRITY VERIFIER

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
    
    # Check if jq is available
    if ! command -v jq >/dev/null 2>&1; then
        echo "⚠️  jq not installed, using basic validation"
        while IFS= read -r line; do
            line_num=$((line_num + 1))
            # Basic JSON check
            if [[ "$line" =~ ^\{.*\}$ ]]; then
                echo "✅ Line $line_num: Valid JSON structure"
            else
                echo "❌ Line $line_num: Invalid JSON"
                errors=$((errors + 1))
            fi
        done < "$AUDIT_FILE"
    else
        # Use jq for proper validation
        while IFS= read -r line; do
            line_num=$((line_num + 1))
            if echo "$line" | jq empty 2>/dev/null; then
                echo "✅ Line $line_num: Valid JSON"
            else
                echo "❌ Line $line_num: Invalid JSON"
                errors=$((errors + 1))
            fi
        done < "$AUDIT_FILE"
    fi
    
    # Summary
    echo ""
    echo "📊 VERIFICATION SUMMARY"
    echo "Total events: $line_num"
    echo "Integrity errors: $errors"
    
    if [ $errors -eq 0 ]; then
        echo "✅ AUDIT TRAIL VALID"
        return 0
    else
        echo "❌ AUDIT TRAIL COMPROMISED: $errors errors"
        return 1
    fi
}

verify_audit_trail

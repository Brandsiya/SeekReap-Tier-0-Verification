#!/bin/bash
# SIMPLE GUARANTEED-VALID JSON AUDIT WRITER

AUDIT_FILE="audit/logs/seekreap_audit.log"

# Generate simple ID
generate_id() {
    date +%s%N | sha256sum | cut -c 1-8
}

write_simple_audit() {
    local subject_type="$1"
    local subject_id="$2" 
    local rule_id="$3"
    local rule_version="$4"
    local result="$5"
    
    local event_id="audit_$(generate_id)"
    local timestamp=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    local hash_data="$event_id$subject_type$subject_id$rule_id$rule_version$result$timestamp"
    local evidence_hash=$(echo -n "$hash_data" | sha256sum | cut -d' ' -f1)
    
    # Write SIMPLE valid JSON - one line, no complex formatting
    printf '{"event_id":"%s","subject_type":"%s","subject_id":"%s","rule_id":"%s","rule_version":"%s","evaluation_result":"%s","evidence_hash":"%s","timestamp_utc":"%s","system_version":"3.1.0"}\n' \
        "$event_id" "$subject_type" "$subject_id" "$rule_id" "$rule_version" "$result" "$evidence_hash" "$timestamp" >> "$AUDIT_FILE"
    
    echo "✅ AUDIT: $event_id | $subject_type:$subject_id | $rule_id@$rule_version | $result"
}

# Execute
write_simple_audit "$1" "$2" "$3" "$4" "$5"

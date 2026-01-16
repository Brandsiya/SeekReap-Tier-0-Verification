#!/bin/bash
# Deterministic Pagination - Cycle 3 / Checkpoint 3
# Hash-based consistent pagination for audit logs

PAGE_SIZE=5
HASH_SEED="cycle3_seed_2024"

# Generate deterministic hash for a string
generate_hash() {
    local input="$1"
    echo -n "$input" | md5sum | cut -d' ' -f1
}

# Get page number for a record based on hash
get_page_number() {
    local record_id="$1"
    local hash=$(generate_hash "$record_id")
    
    # Convert first 8 chars of hash to decimal
    local hash_decimal=$((0x${hash:0:8}))
    
    # Page number (1-based)
    echo $(( (hash_decimal % 100) + 1 ))
}

# Filter records for a specific page
filter_page() {
    local page_num="$1"
    
    # Read from stdin
    while IFS= read -r record; do
        if [ -n "$record" ]; then
            # Extract ID from JSON record
            local record_id=$(echo "$record" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
            if [ -z "$record_id" ]; then
                record_id=$(echo "$record" | md5sum | cut -d' ' -f1)
            fi
            
            local record_page=$(get_page_number "$record_id")
            if [ "$record_page" -eq "$page_num" ]; then
                echo "$record"
            fi
        fi
    done
}

# Generate test audit logs
generate_test_logs() {
    local count="$1"
    
    for i in $(seq 1 "$count"); do
        local user="user$((RANDOM % 10 + 1))"
        local action="action$((RANDOM % 5 + 1))"
        local timestamp=$(date -d "$((RANDOM % 365)) days ago" +"%Y-%m-%dT%H:%M:%SZ")
        
        echo "{\"id\":\"log_$i\",\"user\":\"$user\",\"action\":\"$action\",\"timestamp\":\"$timestamp\",\"page\":$(get_page_number "log_$i")}"
    done
}

# Main pagination function
paginate_audit_logs() {
    local page="${1:-1}"
    local total_records="${2:-50}"
    
    if [ "$page" -lt 1 ]; then
        page=1
    fi
    
    # Generate and filter logs
    generate_test_logs "$total_records" | filter_page "$page" | head -"$PAGE_SIZE"
    
    # Calculate metadata
    local total_pages=$(( (total_records + PAGE_SIZE - 1) / PAGE_SIZE ))
    local count=$(generate_test_logs "$total_records" | filter_page "$page" | wc -l)
    
    echo "{\"metadata\":{\"page\":$page,\"page_size\":$PAGE_SIZE,\"total_records\":$total_records,\"total_pages\":$total_pages,\"count_on_page\":$count,\"hash_seed\":\"$HASH_SEED\"}}" >&2
}

# Command line interface
if [ "$#" -ge 1 ]; then
    paginate_audit_logs "$@"
fi

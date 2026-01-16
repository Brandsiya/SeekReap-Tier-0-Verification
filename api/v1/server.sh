#!/bin/bash
# API Gateway Server - Cycle 3 Final
# Fixed paths and complete implementation

# Read request
read -r request
method=$(echo "$request" | awk '{print $1}')
path=$(echo "$request" | awk '{print $2}')
query=$(echo "$path" | grep -o '?.*' | sed 's/?//')
clean_path=$(echo "$path" | cut -d'?' -f1)

# Parse page parameter only (CHECKPOINT 3 boundary)
if [ -n "$query" ]; then
    if [[ "$query" == *"page="* ]]; then
        export QUERY_PAGE=$(echo "$query" | grep -o 'page=[0-9]*' | cut -d'=' -f2)
    fi
fi

# Route requests with observability
case "$clean_path" in
    /api/v1/audit/health)
        ./api/v1/observability.sh "$method" "$clean_path" "./api/v1/audit/health.sh"
        ;;
    /api/v1/audit/logs)
        ./api/v1/observability.sh "$method" "$clean_path" "./api/v1/audit/logs.sh"
        ;;
    /api/v1/platform/users)
        if [ "$HTTP_AUTHORIZATION" = "Bearer platform" ]; then
            ./api/v1/observability.sh "$method" "$clean_path" "./api/v1/platform/users.sh"
        else
            echo "Status: 401 Unauthorized"
            echo "Content-Type: application/json"
            echo ""
            echo '{"error":"Unauthorized - platform scope required"}'
        fi
        ;;
    /api/v1/observability/telemetry)
        # STRICT ACCESS CONTROL - platform only
        if [ "$HTTP_AUTHORIZATION" = "Bearer platform" ]; then
            echo "Content-Type: application/json"
            echo "X-Telemetry-Scope: platform-operational"
            echo ""
            if [ -d "/tmp/cycle3_telemetry" ]; then
                echo '{
  "telemetry_scope": "platform-operational",
  "file_count": '"$(ls /tmp/cycle3_telemetry/*.tel 2>/dev/null | wc -l)"',
  "total_size_bytes": '"$(ls -la /tmp/cycle3_telemetry/*.tel 2>/dev/null | awk '{sum+=$5} END{print sum+0}')"',
  "latest_activity": "'"$(ls -lt /tmp/cycle3_telemetry/*.tel 2>/dev/null | head -1 | cut -d' ' -f6-10 2>/dev/null || echo 'none')"'",
  "note": "Operational telemetry only - governance compliant"
}'
            else
                echo '{"status":"no_telemetry","scope":"platform-operational"}'
            fi
        else
            echo "Status: 403 Forbidden"
            echo "Content-Type: application/json"
            echo ""
            echo '{"error":"Forbidden - telemetry requires platform authorization"}'
        fi
        ;;
    *)
        echo "Status: 404 Not Found"
        echo "Content-Type: application/json"
        echo ""
        echo "{\"error\":\"Not found\",\"path\":\"$clean_path\"}"
        ;;
esac

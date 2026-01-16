#!/bin/bash
REQUEST_PATH="${REQUEST_PATH:-/api/v1/audit/health}"

# Health endpoint
if [[ "$REQUEST_PATH" == "/api/v1/audit/health" ]]; then
    echo '{"status":"healthy","cycle":2,"api":"query"}'
    exit 0
fi

# Platform endpoints
if [[ "$REQUEST_PATH" =~ ^/api/v1/platform/ ]]; then
    ENDPOINT=$(basename "$REQUEST_PATH")
    
    if [[ -z "$HTTP_AUTHORIZATION" ]]; then
        echo '{"error":"Platform authorization required"}'
        exit 0
    fi
    
    # Call platform handler if exists
    if [ -f "api/v1/platform/$ENDPOINT.sh" ]; then
        ./api/v1/platform/$ENDPOINT.sh
    else
        echo '{"error":"Platform endpoint not found","endpoint":"'$ENDPOINT'"}'
    fi
    exit 0
fi

# Regulator endpoints
if [[ "$REQUEST_PATH" =~ ^/api/v1/regulator/ ]]; then
    ENDPOINT=$(basename "$REQUEST_PATH")
    
    if [[ -z "$HTTP_AUTHORIZATION" ]]; then
        echo '{"error":"Regulator authorization required"}'
        exit 0
    fi
    
    # Call regulator handler if exists
    if [ -f "api/v1/regulator/$ENDPOINT.sh" ]; then
        ./api/v1/regulator/$ENDPOINT.sh
    else
        echo '{"error":"Regulator endpoint not found","endpoint":"'$ENDPOINT'"}'
    fi
    exit 0
fi

echo '{"error":"Endpoint not found","path":"'$REQUEST_PATH'"}'

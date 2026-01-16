#!/bin/bash
# Test Cycle 3 / Checkpoint 1 Rate Limiter

echo "Testing platform rate limit..."
platform_count=0
for i in {1..105}; do
    if ./api/v1/rate_limiter.sh check_rate_limit "platform"; then
        platform_count=$((platform_count + 1))
    fi
done
echo "Platform allowed: $platform_count/105"

echo "Testing regulator rate limit..."
regulator_count=0
for i in {1..15}; do
    if ./api/v1/rate_limiter.sh check_rate_limit "regulator"; then
        regulator_count=$((regulator_count + 1))
    fi
done
echo "Regulator allowed: $regulator_count/15"

echo ""
echo "Expected: Platform ~100 allowed, Regulator ~10 allowed"

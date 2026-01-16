#!/bin/bash
echo "=== DAY 6 COMPREHENSIVE ANALYSIS ==="
echo "Analysis Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# Determine Day 6 outcome
DAY6_PASS=false
if [ -f "day-6-result.txt" ] && grep -qi "PASS" "day-6-result.txt"; then
    DAY6_PASS=true
    RESULT_ICON="✅"
    RESULT_TEXT="PASS"
else
    RESULT_ICON="❌"
    RESULT_TEXT="FAIL or MISSING"
fi

echo "Day 6 Result: $RESULT_ICON $RESULT_TEXT"
echo ""

# Cumulative streak calculation
STREAK=0
for day in {1..6}; do
    if [ -f "day-${day}-result.txt" ] && grep -qi "PASS" "day-${day}-result.txt"; then
        STREAK=$day
    else
        break
    fi
done

echo "CUMULATIVE PROGRESS:"
echo "Consecutive Passes: $STREAK/14"
echo "Completion Percentage: $(awk "BEGIN {printf \"%.1f\", ($STREAK/14)*100}")%"
echo ""

# Quartile progress
if [ $STREAK -le 4 ]; then
    QUARTILE="First"
    QUARTILE_PROGRESS=$STREAK
    QUARTILE_TOTAL=4
elif [ $STREAK -le 8 ]; then
    QUARTILE="Second"
    QUARTILE_PROGRESS=$((STREAK - 4))
    QUARTILE_TOTAL=4
elif [ $STREAK -le 12 ]; then
    QUARTILE="Third"
    QUARTILE_PROGRESS=$((STREAK - 8))
    QUARTILE_TOTAL=4
else
    QUARTILE="Final"
    QUARTILE_PROGRESS=$((STREAK - 12))
    QUARTILE_TOTAL=2
fi

echo "QUARTILE STATUS:"
echo "Current: $QUARTILE Quartile"
echo "Progress: $QUARTILE_PROGRESS/$QUARTILE_TOTAL days"
echo ""

# Trend analysis
echo "TREND ANALYSIS (Days 1-6):"
DAYS_PASSED=$STREAK
if [ $DAYS_PASSED -ge 6 ]; then
    echo "Trend: 📈 EXCELLENT - Perfect through Day 6"
    echo "Stability: ⭐⭐⭐⭐⭐ (Highest rating)"
elif [ $DAYS_PASSED -ge 4 ]; then
    echo "Trend: ↗️  GOOD - Solid performance"
    echo "Stability: ⭐⭐⭐⭐"
elif [ $DAYS_PASSED -ge 2 ]; then
    echo "Trend: → STABLE - Consistent"
    echo "Stability: ⭐⭐⭐"
else
    echo "Trend: ⚠️  UNSTABLE - Needs monitoring"
    echo "Stability: ⭐⭐"
fi

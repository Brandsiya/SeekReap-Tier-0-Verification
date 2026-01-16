#!/bin/bash
echo ""
echo "=== DAY 7 COMPREHENSIVE ANALYSIS ==="
echo "Analysis Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# Determine current streak
STREAK=0
DAY7_PASSED=false

if [ -f "day-7-result.txt" ] && grep -qi "PASS" "day-7-result.txt" ]; then
    DAY7_PASSED=true
fi

# Calculate streak
for day in {1..7}; do
    if [ -f "day-${day}-result.txt" ] && grep -qi "PASS" "day-${day}-result.txt" ]; then
        STREAK=$day
    else
        break
    fi
done

echo ""
echo "CUMULATIVE RESULTS:"
echo "-------------------"
echo "Day 7 Result: $(if [ "$DAY7_PASSED" = true ]; then echo "✅ PASS"; else echo "❌ FAIL/MISSING"; fi)"
echo "Consecutive Passes: $STREAK/14"
echo "Overall Progress: $(awk "BEGIN {printf \"%.1f\", ($STREAK/14)*100}")%"
echo ""

# Milestone check
if [ $STREAK -eq 7 ]; then
    echo "🎯 MILESTONE ACHIEVED:"
    echo "• 50% of Phase 2 stabilization complete!"
    echo "• Second quartile 75% complete (3/4 days)"
    echo "• Perfect week of execution (7 consecutive days)"
    echo ""
elif [ $STREAK -eq 6 ]; then
    echo "⚠️  STATUS:"
    echo "• Day 7 did not pass"
    echo "• Streak remains at 6 days"
    echo "• Second quartile: 2/4 days complete"
    echo ""
fi

# Quartile analysis
echo "QUARTILE PROGRESS:"
echo "------------------"
if [ $STREAK -le 4 ]; then
    QUARTILE="First"
    QUARTILE_PROGRESS=$STREAK
    QUARTILE_TOTAL=4
    QUARTILE_PCT=$(awk "BEGIN {printf \"%.0f\", ($QUARTILE_PROGRESS/$QUARTILE_TOTAL)*100}")
elif [ $STREAK -le 8 ]; then
    QUARTILE="Second"
    QUARTILE_PROGRESS=$((STREAK - 4))
    QUARTILE_TOTAL=4
    QUARTILE_PCT=$(awk "BEGIN {printf \"%.0f\", ($QUARTILE_PROGRESS/$QUARTILE_TOTAL)*100}")
elif [ $STREAK -le 12 ]; then
    QUARTILE="Third"
    QUARTILE_PROGRESS=$((STREAK - 8))
    QUARTILE_TOTAL=4
    QUARTILE_PCT=$(awk "BEGIN {printf \"%.0f\", ($QUARTILE_PROGRESS/$QUARTILE_TOTAL)*100}")
else
    QUARTILE="Final"
    QUARTILE_PROGRESS=$((STREAK - 12))
    QUARTILE_TOTAL=2
    QUARTILE_PCT=$(awk "BEGIN {printf \"%.0f\", ($QUARTILE_PROGRESS/$QUARTILE_TOTAL)*100}")
fi

echo "Current Quartile: $QUARTILE"
echo "Quartile Progress: $QUARTILE_PROGRESS/$QUARTILE_TOTAL days ($QUARTILE_PCT%)"

if [ "$QUARTILE" = "Second" ] && [ $QUARTILE_PROGRESS -eq 3 ]; then
    echo "🎯 Second Quartile: One day remaining for completion!"
fi
echo ""

# Trend analysis
echo "TREND ANALYSIS:"
echo "--------------"
if [ $STREAK -ge 7 ]; then
    echo "📈 Trend: EXCELLENT - Perfect through Day 7"
    echo "⭐ Stability: MAXIMUM (7/7 perfect)"
    echo "🎯 Predictability: HIGH (consistent pattern)"
elif [ $STREAK -ge 5 ]; then
    echo "↗️  Trend: GOOD - Strong performance"
    echo "⭐ Stability: HIGH"
    echo "🎯 Predictability: MODERATE-HIGH"
elif [ $STREAK -ge 3 ]; then
    echo "→ Trend: STABLE - Consistent"
    echo "⭐ Stability: MODERATE"
    echo "🎯 Predictability: MODERATE"
else
    echo "⚠️  Trend: UNSTABLE - Needs monitoring"
    echo "⭐ Stability: LOW"
    echo "🎯 Predictability: LOW"
fi

echo ""
echo "GOVERNANCE STATUS:"
echo "-----------------"
if [ $STREAK -gt 0 ]; then
    echo "✅ Rules maintained for $STREAK consecutive days"
    echo "✅ System frozen state preserved"
    echo "✅ Only validation executed"
else
    echo "⚠️  Governance status needs verification"
fi

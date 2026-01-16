#!/bin/bash
echo ""
echo "=== DAY 8 COMPREHENSIVE ANALYSIS ==="
echo "Analysis Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# Determine Day 8 outcome
DAY8_PASSED=false
if [ -f "day-8-result.txt" ] && grep -qi "PASS" "day-8-result.txt" ]; then
    DAY8_PASSED=true
fi

# Calculate current streak
STREAK=0
for day in {1..8}; do
    if [ -f "day-${day}-result.txt" ] && grep -qi "PASS" "day-${day}-result.txt" ]; then
        STREAK=$day
    else
        break
    fi
done

echo ""
echo "SECOND QUARTILE FINAL RESULT:"
echo "------------------------------"
echo "Day 8 Result: $(if [ "$DAY8_PASSED" = true ]; then echo "✅ PASS"; else echo "❌ FAIL/MISSING"; fi)"
echo "Second Quartile Days (5-8): $(if [ $STREAK -ge 8 ]; then echo "4/4 ✅ PERFECT"; elif [ $STREAK -ge 5 ]; then echo "$((STREAK-4))/4 ⚠️ PARTIAL"; else echo "0/4 ❌ FAILED"; fi)"
echo ""

echo "CUMULATIVE PROGRESS:"
echo "-------------------"
echo "Consecutive Passes: $STREAK/14"
echo "Overall Progress: $(awk "BEGIN {printf \"%.1f\", ($STREAK/14)*100}")%"
echo "Days Remaining: $((14 - STREAK))"
echo ""

# Milestone check
if [ $STREAK -eq 8 ]; then
    echo "🎯 MILESTONE ACHIEVED:"
    echo "• Second Quartile COMPLETE! (4/4 days perfect)"
    echo "• 57.1% of Phase 2 stabilization complete"
    echo "• 8 consecutive perfect executions"
    echo "• Transition to Third Quartile authorized"
    echo ""
elif [ $STREAK -eq 7 ]; then
    echo "⚠️  STATUS:"
    echo "• Day 8 did not pass"
    echo "• Second Quartile: 3/4 days complete"
    echo "• Streak remains at 7 days"
    echo "• Second quartile incomplete - requires restart"
    echo ""
fi

# Quartile transition analysis
echo "QUARTILE TRANSITION STATUS:"
echo "---------------------------"
if [ $STREAK -le 4 ]; then
    echo "Current: First Quartile (Days 1-4)"
    echo "Progress: $STREAK/4 days"
    echo "Next: Second Quartile (Days 5-8)"
elif [ $STREAK -le 8 ]; then
    echo "Current: Second Quartile (Days 5-8)"
    QUARTILE_PROGRESS=$((STREAK - 4))
    echo "Progress: $QUARTILE_PROGRESS/4 days"
    
    if [ $STREAK -eq 8 ]; then
        echo "✅ READY for Third Quartile (Days 9-12)"
    else
        echo "⏳ REMAINING in Second Quartile"
    fi
elif [ $STREAK -le 12 ]; then
    echo "Current: Third Quartile (Days 9-12)"
    QUARTILE_PROGRESS=$((STREAK - 8))
    echo "Progress: $QUARTILE_PROGRESS/4 days"
else
    echo "Current: Final Phase (Days 13-14)"
    QUARTILE_PROGRESS=$((STREAK - 12))
    echo "Progress: $QUARTILE_PROGRESS/2 days"
fi
echo ""

# Trend analysis
echo "TREND ANALYSIS (Days 1-8):"
echo "--------------------------"
if [ $STREAK -eq 8 ]; then
    echo "📈 Trend: EXCELLENT - Perfect through Day 8"
    echo "⭐ Stability: MAXIMUM (8/8 perfect)"
    echo "🎯 Predictability: VERY HIGH (established pattern)"
    echo "📊 Confidence: STRONG (all quartiles on track)"
elif [ $STREAK -ge 6 ]; then
    echo "↗️  Trend: GOOD - Strong performance"
    echo "⭐ Stability: HIGH"
    echo "🎯 Predictability: MODERATE-HIGH"
    echo "📊 Confidence: MODERATE"
else
    echo "⚠️  Trend: NEEDS IMPROVEMENT"
    echo "⭐ Stability: MODERATE-LOW"
    echo "🎯 Predictability: LOW"
    echo "📊 Confidence: LOW"
fi

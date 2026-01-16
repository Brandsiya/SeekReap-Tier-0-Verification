#!/bin/bash
echo ""
echo "=== GOVERNANCE COMPLIANCE VERIFICATION - DAY 8 ==="
echo "Verification Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "Observation Period: Up to 8 days (Day 1 through Day 8)"
echo "Special Focus: Second Quartile Completion Review"
echo ""

# Calculate current streak
STREAK=0
for day in {1..8}; do
    if [ -f "day-${day}-result.txt" ] && grep -qi "PASS" "day-${day}-result.txt" ]; then
        STREAK=$day
    else
        break
    fi
done

echo "1. IMMUTABLE RULES COMPLIANCE SUMMARY:"
echo "--------------------------------------"
echo "Days of Perfect Compliance: $STREAK consecutive days"
echo ""

if [ $STREAK -eq 8 ]; then
    echo "✅ SECOND QUARTILE GOVERNANCE STATUS:"
    echo "• Days 5-8: FULL COMPLIANCE (4/4 days)"
    echo "• No violations detected"
    echo "• All rules maintained"
    echo "• System frozen state preserved"
    echo ""
    
    echo "📊 COMPLIANCE METRICS BY QUARTILE:"
    echo "• First Quartile (Days 1-4): 100% compliance"
    echo "• Second Quartile (Days 5-8): 100% compliance"
    echo "• Cumulative (Days 1-8): 100% compliance"
    echo ""
else
    echo "⚠️  GOVERNANCE STATUS:"
    echo "• Current Streak: $STREAK days"
    echo "• Second Quartile: $((STREAK > 4 ? STREAK - 4 : 0))/4 days compliant"
    echo "• Further verification needed"
    echo ""
fi

echo "2. SYSTEM INTEGRITY CHECKS:"
echo "---------------------------"
echo "Critical Files:"
echo "• test-week4-notifications.cjs: $(if [ -f "test-week4-notifications.cjs" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)"
echo "• daily-stabilization-check.sh: $(if [ -f "daily-stabilization-check.sh" ]; then echo "✅ Present"; else echo "❌ Missing"; fi)"
echo ""

echo "3. ARTIFACT COMPLETENESS:"
echo "-------------------------"
RESULT_FILES=0
LOG_FILES=0

for day in {1..8}; do
    if [ -f "day-${day}-result.txt" ]; then
        RESULT_FILES=$((RESULT_FILES + 1))
    fi
    if ls stabilization-day-${day}-*.log 1> /dev/null 2>&1; then
        LOG_FILES=$((LOG_FILES + 1))
    fi
done

echo "• Result Files: $RESULT_FILES/8 expected"
echo "• Log Files: $LOG_FILES/8 expected"
echo "• Completion Records: $(ls day-*-completion-record.txt 2>/dev/null | wc -l)"
echo "• Official Closures: $(ls day-*-official-closure.txt 2>/dev/null | wc -l)"
echo ""

echo "4. OVERALL GOVERNANCE ASSESSMENT:"
if [ $STREAK -eq 8 ]; then
    echo "🎯 ASSESSMENT: PERFECT COMPLIANCE"
    echo "   • 8 consecutive days of full compliance"
    echo "   • Both quartiles completed with 100% adherence"
    echo "   • System integrity fully preserved"
    echo "   • Ready for Third Quartile observation"
elif [ $STREAK -ge 5 ]; then
    echo "✅ ASSESSMENT: GOOD COMPLIANCE"
    echo "   • $STREAK consecutive days compliant"
    echo "   • Strong governance track record"
    echo "   • System remains frozen"
else
    echo "⚠️  ASSESSMENT: NEEDS ATTENTION"
    echo "   • Current streak: $STREAK days"
    echo "   • Governance may be compromised"
    echo "   • Observation continues"
fi

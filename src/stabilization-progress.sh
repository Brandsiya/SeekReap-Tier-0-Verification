#!/bin/bash
echo "=== PHASE 2 STABILIZATION PROGRESS ==="
echo "Current Date: $(date -u '+%Y-%m-%d')"
echo "Current Time: $(date -u '+%H:%M:%S UTC')"
echo "Quartile: Second (Days 5-8)"
echo ""

# Calculate completed days
COMPLETED_DAYS=0
for day in {1..14}; do
    if [ -f "day-${day}-result.txt" ] && grep -q "PASS" "day-${day}-result.txt"; then
        COMPLETED_DAYS=$day
    else
        break
    fi
done

echo "Progress Tracker:"
echo "Day   1  2  3  4  5  6  7  8  9 10 11 12 13 14"
echo -n "      "

for day in {1..14}; do
    if [ $day -le $COMPLETED_DAYS ]; then
        echo -n "✅ "
    elif [ $day -eq $((COMPLETED_DAYS + 1)) ]; then
        echo -n "▶️  "
    else
        echo -n "□ "
    fi
done

echo ""
echo ""
echo "Completed: $COMPLETED_DAYS/14 days"
echo "Remaining: $((14 - COMPLETED_DAYS)) days"
echo "Progress: $(awk "BEGIN {printf \"%.1f\", ($COMPLETED_DAYS/14)*100}")%"

# Quartile tracking
if [ $COMPLETED_DAYS -le 4 ]; then
    echo "Quartile: First (Days 1-4)"
elif [ $COMPLETED_DAYS -le 8 ]; then
    echo "Quartile: Second (Days 5-8)"
    QUARTILE_PROGRESS=$((COMPLETED_DAYS - 4))
    echo "Second quartile progress: $QUARTILE_PROGRESS/4 days"
elif [ $COMPLETED_DAYS -le 12 ]; then
    echo "Quartile: Third (Days 9-12)"
else
    echo "Quartile: Final (Days 13-14)"
fi

if [ $COMPLETED_DAYS -eq 14 ]; then
    echo "🎉 STABILIZATION COMPLETE - READY FOR PHASE 3"
elif [ $COMPLETED_DAYS -gt 0 ]; then
    echo "Status: ON TRACK"
    echo "Streak: $COMPLETED_DAYS consecutive passes"
    
    # Trend indicator
    if [ $COMPLETED_DAYS -ge 5 ]; then
        echo "Trend: 📈 Excellent (5+ days)"
    elif [ $COMPLETED_DAYS -ge 3 ]; then
        echo "Trend: → Stable"
    fi
else
    echo "Status: NOT STARTED OR RESET"
fi

echo ""
echo "Validation Artifacts:"
RESULT_FILES=$(ls day-*-result.txt 2>/dev/null | wc -l)
LOG_FILES=$(ls stabilization-*.log 2>/dev/null | wc -l)
echo "Result files: $RESULT_FILES"
echo "Log files: $LOG_FILES"

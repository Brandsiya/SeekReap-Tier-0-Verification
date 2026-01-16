#!/bin/bash
# DAILY PHASE 2 STABILIZATION CHECK

DAY=$1
DATE=$(date -u '+%Y-%m-%d')
LOG_FILE="stabilization-day-${DAY}-${DATE}.log"

echo "=== PHASE 2 STABILIZATION - DAY ${DAY} ===" > $LOG_FILE
echo "Date: $DATE" >> $LOG_FILE
echo "Time: $(date -u '+%H:%M:%S UTC')" >> $LOG_FILE
echo "" >> $LOG_FILE

echo "1. Running core validation test..." >> $LOG_FILE
echo "--------------------------------" >> $LOG_FILE

# Run the validation test
START_TIME=$(date +%s)
timeout 30s node test-week4-notifications.cjs >> $LOG_FILE 2>&1
EXIT_CODE=$?
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "" >> $LOG_FILE
echo "2. Test Results:" >> $LOG_FILE
echo "--------------------------------" >> $LOG_FILE

# Check for success indicators
SUCCESS_INDICATORS=0
if grep -q "Test Complete" $LOG_FILE; then
    echo "✅ Test completed successfully" >> $LOG_FILE
    SUCCESS_INDICATORS=$((SUCCESS_INDICATORS + 1))
else
    echo "❌ 'Test Complete' message not found" >> $LOG_FILE
fi

if grep -q "SMS Sent:" $LOG_FILE; then
    SMS_COUNT=$(grep -o "SMS Sent: [0-9]*" $LOG_FILE | head -1 | grep -o "[0-9]*")
    echo "✅ SMS notifications sent: $SMS_COUNT" >> $LOG_FILE
    SUCCESS_INDICATORS=$((SUCCESS_INDICATORS + 1))
fi

if grep -q "Emails Sent:" $LOG_FILE; then
    EMAIL_COUNT=$(grep -o "Emails Sent: [0-9]*" $LOG_FILE | head -1 | grep -o "[0-9]*")
    echo "✅ Email notifications sent: $EMAIL_COUNT" >> $LOG_FILE
    SUCCESS_INDICATORS=$((SUCCESS_INDICATORS + 1))
fi

echo "" >> $LOG_FILE
echo "3. Summary:" >> $LOG_FILE
echo "--------------------------------" >> $LOG_FILE
echo "Exit Code: $EXIT_CODE" >> $LOG_FILE
echo "Duration: ${DURATION}s" >> $LOG_FILE
echo "Success Indicators: ${SUCCESS_INDICATORS}/3" >> $LOG_FILE
echo "" >> $LOG_FILE

# Determine overall status
if [ $EXIT_CODE -eq 0 ] && [ $SUCCESS_INDICATORS -ge 2 ]; then
    echo "STATUS: ✅ PASS - Day ${DAY} stabilization maintained" >> $LOG_FILE
    echo "Day ${DAY} Result: PASS" > "day-${DAY}-result.txt"
    
    # Display success summary
    echo ""
    echo "=== DAY ${DAY} VALIDATION SUCCESS ==="
    echo "✅ All systems operational"
    echo "✅ Test completed in ${DURATION}s"
    echo "✅ ${SMS_COUNT:-0} SMS, ${EMAIL_COUNT:-0} Email notifications"
    echo "✅ Stabilization maintained"
    
else
    echo "STATUS: ❌ FAIL - Stabilization breach detected" >> $LOG_FILE
    echo "Day ${DAY} Result: FAIL" > "day-${DAY}-result.txt"
    
    echo ""
    echo "=== DAY ${DAY} VALIDATION FAILURE ==="
    echo "❌ Stabilization breach detected"
    echo "Check $LOG_FILE for details"
    exit 1
fi

echo "" >> $LOG_FILE
echo "=== END OF DAY ${DAY} VALIDATION ===" >> $LOG_FILE

# Display log tail
echo ""
echo "Log file: $LOG_FILE"
echo "Last 10 lines:"
tail -10 $LOG_FILE

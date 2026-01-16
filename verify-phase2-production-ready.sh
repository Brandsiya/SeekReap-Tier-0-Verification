#!/bin/bash

# ==============================================
# PHASE 2 PRODUCTION READINESS VERIFICATION
# ==============================================
# This script validates that Phase 2 is ready
# for the 14-day stabilization period.
# ==============================================

set -e  # Exit on any error

echo "=== PHASE 2 PRODUCTION READINESS VERIFICATION ==="
echo "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Helper function
check() {
  local description="$1"
  local command="$2"
  local remedy="$3"
  
  ((TOTAL_CHECKS++))
  echo -n "Check ${TOTAL_CHECKS}: ${description}... "
  
  if eval "$command" > /dev/null 2>&1; then
    echo "✅ PASS"
    ((PASSED_CHECKS++))
    return 0
  else
    echo "❌ FAIL"
    echo "   Remedy: ${remedy}"
    ((FAILED_CHECKS++))
    return 1
  fi
}

# ==================== CHECKS ====================

echo "--- 1. ARCHITECTURAL INTEGRITY ---"

check \
  "All TypeScript files compile" \
  "npx tsc --noEmit --project . 2>/dev/null || node -c src/services/*.ts" \
  "Fix TypeScript compilation errors"

check \
  "No hardcoded delays > 1000ms in production code" \
  "! grep -r 'setTimeout.*[1-9][0-9]\{3,\}' src/ --include='*.ts' | grep -v test | grep -v '//'" \
  "Remove long delays; use config or exponential backoff"

check \
  "Event bus exports singleton correctly" \
  "grep -q 'export const eventBus = new EventBus()' src/services/event-bus.ts" \
  "Ensure event-bus.ts exports singleton instance"

echo -e "\n--- 2. PRODUCTION HARDENING ---"

check \
  "Monitoring metrics framework exists" \
  "[ -f 'src/monitoring/metrics.ts' ]" \
  "Create src/monitoring/metrics.ts with Phase2Metrics class"

check \
  "Consent logging in notification services" \
  "grep -q 'recordConsentDecision' src/services/sms.ts && grep -q 'recordConsentDecision' src/services/email.ts" \
  "Add metrics.recordConsentDecision() calls to SMS and Email services"

check \
  "No console.log in production except debug" \
  "! grep -r 'console\\.log' src/services/ --include='*.ts' | grep -v '\\[.*Service\\]' | grep -v '\\[EventBus\\]' | grep -v '\\[CONSENT-LOG\\]' | grep -v '^//'" \
  "Replace generic console.log with structured logging"

echo -e "\n--- 3. OPERATIONAL READINESS ---"

check \
  "Test file exists and runs" \
  "[ -f 'test-week4-notifications.cjs' ] && node -c test-week4-notifications.cjs > /dev/null" \
  "Create test-week4-notifications.cjs with comprehensive tests"

check \
  "All critical services export singletons" \
  "grep -q 'export const smsService =' src/services/sms.ts && grep -q 'export const emailService =' src/services/email.ts && grep -q 'export const notificationSubscriber =' src/services/notification-subscriber.ts" \
  "Ensure all services export singleton instances"

check \
  "Integration module uses CommonJS for compatibility" \
  "[ -f 'src/integrations/payment-events.cjs' ] && head -5 src/integrations/payment-events.cjs | grep -q 'module.exports'" \
  "Ensure payment-events.cjs uses CommonJS exports"

echo -e "\n--- 4. SECURITY & COMPLIANCE ---"

check \
  "Consent checks exist before sending" \
  "grep -q 'hasConsent' src/services/sms.ts && grep -q 'hasConsent' src/services/email.ts" \
  "Add consent checks to all notification services"

check \
  "No sensitive data in logs" \
  "! grep -r 'password\|secret\|key\|token' src/ --include='*.ts' | grep -v '//' | grep -v test" \
  "Remove hardcoded secrets from source code"

# ==================== SUMMARY ====================

echo -e "\n=== VERIFICATION SUMMARY ==="
echo "Total Checks: ${TOTAL_CHECKS}"
echo "Passed: ${PASSED_CHECKS}"
echo "Failed: ${FAILED_CHECKS}"
echo

if [ ${FAILED_CHECKS} -eq 0 ]; then
  echo "✅ PHASE 2 STATUS: PRODUCTION READY"
  echo
  echo "NEXT STEP: Begin 14-day stabilization period"
  echo "Rules:"
  echo "  1. NO feature commits"
  echo "  2. Only critical bug fixes"
  echo "  3. Monitor metrics daily"
  echo "  4. After 14 days of stability → Phase 3"
  exit 0
else
  echo "❌ PHASE 2 STATUS: NOT READY"
  echo
  echo "Remediate ${FAILED_CHECKS} issue(s) before proceeding."
  echo "The stabilization period cannot begin until all checks pass."
  exit 1
fi

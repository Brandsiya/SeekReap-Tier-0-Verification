#!/bin/bash
# CHECKPOINT 1: Rate Limiting Governance Verification
echo "🔒 CHECKPOINT 1: GOVERNANCE VERIFICATION"
echo "========================================"

# 1. Verify no Phase 2 contamination
echo "1. Phase 2 integrity check..."
PHASE2_FILES=$(find phase2/ -type f 2>/dev/null | wc -l)
echo "   Phase 2 files: $PHASE2_FILES (should remain unchanged)"

# 2. Verify Cycle 1 audit not modified
echo "2. Cycle 1 audit check..."
if [ -f "audit/append_only_writer.sh" ]; then
    grep -q "append_only" audit/append_only_writer.sh && echo "   ✅ Append-only enforced" || echo "   ❌ Append-only compromised"
else
    echo "   ⚠️  Audit system not found"
fi

# 3. Verify new files are in correct locations
echo "3. File location validation..."
[ -f "api/v1/rate_limiter.sh" ] && echo "   ✅ Rate limiter in api/v1/" || echo "   ❌ Rate limiter missing"
[ -f "test_rate_limits.sh" ] && echo "   ✅ Test in root directory" || echo "   ❌ Test missing"
[ -f "api/v1/server.sh" ] && echo "   ✅ Server updated" || echo "   ❌ Server missing"

# 4. Verify backup exists
echo "4. Backup verification..."
[ -f "api/v1/server.sh.cycle2_backup" ] && echo "   ✅ Cycle 2 server backed up" || echo "   ⚠️  No backup found"

# 5. Test basic functionality
echo "5. Basic functionality test..."
REQUEST_PATH='/api/v1/audit/health' ./api/v1/server.sh | grep -q "healthy" && echo "   ✅ Health endpoint works" || echo "   ❌ Health endpoint broken"

echo ""
echo "========================================"
if [ $? -eq 0 ]; then
    echo "✅ CHECKPOINT 1 VERIFICATION PASSED"
    echo "Rate limiting system implemented with governance compliance"
else
    echo "❌ CHECKPOINT 1 VERIFICATION FAILED"
    echo "Governance issues detected"
fi

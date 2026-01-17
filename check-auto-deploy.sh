#!/bin/bash
# Auto-deploy verification script
echo "🔄 Checking Platform Unity Status..."
echo "==================================="

# Check Render service
echo "1. Render Service:"
RENDER_URL="https://seekreap-tier-0-verification.onrender.com"
if curl -s -f "$RENDER_URL/api/health" >/dev/null; then
    echo "   ✅ Live at: $RENDER_URL"
else
    echo "   ❌ Service down"
fi

# Check GitHub
echo "2. GitHub Repository:"
GITHUB_URL="https://github.com/Brandsiya/SeekReap-Tier-0-Verification"
if curl -s -f "$GITHUB_URL" >/dev/null; then
    echo "   ✅ Accessible at: $GITHUB_URL"
else
    echo "   ❌ Cannot access"
fi

# Check Replit
echo "3. Replit (if imported):"
REPLIT_URL="https://replit.com/@siyasamkela118/SeekReap-Tier-0-Verification"
echo "   🔗 URL: $REPLIT_URL"
echo "   📝 Note: Check if auto-pull works on open"

echo ""
echo "🎯 AUTO-DEPLOY VERIFICATION:"
echo "============================"
echo "Go to Render Events tab NOW:"
echo "https://dashboard.render.com/web/srv-d5lacpcoud1c73dm5asg"
echo ""
echo "Expected: New deployment triggered by GitHub push"
echo "Actual: ??? (Check dashboard now!)"

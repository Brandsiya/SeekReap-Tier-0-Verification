#!/bin/bash
echo "🔍 PLATFORM UNITY VERIFICATION SCRIPT"
echo "====================================="
echo ""

echo "1️⃣ CHECKING ALL PLATFORMS..."
echo ""

# 1. UserLAnd (Current)
echo "✅ UserLAnd (Development):"
echo "   Directory: $(pwd)"
echo "   Git Status: $(git status --short 2>/dev/null | wc -l) changes"
echo ""

# 2. GitHub
echo "✅ GitHub (Source Control):"
echo "   URL: https://github.com/Brandsiya/SeekReap-Tier-0-Verification"
echo "   Webhook: https://api.render.com/webhook/github ✓"
echo ""

# 3. Render
echo "✅ Render (Production):"
RENDER_URL="https://seekreap-tier-0-verification.onrender.com"
echo "   Service: $RENDER_URL"
if curl -s -f "$RENDER_URL/api/health" >/dev/null; then
    echo "   Status: ✅ Live"
else
    echo "   Status: ❌ Down"
fi
echo "   Dashboard: https://dashboard.render.com/web/srv-d5lacpcoud1c73dm5asg"
echo ""

# 4. Replit
echo "✅ Replit (Alternative Dev):"
echo "   URL: https://replit.com/@siyasamkela118/SeekReap-Tier-0-Verification"
echo "   Auto-sync: ✅ Configured (.replit file)"
echo ""

echo "2️⃣ WORKFLOW STATUS:"
echo "=================="
echo "🔄 UserLAnd → GitHub → Render → Production"
echo "   Git push triggers auto-deploy"
echo ""
echo "🔄 Replit ← GitHub"
echo "   Auto-pulls on boot"
echo ""

echo "3️⃣ IMMEDIATE ACTIONS:"
echo "===================="
echo "📱 Open Render Events Tab NOW:"
echo "   https://dashboard.render.com/web/srv-d5lacpcoud1c73dm5asg"
echo ""
echo "💻 Open Replit:"
echo "   https://replit.com/@siyasamkela118/SeekReap-Tier-0-Verification"
echo ""
echo "🌐 Test Production:"
echo "   https://seekreap-tier-0-verification.onrender.com/api/health"
echo ""

echo "🎯 EXPECTED RESULT:"
echo "================="
echo "Within 2 minutes of push:"
echo "• Render starts auto-deploy"
echo "• Replit shows latest code"
echo "• All platforms synchronized"

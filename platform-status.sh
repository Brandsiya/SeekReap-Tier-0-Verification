#!/bin/bash
# platform-status.sh - Check status of all platforms

echo "🌍 MULTI-PLATFORM STATUS CHECK"
echo "=============================="

cd ~/SeekReap-Tier-0-Verification

echo ""
echo "👤 USERLAND (Development):"
echo "   📍 $(pwd)"
echo "   🔧 Node: $(node --version)"
echo "   📦 NPM: $(npm --version)"
echo "   📝 Latest commit: $(git log -1 --pretty=format:'%h - %s (%cr)')"

echo ""
echo "⚡ REPLIT (Web IDE):"
echo "   Status: $(curl -s -I https://replit.com/@Brandsiya/SeekReap-Tier-0 2>/dev/null | head -1 | cut -d' ' -f2-)"
echo "   Issue: Might be on 'main' instead of 'master' branch"
echo "   Fix: Run 'git checkout master && git pull origin master' in Replit"

echo ""
echo "🌐 RENDER (Production):"
echo "   URL: https://seekreap-tier0-verification.onrender.com"
echo "   Status: $(curl -s -I https://seekreap-tier0-verification.onrender.com 2>/dev/null | head -1 || echo '⚠️ 404 - Needs fix')"
echo "   Dashboard: https://dashboard.render.com/web/srv-d5lacpcoud1c73dm5asg"

echo ""
echo "🚀 ACTION REQUIRED:"
echo "   1. ⚡ Fix Replit branch (run commands above in Replit)"
echo "   2. 🌐 Fix Render config (run the fix script above in UserLand)"
echo "   3. 👤 Continue developing in UserLand"

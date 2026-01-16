#!/bin/bash
echo "🔧 COMPREHENSIVE DIAGNOSTIC REPORT"
echo "================================="
date
echo ""

echo "1. 🏠 USERLAND LOCAL:"
echo "   Directory: $(pwd)"
echo "   Files: $(ls -1 | wc -l) total"
ls -1
echo ""

echo "2. 📦 PACKAGE.JSON:"
cat package.json | head -20
echo ""

echo "3. 🔗 GITHUB STATUS:"
echo "   Branch: $(git branch --show-current)"
echo "   Commit: $(git log -1 --pretty=format:'%h - %s')"
echo "   Remote: $(git remote -v | head -1)"
echo ""

echo "4. 🧪 LOCAL TESTS:"
node cli.js --version
node cli.js verify examples/basic/basic-policy.json 2>&1 | tail -3
echo ""

echo "5. 🌐 RENDER CHECK:"
echo "   URL: https://seekreap-tier0-verification.onrender.com"
echo "   Response: $(curl -s -I https://seekreap-tier0-verification.onrender.com 2>/dev/null | head -1 || echo 'NO RESPONSE')"
echo "   Dashboard: https://dashboard.render.com/web/srv-d5lacpcoud1c73dm5asg"
echo ""

echo "6. ⚡ REPLIT CHECK:"
echo "   Workspace: https://replit.com/@Brandsiya/SeekReap-Tier-0"
echo "   Status: Needs manual fix (branch issue)"
echo ""

echo "🚨 URGENT ACTIONS:"
echo "   1. 🌐 Check Render Dashboard for errors"
echo "   2. ⚡ Fix Replit workspace"
echo "   3. 👤 Deploy fix from UserLand"

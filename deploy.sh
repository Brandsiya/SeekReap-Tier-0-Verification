#!/bin/bash
# deploy.sh - One-command deployment to all platforms

echo "🚀 SEEKREAP UNIFIED DEPLOYMENT"
echo "================================"
echo "Targets: GitHub → Replit → Render.com"
echo ""

# Get commit message
if [ -z "$1" ]; then
    echo "📝 Enter commit message:"
    read commit_msg
else
    commit_msg="$1"
fi

# Step 1: Push to GitHub
echo "1. 📤 Pushing to GitHub..."
git add .
git commit -m "$commit_msg"
git push origin master  # FIXED: Changed 'main' to 'master'

echo ""
echo "✅ Code pushed to GitHub"
echo ""
echo "2. 🚀 Triggering deployments..."
echo "   • Replit: Will auto-pull on next run"
echo "   • Render.com: Auto-deploy triggered"
echo ""
echo "3. 🌐 Deployment URLs:"
echo "   • Replit: Workspace will update"
echo "   • Render: https://seekreap-tier0-verification.onrender.com"
echo ""
echo "🎯 DEPLOYMENT INITIATED!"
echo "Check:"
echo "• GitHub: https://github.com/Brandsiya/SeekReap-Tier-0-Verification"
echo "• Render Dashboard: https://dashboard.render.com"

#!/bin/bash
echo "🚀 FIXING GIT AND PUSHING"
echo "========================"
echo "Directory: $(pwd)"
echo ""

# Initialize if needed
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git config user.email "tier0@seekreap.com"
    git config user.name "SeekReap Tier 0"
fi

# Add all files
echo "Adding files..."
git add .

# Commit
echo "Committing..."
git commit -m "Deploy: SeekReap Tier 0 Verification (OSS Pilot)" || echo "Already committed"

# Add remote
echo ""
echo "Adding GitHub remote..."
GITHUB_URL="https://github.com/Brandsiya/SeekReap-Tier-0-Verification.git"
git remote remove origin 2>/dev/null
git remote add origin "$GITHUB_URL"
echo "Remote: $GITHUB_URL"

# Push
echo ""
echo "Pushing to GitHub..."
if git push -u origin main 2>/dev/null; then
    echo "✅ Success! Pushed to GitHub"
    echo "Visit: https://github.com/Brandsiya/SeekReap-Tier-0-Verification"
else
    echo "⚠️  Standard push failed, creating main branch..."
    git branch -M main 2>/dev/null || git checkout -b main
    echo "Force pushing..."
    git push -u origin main --force
    echo "✅ Force push completed"
fi

echo ""
echo "🎯 Next: Import to Replit from GitHub"

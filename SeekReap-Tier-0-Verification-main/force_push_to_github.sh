#!/bin/bash
echo "💪 FORCE PUSH TO GITHUB"
echo "======================"
echo ""
echo "Use this if GitHub repo has existing files"
echo ""

read -p "GitHub URL: " github_url

if [ -n "$github_url" ]; then
    echo "Adding remote..."
    git remote add origin "$github_url" 2>/dev/null || git remote set-url origin "$github_url"
    
    echo "Pulling first (to merge if needed)..."
    git pull origin main --allow-unrelated-histories || echo "Pull failed, will force push"
    
    echo "Force pushing..."
    git push -u origin main --force
    
    echo ""
    echo "✅ Force push attempted"
    echo "Check GitHub: $github_url"
fi

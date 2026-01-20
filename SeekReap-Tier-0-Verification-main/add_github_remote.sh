#!/bin/bash
echo "🔗 ADDING GITHUB REMOTE"
echo "======================="
echo ""
echo "Enter your GitHub repository URL"
echo "Format: https://github.com/username/seekreap-tier0-verification.git"
echo ""
read -p "GitHub URL: " github_url

if [ -n "$github_url" ]; then
    echo ""
    echo "Adding remote: origin -> $github_url"
    git remote add origin "$github_url" 2>/dev/null || git remote set-url origin "$github_url"
    
    echo "Pushing to GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Pushed to GitHub"
        echo "Repository: $github_url"
        echo ""
        echo "📋 NEXT STEP:"
        echo "Go to Replit and:"
        echo "1. Click 'Create' → 'Import from GitHub'"
        echo "2. Find 'seekreap-tier0-verification'"
        echo "3. Click 'Import'"
    else
        echo ""
        echo "❌ Push failed. Possible issues:"
        echo "- Invalid URL"
        echo "- No permissions"
        echo "- Repository doesn't exist"
        echo "- Need to pull first (if repo has files)"
    fi
else
    echo "❌ No URL provided"
fi

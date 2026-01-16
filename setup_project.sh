#!/bin/bash
echo "🎯 PROJECT SETUP SCRIPT"
echo "======================"

# Find package.json
PKG_FILE=$(find . -name "package.json" -type f 2>/dev/null | head -1)
if [ -n "$PKG_FILE" ]; then
    echo "✅ Found package.json at: $PKG_FILE"
    PKG_DIR=$(dirname "$PKG_FILE")
    
    if [ "$PKG_DIR" != "." ]; then
        echo "📂 Changing to directory: $PKG_DIR"
        cd "$PKG_DIR"
    fi
    
    # Now setup
    echo ""
    echo "🛠️ SETTING UP IN: $(pwd)"
    echo "Files found:"
    ls -la *.md *.sh package.json 2>/dev/null
    
    # Make scripts executable
    chmod +x *.sh 2>/dev/null
    
    # Install dependencies
    echo ""
    echo "📦 INSTALLING DEPENDENCIES..."
    npm install
    
    # Run verification
    echo ""
    echo "✅ RUNNING VERIFICATION..."
    ./verify_update.sh 2>/dev/null || echo "Run: chmod +x verify_update.sh"
else
    echo "❌ package.json not found!"
    echo "Current directory: $(pwd)"
    echo "Files here:"
    ls -la
    echo ""
    echo "🔍 Searching for project files..."
    find . -type f \( -name "*.md" -o -name "*.sh" \) 2>/dev/null | head -10
fi

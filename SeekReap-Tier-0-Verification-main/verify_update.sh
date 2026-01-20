#!/bin/bash
echo "=== ORGANIZATION NAME UPDATE VERIFICATION ==="
echo ""
echo "Current directory: $(pwd)"
echo ""
echo "1. Checking MASTER_INDEX.md:"
echo "----------------------------"
if [ -f "MASTER_INDEX.md" ]; then
    echo "File exists"
    grep -i "seekreap" MASTER_INDEX.md || echo "No SeekReap found"
else
    echo "File not found"
fi
echo ""
echo "2. Checking TIER0_OVERVIEW.md:"
echo "-------------------------------"
if [ -f "TIER0_OVERVIEW.md" ]; then
    echo "File exists"
    head -3 TIER0_OVERVIEW.md
else
    echo "File not found"
fi
echo ""
echo "3. Checking package.json:"
echo "-------------------------"
if [ -f "package.json" ]; then
    echo "File exists"
    grep -E '"name"|"description"' package.json
else
    echo "File not found"
fi
echo ""
echo "4. Checking for placeholders:"
echo "----------------------------"
echo "Looking for 'your-organization' variations..."
grep -r -i "your-organization\|your.organization\|YOUR_ORGANIZATION" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null | grep -v ".bash_history" | grep -v "ORGANIZATION_UPDATE" || echo "✅ No placeholders found"
echo ""
echo "=== VERIFICATION COMPLETE ==="

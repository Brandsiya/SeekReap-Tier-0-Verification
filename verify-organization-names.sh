#!/bin/bash
echo "=== ORGANIZATION NAME VERIFICATION ==="
echo ""

echo "1. Checking for remaining placeholders:"
echo "---------------------------------------"
grep -r -i "your.organization\|your-organization\|YOUR_ORGANIZATION" . --exclude-dir=node_modules 2>/dev/null | grep -v "verify-organization-names.sh"
if [ $? -eq 0 ]; then
    echo "❌ Placeholders still found!"
else
    echo "✅ No placeholders found"
fi
echo ""

echo "2. Checking SeekReap references:"
echo "--------------------------------"
grep -r -i "seekreap\|SeekReap" . --exclude-dir=node_modules 2>/dev/null | head -20
echo ""

echo "3. Documentation consistency check:"
echo "----------------------------------"
echo "Tier 0 name should appear as: SeekReap Tier 0 Verification (OSS Pilot)"
grep -r "Tier 0 Verification" *.md examples/*.md 2>/dev/null | head -5
echo ""

echo "4. Package.json verification:"
echo "-----------------------------"
grep -A2 -B2 "seekreap" package.json
echo ""

echo "=== VERIFICATION COMPLETE ==="

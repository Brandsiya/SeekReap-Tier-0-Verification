#!/bin/bash
echo "=== OFFICIAL NAME VERIFICATION ==="
echo ""
echo "SeekReap Tier 0 Verification (OSS Pilot)"
echo "----------------------------------------"
echo ""
echo "Checking for full official name usage:"
echo ""
echo "1. MASTER_INDEX.md:"
grep -n "SeekReap Tier 0" MASTER_INDEX.md || echo "Not found"
echo ""
echo "2. TIER0_OVERVIEW.md:"
grep -n "SeekReap Tier 0" TIER0_OVERVIEW.md | head -5 || echo "Not found"
echo ""
echo "3. Other documentation:"
for file in *.md; do
    if [ "$file" != "MASTER_INDEX.md" ] && [ "$file" != "TIER0_OVERVIEW.md" ]; then
        if grep -q "SeekReap" "$file"; then
            echo "- $file: Contains SeekReap references"
        fi
    fi
done
echo ""
echo "=== VERIFICATION COMPLETE ==="

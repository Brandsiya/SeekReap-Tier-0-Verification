#!/bin/bash
echo "📝 RENAMING TO 'SEEKREAP'"
echo "========================="

# Files to update
FILES_TO_UPDATE=(
  "package.json"
  "MASTER_INDEX.md"
  "README.md"
  "TIER0_OVERVIEW.md"
  "TIER0_POSITIONING.md"
  "TIER0_QUICKSTART.md"
  "TIER0_CLI_REFERENCE.md"
  "SETUP.md"
  "TIER_BOUNDARY_CONTRACT.md"
  "ORGANIZATION_UPDATE_SUMMARY.md"
  "verify_update.sh"
  "verify-organization-names.sh"
  "dist/cli.js"
  "src/"*.js
  "examples/"*.json
  "tests/"*.js
)

echo "Updating files..."
for file in "${FILES_TO_UPDATE[@]}"; do
  if [ -f "$file" ] || [ -d "$file" ]; then
    echo "Processing: $file"
    # Replace with different variations
    find "$file" -type f -name "*.md" -o -name "*.json" -o -name "*.js" -o -name "*.sh" 2>/dev/null | while read -r f; do
      # Save original
      cp "$f" "$f.bak"
      
      # Replace full name with just SeekReap
      sed -i 's/SeekReap Tier 0 Verification (OSS Pilot)/SeekReap/g' "$f"
      sed -i 's/SeekReap Tier 0 Verification/SeekReap/g' "$f"
      sed -i 's/seekreap-tier0-verification/seekreap/g' "$f"
      
      echo "  Updated: $f"
    done
  fi
done

echo ""
echo "✅ Rename complete!"
echo "New organization name: SeekReap"

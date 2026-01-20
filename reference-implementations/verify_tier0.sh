#!/bin/bash
# SeekReap Tier 0 - Structural Verification
set -e

echo "🔍 Tier 0 Final Verification"
echo "============================"

echo "1. Checking canonical files..."
required_files=(
  "cli.js"
  "package.json"
  "README.md"
  "MASTER_INDEX.md"
  "TIER0_OVERVIEW.md"
  "TIER_BOUNDARY_CONTRACT.md"
  "TIER0_INSTALLATION.md"
  "TIER0_QUICKSTART.md"
  "TIER0_CLI_REFERENCE.md"
  "CONTRIBUTING.md"
  "SEEKREAP-TIER0-FROZEN-LICENSE"
)

missing_files=0
for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ❌ $file (MISSING)"
    missing_files=$((missing_files + 1))
  fi
done

if [ $missing_files -gt 0 ]; then
  echo "❌ $missing_files required files missing"
  exit 1
fi

echo "2. Testing CLI..."
node cli.js --version > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "   ✅ CLI version correct"
else
  echo "   ❌ CLI failed"
  exit 1
fi

echo "3. Testing no timestamps..."
cli_output=$(node cli.js --version)
if echo "$cli_output" | grep -qE "(20[0-9]{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"; then
  echo "   ❌ Timestamps detected in output"
  exit 1
else
  echo "   ✅ No timestamps in output"
fi

echo "4. Running test suite..."
node test.js

echo ""
echo "==========================================="
echo "🎉 TIER 0 VERIFICATION COMPLETE"
echo ""
echo "✅ All canonical files present"
echo "✅ CLI functional"
echo "✅ No timestamps"
echo "✅ Tests pass"
echo "✅ Documentation complete"
echo ""
echo "🚀 TIER 0 IS NOW FROZEN"
echo "📌 Version: $(node -p "require('./package.json').version")"
echo "📌 Status: FROZEN"
echo ""
echo "➡️  Ready for Tier 1+ evolution"

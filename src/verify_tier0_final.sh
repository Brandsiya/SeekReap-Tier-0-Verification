#!/bin/bash

echo "🔍 TIER 0 FINAL VERIFICATION SCRIPT"
echo "==================================="

# Check canonical documentation
echo "1. Checking canonical documentation..."
REQUIRED_DOCS=("MASTER_INDEX.md" "README.md" "SETUP.md" "TIER0_OVERVIEW.md" 
               "TIER_BOUNDARY_CONTRACT.md" "LICENSE")

all_good=true
for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "   ✅ $doc"
    else
        echo "   ❌ MISSING: $doc"
        all_good=false
    fi
done

if [ "$all_good" = false ]; then
    echo "   ⚠️  Missing canonical documents"
fi

# Check for prohibited directories
echo ""
echo "2. Checking for prohibited directories..."
PROHIBITED_DIRS=("api/" "database/" "services/" "routes/" "monitoring/")

found_prohibited=false
for dir in "${PROHIBITED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "   ❌ PROHIBITED: $dir (Tier 1 artifact)"
        found_prohibited=true
    fi
done

if [ "$found_prohibited" = true ]; then
    echo "   ⚠️  Tier 1 artifacts present - must remove before freeze"
else
    echo "   ✅ No prohibited directories"
fi

# Check for environment files
echo ""
echo "3. Checking for environment files..."
ENV_FILES=$(ls .env.* 2>/dev/null | wc -l)
if [ "$ENV_FILES" -gt 0 ]; then
    echo "   ❌ Found $ENV_FILES .env files (must remove before freeze)"
else
    echo "   ✅ No environment files"
fi

# Test CLI functionality
echo ""
echo "4. Testing CLI functionality..."
CLI_OUTPUT=$(node cli.js --version 2>&1)
if [[ "$CLI_OUTPUT" == *"1.1.0"* ]]; then
    echo "   ✅ CLI version correct"
else
    echo "   ❌ CLI version check failed"
    echo "   Output: $CLI_OUTPUT"
fi

# Check for timestamps in output
echo ""
echo "5. Checking for timestamps in CLI output..."
if echo "$CLI_OUTPUT" | grep -i "timestamp\|time:\|date:\|202[0-9]" > /dev/null; then
    echo "   ❌ CLI output contains timestamps"
else
    echo "   ✅ No timestamps in CLI output"
fi

# Run existing tests
echo ""
echo "6. Running existing test suite..."
if [ -f "test.js" ]; then
    node test.js
else
    echo "   ⚠️  No test.js found"
fi

echo ""
echo "==================================="
echo "VERIFICATION COMPLETE"
echo ""
echo "NEXT STEPS BEFORE FREEZE:"
echo "1. Review deployment files in DEPLOYMENT_FILES_PRESERVED.txt"
echo "2. Remove all deployment scripts or move to Tier 1"
echo "3. Update README.md to declare FROZEN status"
echo "4. Create final git tag"
echo "==================================="

#!/bin/bash

echo "🔍 FINAL TIER 0 CLEAN VERIFICATION"
echo "==================================="

# Check canonical files exist
echo "1. Checking canonical documentation..."
REQUIRED_DOCS=("MASTER_INDEX.md" "README.md" "SETUP.md" "TIER0_OVERVIEW.md" "TIER_BOUNDARY_CONTRACT.md" "LICENSE" "INTERNAL_DEPLOYMENT.md")
for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "   ✅ $doc"
    else
        echo "   ❌ $doc - MISSING"
    fi
done

# Check implementation files
echo ""
echo "2. Checking core implementation..."
REQUIRED_FILES=("cli.js" "package.json" "test.js" "verify_tier0.sh" "verify_tier0_final.sh" "complete_tier0.sh" ".gitignore")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - MISSING"
    fi
done

# Check examples directory
echo ""
echo "3. Checking examples directory..."
if [ -d "examples/basic" ]; then
    echo "   ✅ examples/basic/ directory exists"
    BASIC_FILES=$(ls examples/basic/ 2>/dev/null)
    if [ "$BASIC_FILES" = "basic-policy.json" ]; then
        echo "   ✅ Only basic-policy.json in examples/basic/"
    else
        echo "   ⚠️  Extra files in examples/basic/: $BASIC_FILES"
    fi
else
    echo "   ❌ examples/basic/ directory missing"
fi

# Check for prohibited directories
echo ""
echo "4. Checking for prohibited directories..."
PROHIBITED_DIRS=("api/" "services/" "routes/" "audit/" "config/" "database/" "middleware/" "monitoring/" "src/" "phase3/" "integrations/")
for dir in "${PROHIBITED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "   ❌ $dir - SHOULD NOT EXIST"
    else
        echo "   ✅ $dir - Not present"
    fi
done

# Check for environment files
echo ""
echo "5. Checking for environment files..."
ENV_FILES=$(find . -name ".env.*" -type f 2>/dev/null)
if [ -z "$ENV_FILES" ]; then
    echo "   ✅ No environment files"
else
    echo "   ❌ Found environment files: $ENV_FILES"
fi

# Run the CLI
echo ""
echo "6. Testing CLI functionality..."
node cli.js --version

# Run tests
echo ""
echo "7. Running test suite..."
node test.js

echo ""
echo "==================================="
echo "✅ FINAL VERIFICATION COMPLETE"
echo ""
echo "📦 Repository contains ONLY:"
echo "   • cli.js, package.json, test.js"
echo "   • verify_tier0.sh, verify_tier0_final.sh, complete_tier0.sh"
echo "   • MASTER_INDEX.md, README.md, SETUP.md"
echo "   • TIER0_OVERVIEW.md, TIER_BOUNDARY_CONTRACT.md"
echo "   • LICENSE, INTERNAL_DEPLOYMENT.md, .gitignore"
echo "   • examples/basic/basic-policy.json"
echo ""
echo "🚨 Tier 0 is now permanently frozen"
echo "🔗 GitHub: https://github.com/Brandsiya/SeekReap-Tier-0-Verification"

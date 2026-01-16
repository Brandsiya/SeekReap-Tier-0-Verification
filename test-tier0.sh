#!/bin/bash
echo "🧪 Testing SeekReap Tier 0..."
echo "==============================="
echo ""

# Test 1: Check if CLI exists
echo "1. Checking CLI..."
if [ -f "./dist/cli.js" ]; then
    echo "✅ CLI found"
else
    echo "❌ CLI not found"
    exit 1
fi

# Test 2: Version check
echo "2. Version check..."
./dist/cli.js version

# Test 3: Verify example
echo "3. Verifying example policy..."
if [ -f "./examples/basic-policy.json" ]; then
    ./dist/cli.js verify ./examples/basic-policy.json
else
    echo "⚠️  Example file not found"
fi

# Test 4: Help command
echo "4. Help command..."
./dist/cli.js help

echo ""
echo "✅ Tier 0 tests completed!"

#!/bin/bash
echo "🔨 Building SeekReap Tier 0..."
echo "==============================="

# Create dist directory
mkdir -p dist

# Copy CLI implementation
if [ -f "src/cli/index.js" ]; then
    cp src/cli/index.js dist/cli.js
    chmod +x dist/cli.js
    echo "✅ Copied CLI to dist/cli.js"
else
    echo "❌ CLI source not found"
    exit 1
fi

# Create package if needed
if [ ! -f "package.json" ]; then
    echo '{
  "name": "seekreap-tier0",
  "version": "1.0.0",
  "description": "SeekReap Tier 0 CLI",
  "main": "dist/cli.js",
  "scripts": {
    "build": "./build.sh",
    "test": "./test-tier0.sh"
  },
  "keywords": ["verification", "cli", "boundary"]
}' > package.json
    echo "✅ Created package.json"
fi

echo ""
echo "🎉 Build complete!"
echo "Run: ./dist/cli.js --help"

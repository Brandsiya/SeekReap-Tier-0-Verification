#!/bin/bash
set -e

echo "🔄 Building for Render..."

# Check Node version
node --version

# Test CLI
echo "Testing CLI..."
node cli.js --version

# List files
echo "📁 Files in project:"
ls -la

echo "✅ Build successful"
exit 0

#!/bin/bash
echo "🔧 SEEKREAP DEVELOPMENT WORKFLOW"
echo "================================"

# Pull latest from GitHub
echo "1. 📥 Pulling latest from GitHub..."
git pull origin master

# Install dependencies
echo "2. 📦 Installing dependencies..."
npm install

# Run tests
echo "3. 🧪 Running tests..."
npm test

echo "✅ Ready for development!"
echo ""
echo "📝 Commands:"
echo "  git add . && git commit -m 'message'"
echo "  git push origin master"
echo "  npm run verify"

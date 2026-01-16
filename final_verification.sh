#!/bin/bash
echo "🔍 FINAL PROJECT VERIFICATION"
echo "============================"

echo ""
echo "1. ORGANIZATION NAME CHECK:"
echo "--------------------------"
echo "Looking for 'SeekReap' in key files:"
grep -i "SeekReap" README.md MASTER_INDEX.md package.json 2>/dev/null | head -5
echo ""

echo "2. PLACEHOLDER CHECK:"
echo "--------------------"
echo "Checking for remaining placeholders:"
PLACEHOLDERS_FOUND=$(grep -r -i "your-organization\|your_organization\|YOUR_ORGANIZATION\|TODO\|FIXME\|XXX" . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=docs-backup 2>/dev/null | grep -v "find_placeholders.sh" | head -5)
if [ -n "$PLACEHOLDERS_FOUND" ]; then
  echo "⚠️  Some placeholders still found:"
  echo "$PLACEHOLDERS_FOUND"
else
  echo "✅ No placeholders found"
fi
echo ""

echo "3. DOCUMENT STATUS:"
echo "------------------"
echo "Essential documents:"
for doc in README.md MASTER_INDEX.md TIER0_OVERVIEW.md; do
  if [ -f "$doc" ]; then
    LINES=$(wc -l < "$doc" 2>/dev/null)
    echo "  • $doc: $LINES lines"
  else
    echo "  ⚠️  Missing: $doc"
  fi
done
echo ""

echo "4. GITHUB SETUP CHECK:"
echo "---------------------"
if [ -d ".github" ]; then
  echo "✅ .github directory exists"
  echo "Contents:"
  ls -la .github/ 2>/dev/null | tail -n +2
else
  echo "⚠️  .github directory not created"
fi
echo ""

echo "5. RENDER SETUP CHECK:"
echo "---------------------"
for file in render.yaml Dockerfile deploy.sh server.js; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "⚠️  Missing: $file"
  fi
done
echo ""

echo "6. FUNCTIONALITY TEST:"
echo "---------------------"
if [ -f "dist/cli.js" ]; then
  echo "✅ CLI exists"
  echo "Testing help command:"
  node dist/cli.js --help 2>/dev/null | head -5
else
  echo "⚠️  CLI not found"
fi
echo ""

echo "7. GIT STATUS:"
echo "-------------"
git status --short
echo ""

echo "📊 VERIFICATION SUMMARY:"
echo "======================="
echo "If all checks pass, run:"
echo "  git add ."
echo "  git commit -m 'Complete: SeekReap rename, document rewrite, deployment setup'"
echo "  git push origin main"
echo ""
echo "Then visit: https://github.com/Brandsiya/SeekReap"

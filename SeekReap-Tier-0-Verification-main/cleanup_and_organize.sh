#!/bin/bash
echo "🧹 CLEANUP AND ORGANIZATION"
echo "=========================="

echo ""
echo "1. IDENTIFYING ACTUAL PROJECT FILES:"

# Create a clean file inventory
echo "📄 PROJECT MARKDOWN FILES:"
find . -name "*.md" -type f | grep -v node_modules | grep -v .git | grep -v "docs-backup" | while read -r file; do
  REL_PATH=${file#./}
  SIZE=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
  echo "  • $REL_PATH ($SIZE bytes)"
done

echo ""
echo "2. CHECKING FOR EMPTY OR MINIMAL FILES:"
find . -name "*.md" -type f | grep -v node_modules | grep -v .git | while read -r file; do
  LINES=$(wc -l < "$file" 2>/dev/null)
  if [ "$LINES" -lt 5 ]; then
    echo "  ⚠️  Minimal content: $file ($LINES lines)"
    echo "    Preview:"
    head -3 "$file"
    echo ""
  fi
done

echo ""
echo "3. VERIFYING KEY FILES HAVE CONTENT:"
KEY_FILES=("README.md" "MASTER_INDEX.md" "TIER0_OVERVIEW.md")
for file in "${KEY_FILES[@]}"; do
  if [ -f "$file" ]; then
    LINES=$(wc -l < "$file" 2>/dev/null)
    echo "  • $file: $LINES lines"
    if [ "$LINES" -lt 10 ]; then
      echo "    ⚠️  Consider expanding content"
    fi
  else
    echo "  ⚠️  Missing: $file"
  fi
done

echo ""
echo "4. ORGANIZING DOCUMENT STRUCTURE:"
# Create docs directory if it doesn't exist
mkdir -p docs
mkdir -p docs/tier0
mkdir -p docs/development
mkdir -p docs/examples

echo "Created directory structure:"
echo "  📁 docs/"
echo "  📁 docs/tier0/"
echo "  📁 docs/development/"
echo "  📁 docs/examples/"

echo ""
echo "✅ Cleanup and organization ready!"
echo "Next: Review file contents and move to appropriate directories"

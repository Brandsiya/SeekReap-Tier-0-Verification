#!/bin/bash
echo "📝 REMOVING QUOTES FROM DOCUMENTS, KEEPING IN JSON"
echo "================================================"

# Process markdown files - remove quotes around SeekReap
find . -name "*.md" -type f | while read -r file; do
  echo "Processing: $file"
  # Remove quotes around SeekReap in text, but not in code blocks
  sed -i "s/\"SeekReap\"/SeekReap/g" "$file"
  sed -i "s/'SeekReap'/SeekReap/g" "$file"
  sed -i 's/`"SeekReap"`/`SeekReap`/g' "$file"
done

# Keep quotes in JSON files
echo ""
echo "✅ Markdown files updated - quotes removed from organization name"
echo "✅ JSON files keep quotes (required for syntax)"

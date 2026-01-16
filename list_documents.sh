#!/bin/bash
echo "📁 PROJECT DOCUMENTATION INVENTORY"
echo "================================="

echo ""
echo "📄 CORE DOCUMENTATION:"
echo "---------------------"
find . -name "*.md" -type f | grep -v node_modules | grep -v .git | sort | while read -r file; do
  SIZE=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
  LINES=$(wc -l < "$file" 2>/dev/null)
  echo "• $(basename "$file") - ${SIZE} bytes, ${LINES} lines"
done

echo ""
echo "📝 OTHER DOCUMENTATION FILES:"
echo "---------------------------"
find . \( -name "*.txt" -o -name "*.rst" -o -name "*.adoc" \) -type f 2>/dev/null | while read -r file; do
  echo "• $(basename "$file")"
done

echo ""
echo "📋 CONFIGURATION FILES:"
echo "----------------------"
find . \( -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.toml" \) -type f | grep -v node_modules | head -10 | while read -r file; do
  echo "• $(basename "$file")"
done

echo ""
echo "📊 SUMMARY:"
echo "Total markdown files: $(find . -name "*.md" -type f | grep -v node_modules | grep -v .git | wc -l)"
echo "Total documentation files: $(find . \( -name "*.md" -o -name "*.txt" -o -name "*.rst" \) -type f | grep -v node_modules | grep -v .git | wc -l)"

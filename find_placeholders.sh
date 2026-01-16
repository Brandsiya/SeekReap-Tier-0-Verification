#!/bin/bash
echo "🔍 COMPREHENSIVE PLACEHOLDER CHECK"
echo "================================="

PATTERNS=(
  "your-organization"
  "your_organization"
  "YOUR_ORGANIZATION"
  "your-name"
  "your_email"
  "example.com"
  "TODO"
  "FIXME"
  "XXX"
  "PLACEHOLDER"
  "INSERT_HERE"
  "TEMPLATE_"
  "CHANGEME"
  "REPLACE_ME"
  "FILL_IN"
)

echo "Searching for placeholders..."
echo ""

for pattern in "${PATTERNS[@]}"; do
  echo "🔎 Pattern: $pattern"
  RESULTS=$(grep -r -i "$pattern" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist 2>/dev/null | head -10)
  
  if [ -n "$RESULTS" ]; then
    echo "⚠️  Found in:"
    echo "$RESULTS" | while read -r line; do
      echo "   $line"
    done
    echo ""
  else
    echo "✅ Not found"
    echo ""
  fi
done

echo "📊 SUMMARY:"
echo "Run replacements for any found placeholders above"

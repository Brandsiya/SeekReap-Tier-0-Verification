#!/bin/bash
echo "🔄 SYNCING USERLAND → REPLIT → GITHUB"
echo "====================================="

# Files to sync
FILES_TO_SYNC=(
  "cli.js"
  "README.md"
  "package.json"
  "package-lock.json"
  "examples/basic/basic-policy.json"
)

echo "Files to sync:"
for file in "${FILES_TO_SYNC[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "⚠️  $file (not found)"
  fi
done

echo ""
echo "Next steps for Replit:"
echo "1. Open your Replit workspace"
echo "2. Run: git status"
echo "3. Run: git add ."
echo "4. Run: git commit -m 'Sync from UserLand: Add CLI and examples'"
echo "5. Run: git push origin main"
echo ""
echo "✅ Sync instructions ready!"

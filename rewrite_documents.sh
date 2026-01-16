#!/bin/bash
echo "📝 REWRITING DOCUMENTS WITH UPDATED ORGANIZATION"
echo "================================================"

# Backup directory
BACKUP_DIR="./docs-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Backing up original documents to: $BACKUP_DIR"

# Backup all markdown files
find . -name "*.md" -type f | grep -v node_modules | grep -v .git | grep -v docs-backup | while read -r file; do
  cp "$file" "$BACKUP_DIR/"
done

echo ""
echo "📄 Rewriting documents..."

# 1. README.md
cat > README.md << 'READMEEOF'
# SeekReap

**Open Source Boundary Verification System**

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/Brandsiya/SeekReap.git
cd SeekReap

# Install dependencies
npm install

# Build the project
./build.sh

# Run verification
node dist/cli.js verify examples/basic/basic-policy.json

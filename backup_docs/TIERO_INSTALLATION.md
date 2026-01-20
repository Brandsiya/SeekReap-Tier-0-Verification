# SeekReap Tier 0 - Installation Guide

## 🚀 Quick Install

### Prerequisites
- Node.js 16+
- npm or yarn
- Git

### Installation Methods

#### **Method 1: Clone from GitHub**
\`\`\`bash
git clone https://github.com/Brandsiya/SeekReap-Tier-0-Verification
cd SeekReap-Tier-0-Verification
npm install
\`\`\`

#### **Method 2: npm Global Install**
\`\`\`bash
npm install -g seekreap-tier0
\`\`\`

#### **Method 3: Direct Download**
\`\`\`bash
curl -L https://github.com/Brandsiya/SeekReap-Tier-0-Verification/archive/refs/heads/master.tar.gz | tar -xz
cd SeekReap-Tier-0-Verification-master
npm install
\`\`\`

## 📦 What Gets Installed

### **Core Files:**
- \`cli.js\` - Command line interface
- \`package.json\` - Dependencies and metadata
- \`test.js\` - Test suite
- All canonical documentation

### **Dependencies:**
- \`commander\` - CLI framework
- Node.js standard library only

## 🔧 Post-Installation Verification

Verify installation:
\`\`\`bash
node cli.js --version
node test.js
./verify_tier0.sh
\`\`\`

## ❗ System Requirements

### **Minimum:**
- Node.js: 16.0.0+
- RAM: 512MB
- Storage: 10MB

### **Recommended:**
- Node.js: 18.0.0+
- RAM: 1GB
- Storage: 50MB

## 🐛 Troubleshooting

### **Common Issues:**

1. **"Command not found"**
\`\`\`bash
# Make sure you're in the correct directory
pwd
ls -la cli.js
\`\`\`

2. **npm install fails**
\`\`\`bash
# Clear npm cache
npm cache clean --force

# Try with yarn
yarn install
\`\`\`

3. **Permission errors**
\`\`\`bash
# Fix permissions
sudo chown -R $(whoami) node_modules/
\`\`\`

## 📚 Next Steps

After installation, proceed to:
1. \`TIERO_QUICKSTART.md\` - First-time usage
2. \`TIERO_CLI_REFERENCE.md\` - Complete command reference
3. \`examples/\` - Policy examples

## 🏗️ Architecture Note

Tier 0 is **source-only distribution**. There are no:
- Binary packages
- Docker images
- System packages (deb, rpm, etc.)
- App stores

This maintains the **deterministic** and **transparent** nature of Tier 0.

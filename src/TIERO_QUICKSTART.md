# SeekReap Tier 0 - Quick Start Guide

## 🎯 5-Minute Getting Started

### **Step 1: Clone and Install**
\`\`\`bash
git clone https://github.com/Brandsiya/SeekReap-Tier-0-Verification
cd SeekReap-Tier-0-Verification
npm install
\`\`\`

### **Step 2: Verify Installation**
\`\`\`bash
node cli.js --version
# Expected output: seekreap/1.1.0 (Tier 0 (OSS Pilot))
\`\`\`

### **Step 3: Run Your First Verification**
\`\`\`bash
node test.js
# Should show all tests passing
\`\`\`

## 📋 Core Commands Cheat Sheet

### **Essential Commands:**
\`\`\`bash
# Show version
node cli.js --version

# Show help
node cli.js --help

# Run test suite
node test.js

# Verify Tier 0 structure
./verify_tier0.sh
\`\`\`

### **Verification Pipeline:**
\`\`\`bash
# Complete verification flow
./verify_tier0.sh      # Structure verification
node test.js           # Functional tests
./verify_tier0_final.sh # Final validation
\`\`\`

## 🚀 Common Workflows

### **Workflow 1: First-Time Setup**
\`\`\`bash
# 1. Clone
git clone https://github.com/Brandsiya/SeekReap-Tier-0-Verification

# 2. Install
cd SeekReap-Tier-0-Verification
npm install

# 3. Verify
node cli.js --version
node test.js

# 4. Explore examples
cat examples/basic/basic-policy.json
\`\`\`

### **Workflow 2: Daily Development Check**
\`\`\`bash
# Run complete validation
./complete_tier0.sh
\`\`\`

### **Workflow 3: Policy Verification (Conceptual)**
\`\`\`bash
# Tier 0 demonstrates the PATTERN only
# Actual verification happens in Tier 1+
echo "Tier 0 shows HOW verification should work"
echo "Tier 1+ implements the actual engine"
\`\`\`

## 🧪 Example Walkthrough

### **Understanding the CLI Structure:**
\`\`\`bash
# The CLI has minimal interface
node cli.js --version
# Output: Version + status + build type

node cli.js --help
# Output: Available commands and usage
\`\`\`

### **Examining Policy Examples:**
\`\`\`bash
# Look at the example policy structure
cat examples/basic/basic-policy.json

# Output shows JSON structure that Tier 1+ would verify
\`\`\`

## 🔍 Key Concepts to Understand

### **1. Deterministic Output**
\`\`\`bash
# Note: No timestamps in output
node cli.js --version
# Compare with traditional tools that include timestamps
\`\`\`

### **2. CLI-Only Interface**
- No API endpoints
- No web interface
- No SDK/library
- Command line only

### **3. Local Execution**
- No network calls
- No external dependencies at runtime
- Everything runs locally

## 📊 Expected Output Examples

### **Version Check:**
\`\`\`
seekreap/1.1.0 (Tier 0 (OSS Pilot))
Status: FROZEN
Build: source
Deterministic: declared
\`\`\`

### **Test Suite:**
\`\`\`
=======================
 CLI module loads
 Version correct
 No timestamps in output
 All Tier 0 tests passed
\`\`\`

## ⚠️ Common Pitfalls

### **Don't Expect:**
- Actual policy verification (Tier 1+)
- Network functionality
- Database integration
- User management

### **Do Expect:**
- Declarative patterns
- Deterministic behavior
- Clear boundaries
- Foundation for Tier 1+

## 🎯 What Tier 0 Actually Provides

1. **Pattern Definition** - How verification SHOULD work
2. **Interface Contract** - CLI interface specification
3. **Deterministic Example** - Proof of deterministic intent
4. **Boundary Specification** - Clear separation from Tier 1+

## 📚 Next Steps

After quick start:
1. Read \`TIERO_CLI_REFERENCE.md\` for full command details
2. Explore \`examples/\` directory
3. Study \`TIER_BOUNDARY_CONTRACT.md\` for evolution rules
4. Review \`MASTER_INDEX.md\` for architecture overview

## ❓ Getting Help

- Issues: GitHub repository
- Questions: Review documentation first
- Clarification: Check \`TIERO_POSITIONING.md\`

Remember: Tier 0 is the **declarative foundation**, not the implementation.

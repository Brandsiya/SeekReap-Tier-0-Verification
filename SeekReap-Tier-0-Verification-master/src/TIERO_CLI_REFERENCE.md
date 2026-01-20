# SeekReap Tier 0 - CLI Reference

## 📖 Command Reference

### **Global Options**
\`\`\`
Usage: node cli.js [options]

Options:
  -V, --version        Output version information
  -h, --help           Display help information
  --verbose            Show detailed output (future compatibility)
  --json               Output in JSON format (future compatibility)
\`\`\`

### **Command: --version**
**Description:** Display version information and Tier 0 status
**Usage:**
\`\`\`bash
node cli.js --version
\`\`\`
**Output:**
\`\`\`
seekreap/1.1.0 (Tier 0 (OSS Pilot))
Status: FROZEN
Build: source
Deterministic: declared
\`\`\`
**Fields Explained:**
- \`seekreap/1.1.0\` - Product name and version
- \`Tier 0 (OSS Pilot)\` - Tier classification
- \`Status: FROZEN\` - Development status
- \`Build: source\` - Distribution type
- \`Deterministic: declared\` - Determinism guarantee

### **Command: --help**
**Description:** Show help information
**Usage:**
\`\`\`bash
node cli.js --help
\`\`\`
**Output:**
\`\`\`
Usage: node cli.js [options]

Options:
  -V, --version        Output version information
  -h, --help           Display help information
  --verbose            Show detailed output (future compatibility)
  --json               Output in JSON format (future compatibility)

Description:
  SeekReap Tier 0 (OSS Pilot) - Declarative foundation
  Version: 1.1.0 | Status: FROZEN | Tier: 0
  
  This CLI demonstrates the pattern for deterministic verification.
  All actual implementation occurs in Tier 1+.
\`\`\`

## 🎯 CLI Design Principles
### **1. Minimal Interface**
- Only essential commands
- No subcommands in Tier 0
- Clear, predictable output

### **2. Deterministic Output**
- No timestamps
- No random elements
- Consistent formatting
- Predictable ordering

### **3. Future Compatibility**
- Reserved options for Tier 1+
- Extensible structure
- Backward compatibility guarantees

## 📊 Output Formats
### **Standard Output (Default)**
Human-readable format with consistent styling.

### **JSON Format (Reserved for Tier 1+)**
\`\`\`json
{
  "version": "1.1.0",
  "tier": "0",
  "status": "FROZEN",
  "build": "source",
  "deterministic": true
}
\`\`\`

### **Verbose Output (Reserved for Tier 1+)**
Detailed information including:
- Build timestamp (Tier 1+ only)
- Platform information
- Configuration details

## 🔧 Environment Variables
### **SEEKREAP_TIER0_DEBUG**
**Purpose:** Enable debug output
**Values:** \`1\`, \`true\`, \`yes\`
**Default:** Not set
**Example:**
\`\`\`bash
SEEKREAP_TIER0_DEBUG=1 node cli.js --version
\`\`\`

### **SEEKREAP_TIER0_OUTPUT**
**Purpose:** Output format (reserved for Tier 1+)
**Values:** \`json\`, \`text\`, \`yaml\`
**Default:** \`text\`

## 🚫 Unavailable in Tier 0
The following are **NOT** available in Tier 0 CLI:

### **Commands:**
- ❌ \`verify\` - Actual verification (Tier 1+)
- ❌ \`policy\` - Policy management (Tier 1+)
- ❌ \`audit\` - Audit trails (Tier 1+)
- ❌ \`config\` - Configuration (Tier 1+)

### **Features:**
- ❌ Network operations
- ❌ File I/O beyond basic reading
- ❌ Database operations
- ❌ External API calls
- ❌ User authentication

## 🎨 Output Styling
### **Color Coding (When Supported):**
- ✅ Green: Success
- ℹ️  Blue: Information
- ⚠️  Yellow: Warning
- ❌ Red: Error

### **Icons:**
- 📦 Package/version info
- 🔧 Configuration/build info
- 🎯 Target/objective info
- 📖 Documentation references

## 🔄 Exit Codes
### **Standard Exit Codes:**
- \`0\` - Success
- \`1\` - General error
- \`2\` - Invalid arguments
- \`3\` - Configuration error (Tier 1+)
- \`4\` - Verification failed (Tier 1+)

### **Tier 0 Specific:**
- Always returns \`0\` for valid commands
- Returns \`1\` for invalid commands/options

## 📝 Examples
### **Basic Usage:**
\`\`\`bash
# Show version
node cli.js --version

# Show help
node cli.js --help

# Invalid command (shows help)
node cli.js invalid-command
\`\`\`

### **Script Integration:**
\`\`\`bash
#!/bin/bash
# Example script using Tier 0 CLI

VERSION=$(node cli.js --version | head -1)
echo "Running $VERSION"

# Check if Tier 0 is properly installed
if node cli.js --version > /dev/null 2>&1; then
    echo "✅ Tier 0 CLI is available"
else
    echo "❌ Tier 0 CLI not found"
    exit 1
fi
\`\`\`

## 🔍 Troubleshooting CLI Issues
### **"Command not found"**
\`\`\`bash
# Check if cli.js exists
ls -la cli.js

# Check Node.js installation
node --version

# Run with explicit path
node ./cli.js --version
\`\`\`

### **Permission Errors**
\`\`\`bash
# Make cli.js executable (optional)
chmod +x cli.js

# Run with node explicitly
node cli.js --version
\`\`\`

### **Unexpected Output**
\`\`\`bash
# Check for environment variables
env | grep SEEKREAP

# Run with clean environment
env -i node cli.js --version
\`\`\`

## 📚 Related Documentation
1. \`TIERO_QUICKSTART.md\` - Getting started guide
2. \`TIERO_INSTALLATION.md\` - Installation instructions
3. \`TIER_BOUNDARY_CONTRACT.md\` - Tier evolution rules
4. \`MASTER_INDEX.md\` - Architecture overview

## ⚠️ Important Notes
1. **Tier 0 CLI is FROZEN** - No new commands will be added
2. **Deterministic by design** - Outputs are predictable
3. **Foundation only** - Implementation happens in Tier 1+
4. **Source distribution** - No binary packages in Tier 0

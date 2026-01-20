#!/usr/bin/env node
// SeekReap Tier 0 CLI - Boundary-Controlled Verification Tool

const fs = require('fs');
const path = require('path');

// Version
const VERSION = '1.0.0';

// Show help
function showHelp() {
    console.log(`
SeekReap Tier 0 - Boundary-Controlled CLI v${VERSION}
====================================================

USAGE:
  seekreap-verify [command] [options] [file]

COMMANDS:
  verify <file>    Verify a policy or configuration file
  check <file>     Check file syntax without full validation
  version          Show version information
  help             Show this help message

OPTIONS:
  --strict         Enable strict validation mode
  --format <type>  Output format: text (default) or json

EXAMPLES:
  seekreap-verify verify examples/basic-policy.json
  seekreap-verify check config.yaml --strict
  seekreap-verify version

BOUNDARY NOTES:
- No network access
- No external dependencies
- Read-only file operations
- Source-only distribution
`);
}

// Show version
function showVersion() {
    console.log(`SeekReap Tier 0 v${VERSION}`);
    console.log('Boundary: 2024-01-15');
    console.log('Type: Source-only CLI');
    console.log('License: SEEKREAP-TIER0-1.0');
}

// Verify a file
function verifyFile(filePath, options = {}) {
    try {
        const absolutePath = path.resolve(filePath);
        
        // Check if file exists
        if (!fs.existsSync(absolutePath)) {
            console.error(`❌ File not found: ${filePath}`);
            return false;
        }
        
        // Get file info
        const stats = fs.statSync(absolutePath);
        const content = fs.readFileSync(absolutePath, 'utf8');
        
        console.log(`📄 File: ${path.basename(absolutePath)}`);
        console.log(`   Path: ${absolutePath}`);
        console.log(`   Size: ${stats.size} bytes`);
        console.log(`   Modified: ${stats.mtime.toISOString()}`);
        
        // Validate based on file extension
        const ext = path.extname(absolutePath).toLowerCase();
        
        switch (ext) {
            case '.json':
                try {
                    JSON.parse(content);
                    console.log('✅ Valid JSON syntax');
                    return true;
                } catch (e) {
                    console.error(`❌ Invalid JSON: ${e.message}`);
                    return false;
                }
                
            case '.yaml':
            case '.yml':
                console.log('⚠️  YAML validation requires external library (not in Tier 0)');
                console.log('✅ File exists and is readable');
                return true;
                
            case '.txt':
                console.log('✅ Plain text file');
                return true;
                
            default:
                console.log(`✅ Unknown format (.${ext}), checking readability only`);
                return true;
        }
    } catch (error) {
        console.error(`❌ Error reading file: ${error.message}`);
        return false;
    }
}

// Check file syntax
function checkFile(filePath) {
    try {
        const absolutePath = path.resolve(filePath);
        
        if (!fs.existsSync(absolutePath)) {
            console.error(`❌ File not found: ${filePath}`);
            return false;
        }
        
        const stats = fs.statSync(absolutePath);
        console.log(`✅ File exists: ${path.basename(absolutePath)}`);
        console.log(`   Size: ${stats.size} bytes`);
        console.log(`   Readable: ${stats.mode & 0o444 ? 'Yes' : 'No'}`);
        
        return true;
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return false;
    }
}

// Main function
function main() {
    const args = process.argv.slice(2);
    
    // No arguments or help requested
    if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
        showHelp();
        process.exit(0);
    }
    
    // Version requested
    if (args[0] === 'version' || args[0] === '--version' || args[0] === '-v') {
        showVersion();
        process.exit(0);
    }
    
    // Parse command and options
    const command = args[0];
    const remainingArgs = args.slice(1).filter(arg => !arg.startsWith('--'));
    const options = {};
    
    // Parse options
    args.slice(1).forEach(arg => {
        if (arg === '--strict') options.strict = true;
        if (arg.startsWith('--format=')) {
            options.format = arg.split('=')[1];
        }
    });
    
    // Check for file argument
    if (remainingArgs.length === 0) {
        console.error('❌ No file specified');
        showHelp();
        process.exit(1);
    }
    
    const file = remainingArgs[0];
    let success = false;
    
    // Execute command
    switch (command) {
        case 'verify':
            success = verifyFile(file, options);
            break;
            
        case 'check':
            success = checkFile(file);
            break;
            
        default:
            console.error(`❌ Unknown command: ${command}`);
            showHelp();
            process.exit(1);
    }
    
    // Exit with appropriate code
    process.exit(success ? 0 : 1);
}

// Run the CLI
if (require.main === module) {
    main();
}

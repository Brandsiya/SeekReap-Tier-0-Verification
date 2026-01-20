# Tier 0 Setup Guide

## PREREQUISITES
- Node.js 12.0.0 or higher
- Git
- GitHub account
- Render account (for deployment)

## INSTALLATION

### 1. Verify Environment
\`\`\`bash
node --version
git --version
\`\`\`

### 2. Test Installation
\`\`\`bash
node cli.js --version
npm test
\`\`\`

## GIT SETUP

### 1. Check Status
\`\`\`bash
git status
\`\`\`

### 2. Add Files
\`\`\`bash
git add package.json cli.js test.js *.md LICENSE
\`\`\`

### 3. Commit
\`\`\`bash
git commit -m "Tier 0 (OSS Pilot) - Complete and Frozen v1.1.0"
\`\`\`

### 4. Tag
\`\`\`bash
git tag tier0-frozen-v1.1.0
\`\`\`

## GITHUB DEPLOYMENT

### 1. Push to Existing Repository
\`\`\`bash
git push origin master
git push origin tier0-frozen-v1.1.0
\`\`\`

## RENDER DEPLOYMENT

### 1. Connect GitHub
1. Go to https://render.com
2. Connect your GitHub account
3. Select SeekReap-Tier-0-Verification repository

### 2. Configure Service
- **Type**: Web Service
- **Environment**: Node
- **Build Command**: (leave empty - source only)
- **Start Command**: (leave empty - static)

### 3. Deploy
Render will auto-deploy on git push.

## VERIFICATION

### Post-Deployment Check
\`\`\`bash
# Local
node cli.js --version

# Should output:
# seekreap/1.1.0 (Tier 0 (OSS Pilot))
# Status: FROZEN
# Build: source
# Deterministic: declared
\`\`\`

## MAINTENANCE
No maintenance required. Tier 0 is frozen.

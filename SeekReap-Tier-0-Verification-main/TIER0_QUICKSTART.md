# Tier 0 QuickStart

## Get Started in 5 Minutes

1. **Build the CLI:**
   ```bash
   ./build.sh

# Create all TIER0 documentation files

echo "------------------------------------"

cat > TIER0_OVERVIEW.md << 'EOF'
# SeekReap Tier 0 Pilot - Purpose & Scope

## What's Included (Self-Hosted OSS)
- Core verification engine & CLI
- Policy logic & JavaScript SDK
- Reference test suite for validation
- Installation guides for local setup
- Developer documentation
- Community support via GitHub

## What's Excluded
- Dashboards & UI components
- Compliance packs
- SeekReap certification
- SLA or paid add-ons

## Boundary Enforcement
This Tier 0 version runs entirely locally with:
- No network access
- No external dependencies
- No data transmission
- Pure file verification only

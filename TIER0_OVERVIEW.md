# Tier 0 Overview

## POSITIONING
Tier 0 is the **OSS Pilot** - the frozen, declarative foundation.

## CHARACTERISTICS (FROZEN)

### ✅ Implemented
- CLI interface declaration
- Versioning system
- Deterministic intent declaration
- Canonical documentation structure
- Frozen state declaration

### ✅ Guarantees
- No timestamps in outputs
- CLI-only interface
- Local execution only
- Source distribution only

### ✅ Boundaries
- No verification engine (Tier 1+)
- No network calls
- No telemetry
- No UI/dashboards
- No SDK/API

## EVOLUTION PATH

\`\`\`
Tier 0 (Frozen)
    ↓
Tier 1 (Managed Cloud) → Verification engine
    ↓
Tier 2+ (Extensions) → Additional features
\`\`\`

## CANONICAL FILES (IMMUTABLE)
1. \`cli.js\` - CLI interface
2. \`package.json\` - Package definition
3. Documentation files
4. Examples structure

## COMPLIANCE
Tier 0 is intentionally minimal to:
- Establish clear boundaries
- Enable deterministic foundation
- Allow clean Tier 1+ evolution
- Prevent scope creep

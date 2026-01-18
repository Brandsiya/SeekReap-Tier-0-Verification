# SeekReap Tier 0 — Master Index

## AUTHORITATIVE SOURCE OF TRUTH
This document is the canonical index of all Tier 0 resources.

## CANONICAL STRUCTURE
\`\`\`
SeekReap-Tier-0-Verification/
 cli.js              # Frozen CLI interface
 package.json        # Package definition (frozen)
 test.js            # Test suite
 LICENSE            # License
 README.md          # Primary documentation
 MASTER_INDEX.md    # This file (canonical index)
 TIER0_OVERVIEW.md  # Scope and objectives
 SETUP.md           # Setup instructions
 examples/          # Example files
\`\`\`

## TIER 0 SCOPE (FROZEN)

### IN SCOPE ✓
- CLI interface declaration
- Deterministic intent declaration
- Frozen state declaration
- Canonical documentation structure

### OUT OF SCOPE ✗
- Actual verification engine (Tier 1+)
- Dashboards / UI
- Hosted services
- Network communication
- Telemetry
- SDK/API interfaces

## DETERMINISM GUARANTEE
Tier 0 declares the intent for deterministic verification.
Tier 1+ implements the actual deterministic engine.

## FREEZE DECLARATION
**EFFECTIVE:** 2026-01-18
**STATUS:** FROZEN
**VERSION:** 1.1.0
**TIER:** 0

No changes will be made to Tier 0.
All development moves to Tier 1.

## BOUNDARY CONTRACT
1. Tier 0 outputs contain no timestamps
2. Tier 0 has CLI-only interface
3. Tier 0 executes locally only
4. Tier 1+ must extend, not break, Tier 0 declarations

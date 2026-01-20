# SeekReap Tier 0 (OSS Pilot)

## 🚨 STATUS: FROZEN PERMANENTLY

**Version:** 1.1.0  
**Freeze Date:** January 18, 2026  
**Tier:** 0 (OSS Pilot)  
**Distribution:** Source only  
**Evolution:** No new features will be added  

## 🎯 Purpose

Tier 0 is the **immutable declarative foundation** for SeekReap. It establishes:
- Deterministic verification intent declaration
- CLI interface pattern
- Canonical documentation structure
- Immutable baseline for Tier 1+ evolution

## 📦 Contents (Frozen)

### **Canonical Documentation:**
1. MASTER_INDEX.md - Architecture and source of truth
2. TIER0_OVERVIEW.md - Scope and objectives
3. SETUP.md - Installation and setup
4. TIER_BOUNDARY_CONTRACT.md - Evolution rules
5. LICENSE - MIT License

### **Core Implementation:**
- cli.js - CLI interface (v1.1.0)
- package.json - Dependencies
- test.js - Verification tests
- verify_tier0.sh - Structural verification
- verify_tier0_final.sh - Final verification

### **Examples:**
- examples/basic/ - Basic policy examples (JSON only)

## ❗ Boundaries (Frozen)

- **CLI-only**: No SDK, no API, no programmatic interface
- **Local execution**: No network calls, no external dependencies
- **Deterministic**: Outputs contain no timestamps
- **Immutable**: No features added post-freeze
- **Source-only**: No hosted service, no deployment (publicly)

## ⚠️ Internal Deployment Scripts

*Note: This repository contains internal deployment scripts for platform unity pipeline testing.*  
*These are NOT part of Tier 0 specification. See INTERNAL_DEPLOYMENT.md for details.*

## 🔄 Relationship to Tier 1+

**For all development, issues, and features:**
- **Tier 1 Repository:** https://github.com/seekreap/seekreap-tier1-managed
- **Tier 0 is complete** and will not change
- **All evolution happens in Tier 1+**

Tier 1 implements verification compatible with Tier 0 outputs.

## 📚 Quick Start

\`\`\`bash
git clone https://github.com/Brandsiya/SeekReap-Tier-0-Verification
npm install
node cli.js --version
node test.js
\`\`\`

## 🏛️ Governance

Governed by TIER_BOUNDARY_CONTRACT.md:
1. Tier 0 outputs remain valid forever
2. CLI semantics cannot change
3. Determinism guarantee must never be broken
4. Clear demarcation between tiers maintained

---

**Mission Accomplished:** Declarative foundation established.  
**Future Development:** Continues in Tier 1+ only.

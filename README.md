# SeekReap Tier 0 — Protocol

## Status
**PERMANENTLY FROZEN · NORMATIVE SPECIFICATION**

## Purpose
SeekReap Tier 0 defines the **canonical protocol specification** for the SeekReap system.

It establishes:
- What **must be true**
- What **cannot change**
- Where **boundaries exist**
- How **authority is constrained**

Tier 0 does **not** define behavior, execution, tooling, or implementation details.

---

## Protocol Nature

SeekReap Tier 0 is:

- **Normative** — defines invariants and contracts
- **Deterministic** — no ambiguity or probabilistic interpretation
- **Canonical** — single authoritative reference
- **Immutable** — permanently frozen once published
- **Implementation-agnostic** — no “how”, only “what”

Conformance is evaluated externally.  
Tier 0 itself performs no execution or validation.

---

## Scope Boundary

**Tier 0 contains ONLY:**
- Protocol definitions
- Governance invariants
- Authority constraints
- Boundary contracts
- Canonical documentation
- Reference-only license

**Tier 0 explicitly excludes:**
- Executable code
- CLI or tooling references
- Installation or onboarding instructions
- Contribution workflows
- Operational guidance
- Commercial or competitive logic

All such material belongs to **Tier 1 or higher**.

---

## Canonical Documents

| Document | Role |
|--------|------|
| `MASTER_INDEX.md` | Canonical index of all Tier-0 documents |
| `TIER0_OVERVIEW.md` | Definition of Tier-0 purpose and scope |
| `TIER_BOUNDARY_CONTRACT.md` | Formal boundary between Tier-0 and higher tiers |
| `FREEZE_ANNOUNCEMENT.md` | Permanent immutability invariant |
| `LICENSE` | SeekReap Tier-0 Protocol Reference License v1.0 |

---

## License Alignment

Tier 0 is governed by the **SeekReap Tier-0 Protocol Reference License (v1.0)**.

Key principles:
- The specification text is licensed
- Implementations are **not** derivative works
- Commercial use is unrestricted at the implementation level
- The canonical specification cannot be modified or re-issued

---

## Authority Statement

Any system claiming to be “SeekReap-compatible” MUST:
- Conform to this specification
- Respect Tier boundaries
- Avoid redefining or extending Tier-0 semantics

Tier-0 itself has no execution authority.

---

## Finality Notice

Tier-0 is sealed.  
No extensions, revisions, or amendments are permitted within this tier.

All evolution occurs strictly in **Tier-1 and above**.

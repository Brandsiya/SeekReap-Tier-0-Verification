# SeekReap Tier 0 — Overview

## Definition

Tier 0 is the **foundational protocol layer** of the SeekReap system.

It defines the **unchanging truth set** upon which all higher-tier implementations depend.

Tier 0 is not a system, product, service, or framework.  
It is a **specification boundary**.

---

## Why Tier 0 Exists

Tier 0 exists to ensure:

- Determinism across implementations
- Verifiable conformance
- Prevention of semantic drift
- Long-term stability
- Authority containment

Without Tier 0, SeekReap would be an evolving product.  
With Tier 0, SeekReap is a **protocol**.

---

## What Tier 0 Defines

Tier 0 defines:

- Canonical terms and meanings
- Structural invariants
- Protocol-level contracts
- Tier separation rules
- Governance constraints

It does **not** define:
- Algorithms
- Data storage
- Execution models
- Performance characteristics
- Tooling or UX

---

## Relationship to Other Tiers

- **Tier 0**: Defines *what is true*
- **Tier 1**: Implements *how truth is enforced*
- **Tier 2+**: Composes, deploys, and operates implementations

Tier 0 has no dependency on any higher tier.  
Higher tiers depend on Tier 0.

---

## Immutability

Once published, Tier 0 documents are frozen.

Errors are handled by:
- Replacement at a new protocol version
- Never by mutation of the existing version

This guarantees historical and legal stability.

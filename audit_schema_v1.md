# Audit Schema v1.0 - Immutable
# Phase 3 Cycle 2 - Audit Infrastructure

## Schema Definition
version: "1.0"
created: "2026-01-06"
status: "approved"

## Audit Record Structure
- audit_id (UUID)
- timestamp (ISO 8601, UTC)
- event_type (verification|compliance|system)
- event_id (reference to original event)
- actor (who performed action)
- action (what was done)
- outcome (success|failure|partial)
- details (JSON object with specifics)
- hash (cographic hash for integrity)

## Governance Requirements
1. Append-only: Records cannot be modified or deleted
2. Tamper-evident: Each record includes hash of previous record
3. Time-ordered: Chronological sequence maintained
4. Immutable: Schema v1.0 cannot be changed

## Implementation Notes
- Log files stored in audit_logs/ directory
- Daily rotation: audit_YYYY-MM-DD.log
- Hash chain: Each record includes hash of previous record
- Integrity: Can verify complete log hasn't been altered

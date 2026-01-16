# Event Schema v1.0 - Immutable
# Phase 3 Cycle 1 - Event Bus Externalization

## Schema Definition
version: "1.0"
created: "2026-01-06"
status: "approved"

## Event Types
- verification.*
- compliance.*  
- system.*

## Required Fields
- event_id (UUID)
- version ("1.0")
- type (string)
- timestamp (ISO 8601)
- data (object)

## Governance Note
This schema is immutable. Any changes require v2.0.

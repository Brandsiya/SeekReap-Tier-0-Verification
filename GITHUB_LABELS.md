# GitHub Labels to Create (Manual Setup)

Create these labels in your GitHub repository settings:

## Core Labels
- **tier0-only** (#0052CC) - For issues that legitimately relate to Tier 0
- **documentation** (#D4C5F9) - Documentation fixes/clarifications
- **determinism** (#F9D0C4) - Issues with deterministic outputs

## Governance Labels
- **out-of-scope** (#FFFFFF) - Issues requesting Tier 1+ features
- **tier1-request** (#FBCA04) - Auto-close or redirect to CONTACT.md
- **wontfix** (#000000) - Valid issues that don't align with frozen status

## Workflow
1. New issue arrives → Apply appropriate label
2. `tier1-request` or `out-of-scope` → Comment with redirect to CONTACT.md, then close
3. `tier0-only` → Evaluate for validity in frozen context
4. `documentation` or `determinism` → Process if within boundaries

## Label Colors (HEX)
- #0052CC - tier0-only (blue)
- #D4C5F9 - documentation (lavender)
- #F9D0C4 - determinism (peach)
- #FFFFFF - out-of-scope (white with dark text)
- #FBCA04 - tier1-request (yellow)
- #000000 - wontfix (black with white text)

## How to Create Labels on GitHub
1. Go to your repository on GitHub
2. Click "Issues" → "Labels" (on the right sidebar)
3. Click "New label"
4. Enter label name, color, and description
5. Click "Create label"

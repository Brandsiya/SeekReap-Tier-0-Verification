# INTERNAL DEPLOYMENT SCRIPTS - NOT PART OF TIER 0

## PURPOSE
These scripts are preserved for internal testing of the platform unity pipeline:
UserLand → GitHub → Render

## FILES PRESERVED (INTERNAL USE ONLY):
- VERIFY-AUTO-DEPLOY.sh - Auto-deployment verification
- deploy.sh - Deployment script
- dev-workflow.sh - Development workflow
- diagnostic.sh - Platform diagnostics
- sync_to_replit.sh - Replit synchronization
- render.yaml - Render.com configuration
- .replit - Replit configuration
- check-auto-deploy.sh - Auto-deployment check

## RULES:
1. NOT PART OF TIER 0: These files are not part of the Tier 0 specification
2. INTERNAL USE ONLY: For platform testing only
3. NO PUBLIC DOCUMENTATION: Not referenced in user-facing materials
4. NO PUBLIC URLS: Deployment URLs are not shared publicly
5. NO EFFECT ON TIER 0: Do not affect CLI determinism or Tier 0 boundaries

## REASON FOR PRESERVATION:
Testing the complete deployment pipeline from development to production
while maintaining Tier 0's frozen, minimal nature.

## SEPARATION OF CONCERNS:
- Tier 0 (Public): Frozen CLI and canonical documentation only
- Deployment (Internal): Platform unity pipeline testing
- Tier 1+ (Separate): All actual implementation and features

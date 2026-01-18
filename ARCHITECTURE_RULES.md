# 🚨 CRITICAL ARCHITECTURE RULES

## PRIMARY FLOW (UserLand → GitHub → Render)
1. Code ONLY in UserLand
2. Push from UserLand to GitHub
3. Render auto-deploys from GitHub

## REPLIT RULES (Viewer Mode)
1. NEVER auto-pull from GitHub
2. Manual git pull ONLY when you want to view changes
3. NEVER push from Replit
4. Use Replit only for testing/viewing

## WARNING SIGNS OF BREAKAGE:
- If Replit says "Your branch has diverged"
- If git status shows conflicts
- If GitHub webhooks to Replit exist

## QUICK FIX:
cd ~/SeekReap-Tier-0-Verification
git fetch origin
git reset --hard origin/master

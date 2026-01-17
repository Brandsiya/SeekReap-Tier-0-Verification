# 🚨 AUTO-DEPLOY TROUBLESHOOTING GUIDE

## SYMPTOMS:
1. ✅ Auto-deploy TRIGGERS for 'Master' branch
2. ❌ Deployment FAILS for 'Master' branch  
3. ✅ Deployment SUCCEEDS for 'master' branch
4. ❌ Auto-deploy doesn't trigger for 'master' branch

## ROOT CAUSES:

### A. BRANCH NAME CASE SENSITIVITY:
- GitHub webhooks are case-sensitive
- 'master' ≠ 'Master' for webhook events
- Render might be configured for wrong case

### B. GITHUB DEFAULT BRANCH:
- If default branch is 'Master', webhooks prioritize it
- Need to change default to 'master'

### C. BUILD/SCRIPT ISSUES:
- Build scripts might fail with uppercase branch names
- File paths might be case-sensitive

## SOLUTIONS:

### 1. STANDARDIZE ON 'master' (lowercase):
```bash
# Delete 'Master' branch if it exists
git push origin --delete Master 2>/dev/null
git branch -D Master 2>/dev/null

# Ensure on 'master' branch
git checkout master
git branch -u origin/master master

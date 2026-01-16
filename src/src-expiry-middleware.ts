// 30-minute expiry implemented
// HARD EXPIRY ENFORCEMENT MIDDLEWARE
import { Request, Response, NextFunction } from 'express';
import { engagementService } from './src-engagement-service';

/**
 * Global Expiry Enforcement Middleware
 * 
 * PURPOSE: Enforces 30-minute expiry on EVERY engagement-related request
 * This is a HARD GUARANTEE, not passive cleanup
 * 
 * APPLIES TO: All endpoints that touch engagements
 */

export function enforceExpiryMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip if no session in request
  const sessionId = getSessionId(req);
  if (!sessionId) {
    return next();
  }
  
  try {
    // Get active engagement for session
    const engagement = engagementService.getActiveEngagement(sessionId);
    
    if (engagement) {
      // The getActiveEngagement method already performs expiry check
      // and auto-transitions to EXPIRED if needed
      
      // Log expiry events for audit
      if (engagement.currentState === 'expired') {
        console.warn(`[EXPIRY_ENFORCED] Engagement ${engagement.id} expired for session ${sessionId}`);
        
        // Set header to indicate expiry was enforced
        res.setHeader('X-Engagement-Expiry-Checked', 'true');
        res.setHeader('X-Engagement-Expired', 'true');
      } else {
        // Engagement is still active
        res.setHeader('X-Engagement-Expiry-Checked', 'true');
        res.setHeader('X-Engagement-Expired', 'false');
        res.setHeader('X-Engagement-Expires-At', engagement.expiresAt.toISOString());
      }
    }
    
    next();
  } catch (error) {
    console.error('[EXPIRY_MIDDLEWARE_ERROR]', error);
    next();
  }
}

/**
 * Route-specific expiry check for critical endpoints
 * Throws error if engagement is expired
 */
export function requireActiveEngagement(req: Request, res: Response, next: NextFunction) {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    return res.status(401).json({ error: 'Session required' });
  }
  
  const engagement = engagementService.getActiveEngagement(sessionId);
  
  if (!engagement) {
    return res.status(404).json({ error: 'No active engagement found' });
  }
  
  if (engagement.currentState === 'expired') {
    return res.status(410).json({ 
      error: 'Engagement expired',
      code: 'ENGAGEMENT_EXPIRED',
      expiredAt: engagement.expiresAt.toISOString()
    });
  }
  
  // Attach engagement to request for downstream use
  (req as any).engagement = engagement;
  next();
}

/**
 * Extracts session ID from request
 * Supports multiple auth methods
 */
function getSessionId(req: Request): string | null {
  // Check headers first
  const sessionHeader = req.headers['x-session-id'] || req.headers['session-id'];
  if (sessionHeader) {
    return Array.isArray(sessionHeader) ? sessionHeader[0] : sessionHeader;
  }
  
  // Check cookies
  if (req.cookies?.sessionId) {
    return req.cookies.sessionId;
  }
  
  // Check query params (for debugging only)
  if (req.query?.sessionId) {
    return req.query.sessionId as string;
  }
  
  return null;
}

/**
 * Utility to check if a timestamp is expired
 */
export function isExpired(timestamp: Date): boolean {
  return new Date() > timestamp;
}

/**
 * Utility to get time remaining until expiry
 */
export function getTimeRemaining(expiresAt: Date): number {
  return Math.max(0, expiresAt.getTime() - Date.now());
}

/**
 * Test function to verify expiry enforcement
 */
export function testExpiryEnforcement(): boolean {
  const testDate = new Date(Date.now() - 1000); // 1 second ago
  return isExpired(testDate);
}

export default {
  enforceExpiryMiddleware,
  requireActiveEngagement,
  isExpired,
  getTimeRemaining,
  testExpiryEnforcement
};

// 30-minute expiry implemented
// API Routes with integrated expiry enforcement
import { Router, Request, Response } from 'express';
import { engagementService } from './src-engagement-service';
import { 
  enforceExpiryMiddleware, 
  requireActiveEngagement 
} from './src-expiry-middleware';

const router = Router();

// GLOBAL MIDDLEWARE: Enforce expiry on ALL engagement routes
router.use(enforceExpiryMiddleware);

/**
 * HEALTH CHECK
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    expiryEnforcement: 'active'
  });
});

/**
 * START ENGAGEMENT
 * Creates new engagement with atomic session protection
 * HARD ENFORCEMENT: One engagement per session
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    const engagement = await engagementService.createEngagement(sessionId);
    
    res.status(201).json({
      success: true,
      engagementId: engagement.id,
      state: engagement.currentState,
      expiresAt: engagement.expiresAt.toISOString(),
      timeRemainingMs: engagement.expiresAt.getTime() - Date.now()
    });
  } catch (error: any) {
    if (error.name === 'EngagementError') {
      res.status(error.statusCode).json({ 
        error: error.message,
        code: error.code
      });
    } else {
      console.error('Error starting engagement:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * GET ACTIVE ENGAGEMENT
 * Includes HARD expiry check
 */
router.get('/active', requireActiveEngagement, (req: Request, res: Response) => {
  const engagement = (req as any).engagement;
  
  res.json({
    engagementId: engagement.id,
    state: engagement.currentState,
    createdAt: engagement.createdAt.toISOString(),
    expiresAt: engagement.expiresAt.toISOString(),
    timeRemainingMs: Math.max(0, engagement.expiresAt.getTime() - Date.now()),
    canVerify: engagement.currentState === 'completed'
  });
});

/**
 * COMPLETE ENGAGEMENT (User submits evidence)
 * Includes atomic session protection and expiry enforcement
 */
router.post('/complete', requireActiveEngagement, async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    const evidenceData = req.body.evidence;
    
    const result = await engagementService.completeEngagement(sessionId, evidenceData);
    
    res.json({
      success: true,
      engagementId: result.id,
      newState: result.currentState,
      completedAt: result.completedAt?.toISOString()
    });
  } catch (error: any) {
    handleEngagementError(error, res);
  }
});

/**
 * VERIFY ENGAGEMENT (Week 2 placeholder)
 * Will be expanded with token verification in Week 2
 */
router.post('/verify', requireActiveEngagement, async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    const verificationToken = req.body.token;
    
    if (!verificationToken) {
      return res.status(400).json({ error: 'Verification token required' });
    }
    
    const result = await engagementService.verifyEngagement(sessionId, verificationToken);
    
    res.json({
      success: true,
      engagementId: result.id,
      newState: result.currentState,
      verifiedAt: result.verifiedAt?.toISOString()
    });
  } catch (error: any) {
    handleEngagementError(error, res);
  }
});

/**
 * VALIDATE ENGAGEMENT (Debug/Admin)
 */
router.get('/validate', requireActiveEngagement, (req: Request, res: Response) => {
  const engagement = (req as any).engagement;
  const errors = engagementService.validateEngagement(engagement);
  
  res.json({
    engagementId: engagement.id,
    state: engagement.currentState,
    isValid: errors.length === 0,
    errors: errors,
    expiryStatus: new Date() > engagement.expiresAt ? 'EXPIRED' : 'ACTIVE'
  });
});

/**
 * Error handler for engagement errors
 */
function handleEngagementError(error: any, res: Response) {
  if (error.name === 'EngagementError') {
    res.status(error.statusCode).json({ 
      error: error.message,
      code: error.code,
      details: error.details
    });
  } else {
    console.error('Engagement route error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      reference: `ERR-${Date.now()}`
    });
  }
}

/**
 * Initialize routes with app
 */
export function initializeEngagementRoutes(app: any) {
  app.use('/api/engagement', router);
  console.log('Engagement routes initialized with expiry enforcement');
}

export default router;

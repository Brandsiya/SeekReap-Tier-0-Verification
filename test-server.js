// Simple test server
const express = require('express');
const { engagementService } = require('./src-engagement-service.cjs');

const app = express();
app.use(express.json());

// Basic routes for testing
app.post('/api/engagement/create', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.status(400).json({ error: 'X-Session-ID header required' });
    }

    const result = await engagementService.createEngagement(sessionId);
    res.json({
      success: true,
      engagementId: result.id,
      state: result.currentState,
      expiresAt: result.expiresAt.toISOString()
    });
  } catch (error) {
    if (error.name === 'EngagementError') {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.code
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.get('/api/engagement/status', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.status(400).json({ error: 'X-Session-ID header required' });
    }

    const engagement = engagementService.getActiveEngagement(sessionId);
    if (!engagement) {
      return res.status(404).json({ error: 'No active engagement found' });
    }

    res.json({
      engagementId: engagement.id,
      state: engagement.currentState,
      expiresAt: engagement.expiresAt.toISOString(),
      isExpired: new Date() > engagement.expiresAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/engagement/complete', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.status(400).json({ error: 'X-Session-ID header required' });
    }

    const evidenceData = req.body.evidence;
    const result = await engagementService.completeEngagement(sessionId, evidenceData);
    
    res.json({
      success: true,
      engagementId: result.id,
      state: result.currentState,
      completedAt: result.completedAt?.toISOString()
    });
  } catch (error) {
    if (error.name === 'EngagementError') {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.code
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Endpoints:');
  console.log('  POST   /api/engagement/create');
  console.log('  GET    /api/engagement/status');
  console.log('  POST   /api/engagement/complete');
});
import express from 'express';
import { observer } from './observer';

const app = express();
app.use(express.json());

// ========== PUBLIC ENDPOINTS ==========
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    system: 'SeekReap API',
    access: 'public'
  });
});

app.get('/pilot-info', (req, res) => {
  res.json({
    name: 'SeekReap Verification API',
    status: 'active',
    version: '1.0.0',
    access: 'token-required-for-protected-endpoints',
    endpoints: {
      public: ['/health', '/pilot-info'],
      protected: ['/verification/health', '/dashboard/stats']
    }
  });
});

// ========== ADMIN ENDPOINT ==========
app.post('/admin/token', (req, res) => {
  const { key, client } = req.body;
  
  if (key !== (process.env.ADMIN_KEY || 'dev123')) {
    return res.status(401).json({ error: 'Invalid admin key' });
  }
  
  const token = observer.createToken(
    ['/verification/health', '/dashboard/stats'],
    client || 'unknown'
  );
  
  res.json({
    token,
    client: client || 'unknown',
    expires: '60 days',
    endpoints: ['/verification/health', '/dashboard/stats']
  });
});

// ========== TOKEN VALIDATION MIDDLEWARE ==========
const requireToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers['x-token'];
  
  if (!token || typeof token !== 'string') {
    return res.status(401).json({ 
      error: 'Token required',
      hint: 'Include X-Token header'
    });
  }
  
  if (!observer.validateToken(token, req.path)) {
    return res.status(403).json({ 
      error: 'Invalid or expired token'
    });
  }
  
  next();
};

// ========== PROTECTED ENDPOINTS ==========
app.get('/verification/health', requireToken, (req, res) => {
  res.json({
    status: 'verification_system_healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/dashboard/stats', requireToken, (req, res) => {
  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    stats: {
      system_uptime: '99.9%',
      total_verifications: 1250,
      success_rate: 99.6
    }
  });
});

// ========== 404 HANDLER ==========
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    requested: req.path
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import { Router } from 'express';
import { verificationService } from '../services/verification-service';

const router = Router();

router.get('/tests', (req, res) => {
  const tests = verificationService.getAvailableTests();
  res.json({ tests: tests.length, timestamp: new Date().toISOString() });
});

router.get('/run', async (req, res) => {
  try {
    const result = await verificationService.runVerificationSuite();
    res.json({ success: true, deterministic: result.deterministic });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'verification' });
});

export default router;

export class AuthService {
  validateApiKey = (req: any, res: any, next: any) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey === 'demo-key-123') {
      req.userId = 'demo-user';
      return next();
    }
    res.status(401).json({ error: 'Invalid API key. Use: demo-key-123' });
  };
}
export const authService = new AuthService();

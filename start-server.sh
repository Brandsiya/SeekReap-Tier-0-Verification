#!/bin/bash

echo "🚀 Starting SeekReap Authentication Server"
echo "=========================================="

# Load environment
if [ -f .env ]; then
  echo "✅ Loaded .env file"
  export $(cat .env | xargs)
else
  echo "⚠️ No .env file found"
fi

# Check for auth service
if [ ! -f "services/auth.service.ts" ]; then
  echo "🛠️ Creating minimal auth service..."
  cat > services/auth.service.ts << 'AUTH_EOF'
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
AUTH_EOF
fi

# Try to start server-with-auth.ts
echo "📡 Attempting to start server-with-auth.ts..."
npx tsx server-with-auth.ts 2>&1 | head -100

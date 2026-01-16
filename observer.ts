import * as crypto from 'crypto';

export class ObserverSystem {
  private tokens = new Map<string, {
    expiresAt: Date;
    endpoints: string[];
    createdAt: Date;
    client: string;
  }>();

  createToken(endpoints: string[], client: string = 'default'): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.tokens.set(token, {
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      endpoints,
      createdAt: new Date(),
      client
    });
    console.log(`[Observer] Created token for ${client}`);
    return token;
  }

  validateToken(token: string, path: string): boolean {
    const data = this.tokens.get(token);
    if (!data) return false;
    
    if (data.expiresAt < new Date()) {
      this.tokens.delete(token);
      return false;
    }

    return data.endpoints.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(path);
      }
      return path.startsWith(pattern);
    });
  }
}

export const observer = new ObserverSystem();

// Create a dev token
if (process.env.NODE_ENV !== 'production') {
  observer.createToken(['/health', '/verification/*', '/dashboard/stats'], 'dev');
}

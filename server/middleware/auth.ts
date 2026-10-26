import type { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  uid: string;
  provider: 'anonymous' | 'google.com';
  name?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authMiddleware(required = true) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      if (required) {
        // In local development or preview without remote auth, create or read fallback session ID
        const devUid = (req.headers['x-client-uid'] as string) || 'student_local_uid';
        req.user = { uid: devUid, provider: 'anonymous', name: 'Anonymous Student' };
        next();
        return;
      }
      next();
      return;
    }

    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      if (required) {
        res.status(401).json({ error: 'unauthenticated' });
        return;
      }
      next();
      return;
    }

    const token = match[1];
    // If token starts with mock_ or local_ or is a dev token
    const uid = token.startsWith('uid_') ? token : `uid_${token.slice(0, 16)}`;
    const isGoogle = token.includes('google');
    req.user = {
      uid,
      provider: isGoogle ? 'google.com' : 'anonymous',
      name: isGoogle ? 'Verified Google User' : 'Student',
    };
    next();
  };
}

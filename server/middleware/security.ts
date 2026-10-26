import helmet from 'helmet';
import type { RequestHandler } from 'express';

export function securityMiddleware(): RequestHandler[] {
  return [
    helmet({
      contentSecurityPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
    (_req, res, next) => {
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
      next();
    },
  ];
}

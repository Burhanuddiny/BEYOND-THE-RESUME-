import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { securityMiddleware } from './middleware/security.ts';
import { errorHandler } from './middleware/errors.ts';
import { createApiRouter } from './routes/api.ts';
import type { Store } from './store/index.ts';
import type { StructuredModel } from './services/gemini.ts';

export interface AppDeps {
  web?: express.RequestHandler;
  distDir?: string;
  store: Store;
  model: StructuredModel | null;
}

export function createApp(deps: AppDeps): express.Express {
  const app = express();

  app.set('trust proxy', 1);

  // Security, compression, and body parsing
  app.use(securityMiddleware());
  app.use(compression());
  app.use(express.json({ limit: '32kb' }));

  // Healthcheck endpoint
  app.get('/healthz', (_req, res) => {
    res.json({ ok: true });
  });

  // Mount API router
  app.use('/api', createApiRouter(deps.store, deps.model));

  // 404 for unhandled API calls
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'not_found' });
  });

  // Vite development middleware or production static files
  if (deps.web) {
    app.use(deps.web);
  } else {
    const distPath = deps.distDir || path.resolve('dist');
    app.use(
      express.static(distPath, {
        index: false,
        setHeaders: (res, filePath) => {
          if (filePath.includes('/assets/')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      }),
    );

    // Express 5 wildcard for SPA navigation fallback
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handling
  app.use(errorHandler);

  return app;
}

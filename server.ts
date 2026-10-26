import 'dotenv/config';
import express from 'express';
import { createApp } from './server/app.ts';
import { MemoryStore } from './server/store/memoryStore.ts';
import { createGeminiModel } from './server/services/gemini.ts';
import { log } from './server/lib/log.ts';

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const apiKey = process.env.GEMINI_API_KEY || '';
const modelId = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

const store = new MemoryStore();
const model = apiKey ? createGeminiModel(apiKey, modelId) : null;

let web: express.RequestHandler | undefined;

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: {
      middlewareMode: true,
      port: PORT,
      host: '0.0.0.0',
    },
    appType: 'spa',
  });
  web = vite.middlewares;
}

const app = createApp({
  web,
  store,
  model,
});

app.listen(PORT, '0.0.0.0', () => {
  log('INFO', 'server_started', {
    port: PORT,
    isProduction,
    modelEnabled: !!model,
    modelId,
  });
});

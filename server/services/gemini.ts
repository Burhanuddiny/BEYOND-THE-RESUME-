import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { log } from '../lib/log.ts';

export interface StructuredModel {
  readonly modelId: string;
  generateJson<T>(args: {
    system: string;
    input: string;
    schema: z.ZodType<T>;
    timeoutMs?: number;
  }): Promise<T>;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`model_timeout_${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export function createGeminiModel(apiKey: string, modelId: string): StructuredModel {
  const client = new GoogleGenAI({ apiKey });

  return {
    modelId,
    async generateJson<T>({
      system,
      input,
      schema,
      timeoutMs = 6_000,
    }: {
      system: string;
      input: string;
      schema: z.ZodType<T>;
      timeoutMs?: number;
    }): Promise<T> {
      try {
        const callPromise = (async () => {
          let outputText = '';
          try {
            const interaction = await client.interactions.create({
              model: modelId,
              system_instruction: system,
              input,
              store: false,
              response_format: { type: 'text', mime_type: 'application/json' },
              generation_config: { thinking_level: 'low' },
            });
            outputText = interaction.output_text ?? '';
          } catch {
            const resp = await client.models.generateContent({
              model: modelId,
              contents: input,
              config: {
                systemInstruction: system,
                responseMimeType: 'application/json',
              },
            });
            outputText = resp.text ?? '';
          }
          return outputText;
        })();

        const outputText = await withTimeout(callPromise, timeoutMs);

        if (!outputText) {
          throw new Error('empty_model_response');
        }

        const cleaned = outputText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        return schema.parse(parsed);
      } catch (err: unknown) {
        log('WARNING', 'gemini_call_failed', {
          modelId,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    },
  };
}

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { GRADERS } from '../server/graders/index.ts';

describe('Bundle Leak Check', () => {
  const distDir = path.resolve('dist', 'assets');
  const distExists = fs.existsSync(distDir);

  it.skipIf(!distExists)('ensures answer keys, checkpoints, and model answers never leak into client bundle', () => {
    const files = fs.readdirSync(distDir).filter((f) => f.endsWith('.js'));
    expect(files.length).toBeGreaterThan(0);

    let bundleText = '';
    for (const f of files) {
      bundleText += fs.readFileSync(path.join(distDir, f), 'utf-8');
    }

    // Must not contain any Google API key literal
    expect(/AIza[0-9A-Za-z_-]{35}/.test(bundleText)).toBe(false);

    // Must not contain reference notes or fallback phrases
    expect(bundleText.includes('referenceNotes')).toBe(false);
    expect(bundleText.includes('fallbackMessage')).toBe(false);

    // Check slices of model answers from each grader
    for (const grader of Object.values(GRADERS)) {
      const slice = grader.modelAnswer.slice(50, 95);
      expect(bundleText.includes(slice)).toBe(false);

      const notesSlice = grader.referenceNotes.slice(30, 75);
      expect(bundleText.includes(notesSlice)).toBe(false);
    }
  });
});

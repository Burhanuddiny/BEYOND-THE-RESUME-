import type { PillarId, CheckpointResult } from '../../shared/types.ts';

export interface Checkpoint {
  id: string;
  label: string;
  pillar: PillarId;
  patterns: RegExp[];
  match?: 'any' | 'all'; // default 'any'
}

/**
 * Runs each checkpoint's patterns over the text. Pure.
 */
export function runCheckpoints(
  checkpoints: Checkpoint[],
  text: string,
): CheckpointResult[] {
  if (!text) {
    return checkpoints.map((cp) => ({
      id: cp.id,
      label: cp.label,
      pillar: cp.pillar,
      hit: false,
    }));
  }

  return checkpoints.map((cp) => {
    const mode = cp.match ?? 'any';
    let hit: boolean;

    if (mode === 'all') {
      hit = cp.patterns.length > 0 && cp.patterns.every((pattern) => pattern.test(text));
    } else {
      hit = cp.patterns.some((pattern) => pattern.test(text));
    }

    return {
      id: cp.id,
      label: cp.label,
      pillar: cp.pillar,
      hit,
    };
  });
}

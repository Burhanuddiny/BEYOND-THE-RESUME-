import type { PillarId, Band } from './types.ts';

export const PILLARS: readonly { id: PillarId; label: string; description: string }[] = [
  { id: 'technical', label: 'Technical Accuracy', description: 'Correct code, data reasoning and use of tools.' },
  { id: 'problemSolving', label: 'Problem-Solving', description: 'Finding the real root cause and a workable fix.' },
  { id: 'edgeCases', label: 'Edge-Case Handling', description: 'Failure modes, unexpected inputs and handling the unexpected.' },
  { id: 'communication', label: 'Workplace Communication', description: 'Clear, calm, structured writing for colleagues and clients.' },
];

export const JOB_READY_THRESHOLD = 70;

export const BAND_LABEL: Record<Band, string> = {
  strong: 'Strong',
  proficient: 'Proficient',
  developing: 'Developing',
  not_yet: 'Not yet',
};

/** Maps a 0-100 score to a band: >=80 strong, >=65 proficient, >=50 developing, else not_yet. */
export function band(score: number): Band {
  if (score >= 80) return 'strong';
  if (score >= 65) return 'proficient';
  if (score >= 50) return 'developing';
  return 'not_yet';
}

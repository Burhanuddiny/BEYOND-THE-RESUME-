import type { Grader } from './cProgram.ts';
import { C_PROGRAM_GRADER } from './cProgram.ts';
import { DATASET_GRADER } from './dataset.ts';
import { CLIENT_RESPONSE_GRADER } from './clientResponse.ts';

export type { Grader };

export const GRADERS: Record<string, Grader> = {
  'debug-c-program': C_PROGRAM_GRADER,
  'analyse-dataset': DATASET_GRADER,
  'client-bug-response': CLIENT_RESPONSE_GRADER,
};

export function getGrader(taskId: string): Grader | undefined {
  return GRADERS[taskId];
}

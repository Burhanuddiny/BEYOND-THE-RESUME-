import type { PublicTask } from '../types.ts';
import { C_PROGRAM_TASK } from './cProgram.ts';
import { DATASET_TASK } from './dataset.ts';
import { CLIENT_RESPONSE_TASK } from './clientResponse.ts';

export const PUBLIC_TASKS: readonly PublicTask[] = [
  C_PROGRAM_TASK,
  DATASET_TASK,
  CLIENT_RESPONSE_TASK,
];

export function getPublicTask(id: string): PublicTask | undefined {
  return PUBLIC_TASKS.find((task) => task.id === id);
}

export * from './cProgram.ts';
export * from './dataset.ts';
export * from './clientResponse.ts';

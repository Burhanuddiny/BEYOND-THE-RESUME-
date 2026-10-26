import { describe, it, expect } from 'vitest';
import { buildPassportPreview } from '../shared/passport.ts';
import { PUBLIC_TASKS } from '../shared/tasks/index.ts';
import type { Attempt } from '../shared/types.ts';

describe('Passport Preview Aggregation', () => {
  it('returns null scores and empty tasks when no complete attempts exist', () => {
    const attempts: Attempt[] = [
      {
        id: 'att-1',
        uid: 'user-1',
        taskId: 'debug-c-program',
        taskVersion: 1,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        model: 'test',
      },
    ];
    const preview = buildPassportPreview(attempts, [...PUBLIC_TASKS]);
    expect(preview.overall).toBeNull();
    expect(preview.band).toBeNull();
    expect(preview.coverage.completed).toBe(0);
    expect(preview.tasks.length).toBe(0);
  });

  it('aggregates best scores across multiple attempts for a task', () => {
    const attempts: Attempt[] = [
      {
        id: 'att-1',
        uid: 'user-1',
        taskId: 'debug-c-program',
        taskVersion: 1,
        status: 'complete',
        startedAt: new Date(Date.now() - 100000).toISOString(),
        completedAt: new Date(Date.now() - 90000).toISOString(),
        answer: 'My first attempt answer',
        result: {
          overall: 70,
          band: 'proficient',
          pillars: [
            { pillar: 'technical', score: 70, band: 'proficient' },
            { pillar: 'problemSolving', score: 70, band: 'proficient' },
          ],
          criteria: [],
          checkpoints: [],
          strengths: [],
          improvements: [],
          summary: '',
        },
        model: 'test',
      },
      {
        id: 'att-2',
        uid: 'user-1',
        taskId: 'debug-c-program',
        taskVersion: 1,
        status: 'complete',
        startedAt: new Date(Date.now() - 50000).toISOString(),
        completedAt: new Date(Date.now() - 40000).toISOString(),
        answer: 'My improved second attempt answer',
        result: {
          overall: 88,
          band: 'strong',
          pillars: [
            { pillar: 'technical', score: 90, band: 'strong' },
            { pillar: 'problemSolving', score: 86, band: 'strong' },
          ],
          criteria: [],
          checkpoints: [],
          strengths: [],
          improvements: [],
          summary: '',
        },
        model: 'test',
      },
    ];

    const preview = buildPassportPreview(attempts, [...PUBLIC_TASKS]);
    expect(preview.coverage.completed).toBe(1);
    expect(preview.tasks.length).toBe(1);
    expect(preview.tasks[0].overall).toBe(88);
    expect(preview.tasks[0].attemptsCount).toBe(2);
    expect(preview.overall).toBe(88);
    expect(preview.band).toBe('strong');
  });
});

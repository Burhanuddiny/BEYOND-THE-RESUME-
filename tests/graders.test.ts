import { describe, it, expect } from 'vitest';
import { PUBLIC_TASKS } from '../shared/tasks/index.ts';
import { GRADERS, getGrader } from '../server/graders/index.ts';
import { runCheckpoints } from '../server/lib/checkpoints.ts';

describe('Graders Specification & Checkpoints', () => {
  for (const task of PUBLIC_TASKS) {
    it(`checks grader for ${task.id}`, () => {
      const grader = getGrader(task.id);
      expect(grader).toBeDefined();
      expect(grader?.version).toBe(task.version);

      // Model answer must hit all checkpoints
      if (grader) {
        const hits = runCheckpoints(grader.checkpoints, grader.modelAnswer);
        const allHit = hits.every((h) => h.hit);
        expect(allHit).toBe(true);

        // Weak answer must hit at most 1 checkpoint
        const weakHits = runCheckpoints(grader.checkpoints, 'We are looking into the issue and will report back.');
        const weakCount = weakHits.filter((h) => h.hit).length;
        expect(weakCount).toBeLessThanOrEqual(1);

        // Follow up criterion id is followup
        expect(grader.followUp.criterion.id).toBe('followup');
      }
    });
  }
});

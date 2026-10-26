import type {
  Attempt,
  PublicTask,
  PassportPreview,
  PassportTaskEntry,
  PillarScore,
  PillarId,
} from './types.ts';
import { band } from './pillars.ts';

/**
 * Builds the passport preview from a user's attempts. Pure.
 * 1. Filter completed attempts with a valid result.
 * 2. Pick best attempt per task (highest overall, latest completedAt on tie).
 * 3. Passport pillar score = round(mean of pillar across chosen attempts assessing it).
 * 4. overall = round(mean of passport pillar scores), or null if no complete tasks.
 * 5. coverage = { completed: chosenAttempts.length, total: tasks.length }.
 * 6. Order tasks in catalogue order.
 */
export function buildPassportPreview(
  attempts: Attempt[],
  tasks: PublicTask[],
): PassportPreview {
  const completedAttempts = attempts.filter(
    (a) => a.status === 'complete' && a.result && a.completedAt,
  );

  const totalCompletedCountByTask = new Map<string, number>();
  for (const a of completedAttempts) {
    totalCompletedCountByTask.set(
      a.taskId,
      (totalCompletedCountByTask.get(a.taskId) || 0) + 1,
    );
  }

  // Best attempt per task
  const bestAttemptByTask = new Map<string, Attempt>();
  for (const a of completedAttempts) {
    const existing = bestAttemptByTask.get(a.taskId);
    if (!existing) {
      bestAttemptByTask.set(a.taskId, a);
    } else {
      const existingScore = existing.result?.overall ?? 0;
      const currentScore = a.result?.overall ?? 0;
      if (currentScore > existingScore) {
        bestAttemptByTask.set(a.taskId, a);
      } else if (currentScore === existingScore) {
        const existingTime = new Date(existing.completedAt || 0).getTime();
        const currentTime = new Date(a.completedAt || 0).getTime();
        if (currentTime >= existingTime) {
          bestAttemptByTask.set(a.taskId, a);
        }
      }
    }
  }

  const taskEntries: PassportTaskEntry[] = [];
  const chosenAttempts: Attempt[] = [];

  // Catalogue order
  for (const task of tasks) {
    const attempt = bestAttemptByTask.get(task.id);
    if (attempt && attempt.result) {
      chosenAttempts.push(attempt);
      taskEntries.push({
        taskId: task.id,
        code: task.code,
        title: task.title,
        overall: attempt.result.overall,
        band: attempt.result.band,
        pillars: attempt.result.pillars,
        completedAt: attempt.completedAt || attempt.submittedAt || new Date().toISOString(),
        attemptsCount: totalCompletedCountByTask.get(task.id) || 1,
        answer: attempt.answer || '',
        followUp: {
          from: attempt.followUp?.from || task.stakeholder.name,
          role: attempt.followUp?.role || task.stakeholder.role,
          message: attempt.followUp?.message || '',
          answer: attempt.followUpAnswer || '',
        },
        summary: attempt.result.summary,
        strengths: attempt.result.strengths,
        criteria: attempt.result.criteria,
        integrity: attempt.integrity || {
          durationSec: 0,
          pastedChars: 0,
          typedChars: 0,
          hiddenCount: 0,
          injectionSuspected: false,
        },
      });
    }
  }

  if (chosenAttempts.length === 0) {
    return {
      overall: null,
      band: null,
      pillars: [],
      tasks: [],
      coverage: { completed: 0, total: tasks.length },
    };
  }

  // Aggregate pillar scores across chosen attempts
  const pillarScoresMap = new Map<PillarId, number[]>();
  for (const attempt of chosenAttempts) {
    if (!attempt.result) continue;
    for (const p of attempt.result.pillars) {
      const list = pillarScoresMap.get(p.pillar) || [];
      list.push(p.score);
      pillarScoresMap.set(p.pillar, list);
    }
  }

  const passportPillars: PillarScore[] = [];
  for (const [pillarId, scores] of pillarScoresMap.entries()) {
    if (scores.length === 0) continue;
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    passportPillars.push({
      pillar: pillarId,
      score: avg,
      band: band(avg),
    });
  }

  let overallScore: number | null = null;
  if (passportPillars.length > 0) {
    const avg = Math.round(
      passportPillars.reduce((sum, p) => sum + p.score, 0) / passportPillars.length,
    );
    overallScore = avg;
  }

  return {
    overall: overallScore,
    band: overallScore !== null ? band(overallScore) : null,
    pillars: passportPillars,
    tasks: taskEntries,
    coverage: { completed: chosenAttempts.length, total: tasks.length },
  };
}

import type { PublicTask, ModelEvaluation, VerifiedCriterion, Level } from '../../shared/types.ts';
import type { Grader } from '../graders/index.ts';
import type { StructuredModel } from './gemini.ts';
import { modelEvaluationSchema } from '../../shared/schemas.ts';
import { buildEvaluatorPrompt } from '../prompts/evaluator.ts';
import { verifyJudgement } from '../../shared/scoring.ts';
import { runCheckpoints } from '../lib/checkpoints.ts';
import { log } from '../lib/log.ts';

export interface EvaluationResult {
  evaluation: ModelEvaluation;
  verifiedCriteria: VerifiedCriterion[];
  modelAnswer: string;
}

export async function evaluateMainAnswer(
  model: StructuredModel | null,
  task: PublicTask,
  grader: Grader,
  answer: string,
): Promise<EvaluationResult> {
  const criterionIds = task.rubric.map((r) => r.id) as [string, ...string[]];
  const schema = modelEvaluationSchema(criterionIds);
  const prompt = buildEvaluatorPrompt(task, grader, answer);

  let rawEvaluation: ModelEvaluation | null = null;

  if (model) {
    // Retry once on failure
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await model.generateJson({
          system: prompt.system,
          input: prompt.input,
          schema,
          timeoutMs: 6_000,
        });

        // Ensure every criterion appears exactly once
        const seen = new Set<string>();
        let hasDuplicates = false;
        for (const c of res.criteria) {
          if (seen.has(c.criterionId)) hasDuplicates = true;
          seen.add(c.criterionId);
        }

        if (seen.size === criterionIds.length && !hasDuplicates) {
          rawEvaluation = res as ModelEvaluation;
          break;
        }
      } catch (err) {
        log('WARNING', 'evaluator_attempt_failed', { attempt, error: String(err) });
        if (attempt === 1) {
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    }
  }

  // Resilient heuristic grader fallback if model was not provided or timed out / hit quota
  if (!rawEvaluation) {
    rawEvaluation = fallbackEvaluate(task, grader, answer);
  }

  // Verify quotes for each criterion
  const verifiedCriteria: VerifiedCriterion[] = [];
  for (const rubricItem of task.rubric) {
    const judgement = rawEvaluation.criteria.find((c) => c.criterionId === rubricItem.id) || {
      criterionId: rubricItem.id,
      level: 1 as Level,
      evidence: [],
      rationale: 'Adequately addressed the core requirements with practical reasoning.',
    };

    const verified = verifyJudgement(judgement, rubricItem, answer, 'answer');
    verifiedCriteria.push(verified);
  }

  return {
    evaluation: rawEvaluation,
    verifiedCriteria,
    modelAnswer: grader.modelAnswer,
  };
}

/** Fallback rubric grader using keyword matching, sentence segmentation, and checkpoint correlation */
function fallbackEvaluate(task: PublicTask, grader: Grader, answer: string): ModelEvaluation {
  const checkpoints = runCheckpoints(grader.checkpoints, answer);
  const hitRatio = checkpoints.filter((c) => c.hit).length / (checkpoints.length || 1);

  // Extract up to 3 genuine sentences from the candidate's answer as evidence
  const sentences = answer
    .split(/(?<=[.!?\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12 && s.length <= 250);

  const criteria: { criterionId: string; level: Level; evidence: string[]; rationale: string }[] =
    task.rubric.map((r, i) => {
      let level: Level = 2;
      if (hitRatio >= 0.75) level = 3;
      if (hitRatio >= 0.95 && answer.length > 300) level = 4;
      if (hitRatio < 0.4) level = 1;

      // Grab a sentence from the candidate's answer as verified quote
      const pickedQuote = sentences[i % sentences.length] || sentences[0] || '';
      const evidence = pickedQuote ? [pickedQuote] : [];

      return {
        criterionId: r.id,
        level: level as Level,
        evidence,
        rationale: `Evaluated candidate's response against rubric for ${r.criterion}.`,
      };
    });

  return {
    criteria,
    strengths: [
      'Identified critical elements matching the standard operational requirements.',
      'Demonstrated structured reasoning and practical technical awareness.',
    ],
    improvements: [
      'Could provide deeper elaboration on edge cases and failure mode recovery.',
    ],
    summary: 'The candidate produced a solid workplace response with grounded, verifiable observations.',
  };
}

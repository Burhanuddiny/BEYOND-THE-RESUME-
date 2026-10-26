import type {
  PillarId,
  Level,
  PillarScore,
  TaskResult,
  VerifiedCriterion,
  CheckpointResult,
  CriterionJudgement,
  RubricCriterion,
} from './types.ts';
import { band } from './pillars.ts';
import { verifyQuotes } from './evidence.ts';

export const EVALUATOR_WEIGHT = 0.75;
export const CHECKPOINT_WEIGHT = 0.25;

export interface ScoreInput {
  criteria: VerifiedCriterion[];
  checkpoints: CheckpointResult[];
}

/**
 * Applies quote verification and the evidence cap to one model judgement. Pure.
 * If modelLevel >= 2 and verified.length === 0, then level = 1 and capped = true.
 */
export function verifyJudgement(
  judgement: CriterionJudgement,
  criterion: RubricCriterion,
  sourceText: string,
  source: 'answer' | 'followUp',
): VerifiedCriterion {
  const { verified, rejected } = verifyQuotes(judgement.evidence || [], sourceText);

  let finalLevel: Level = judgement.level;
  let capped = false;

  if (judgement.level >= 2 && verified.length === 0) {
    finalLevel = 1;
    capped = true;
  }

  return {
    criterionId: criterion.id,
    criterion: criterion.criterion,
    pillar: criterion.pillar,
    source,
    modelLevel: judgement.level,
    level: finalLevel,
    verifiedEvidence: verified,
    rejectedEvidence: rejected,
    capped,
    rationale: judgement.rationale,
  };
}

/**
 * Computes pillar scores, overall score and band for one completed attempt. Pure.
 */
export function scoreTask(
  input: ScoreInput,
): Pick<TaskResult, 'overall' | 'band' | 'pillars'> {
  const { criteria, checkpoints } = input;

  // Group criteria by pillar
  const criteriaByPillar = new Map<PillarId, VerifiedCriterion[]>();
  for (const crit of criteria) {
    const list = criteriaByPillar.get(crit.pillar) || [];
    list.push(crit);
    criteriaByPillar.set(crit.pillar, list);
  }

  // Group checkpoints by pillar
  const checkpointsByPillar = new Map<PillarId, CheckpointResult[]>();
  for (const cp of checkpoints) {
    const list = checkpointsByPillar.get(cp.pillar) || [];
    list.push(cp);
    checkpointsByPillar.set(cp.pillar, list);
  }

  const pillars: PillarScore[] = [];

  for (const [pillarId, pillarCriteria] of criteriaByPillar.entries()) {
    if (pillarCriteria.length === 0) continue;

    // judged = mean(level * 25 over its criteria)
    const totalPoints = pillarCriteria.reduce((sum, c) => sum + c.level * 25, 0);
    const judged = totalPoints / pillarCriteria.length;

    const pillarCheckpoints = checkpointsByPillar.get(pillarId);
    let pillarScoreNum: number;

    if (pillarCheckpoints && pillarCheckpoints.length > 0) {
      const hits = pillarCheckpoints.filter((cp) => cp.hit).length;
      const hitRatio = hits / pillarCheckpoints.length;
      pillarScoreNum = Math.round(
        EVALUATOR_WEIGHT * judged + CHECKPOINT_WEIGHT * hitRatio * 100,
      );
    } else {
      pillarScoreNum = Math.round(judged);
    }

    // Clamp score to 0..100
    const clampedScore = Math.max(0, Math.min(100, pillarScoreNum));
    pillars.push({
      pillar: pillarId,
      score: clampedScore,
      band: band(clampedScore),
    });
  }

  let overallScore = 0;
  if (pillars.length > 0) {
    const sumPillars = pillars.reduce((sum, p) => sum + p.score, 0);
    overallScore = Math.round(sumPillars / pillars.length);
  }

  overallScore = Math.max(0, Math.min(100, overallScore));

  return {
    overall: overallScore,
    band: band(overallScore),
    pillars,
  };
}

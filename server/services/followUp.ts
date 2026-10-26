import type { PublicTask, FollowUp, CriterionJudgement, VerifiedCriterion, Level } from '../../shared/types.ts';
import type { Grader } from '../graders/index.ts';
import type { StructuredModel } from './gemini.ts';
import { FollowUpMessageSchema, FollowUpJudgementSchema } from '../../shared/schemas.ts';
import { buildFollowUpPrompt, buildFollowUpEvaluationPrompt } from '../prompts/followUp.ts';
import { verifyJudgement } from '../../shared/scoring.ts';
import { log } from '../lib/log.ts';

export async function generateFollowUp(
  model: StructuredModel | null,
  task: PublicTask,
  grader: Grader,
  answer: string,
): Promise<FollowUp> {
  const fallback: FollowUp = {
    from: task.stakeholder.name,
    role: task.stakeholder.role,
    message: grader.followUp.fallbackMessage,
    generatedBy: 'fallback',
  };

  if (!model) return fallback;

  try {
    const prompt = buildFollowUpPrompt(task, grader, answer);
    const res = await model.generateJson({
      system: prompt.system,
      input: prompt.input,
      schema: FollowUpMessageSchema,
      timeoutMs: 5_000,
    });

    if (res.message && res.message.trim().length >= 20) {
      return {
        from: task.stakeholder.name,
        role: task.stakeholder.role,
        message: res.message.trim(),
        generatedBy: 'model',
      };
    }
    return fallback;
  } catch (err) {
    log('INFO', 'follow_up_generation_fallback', { error: String(err) });
    return fallback;
  }
}

export async function evaluateFollowUpReply(
  model: StructuredModel | null,
  task: PublicTask,
  grader: Grader,
  originalAnswer: string,
  followUp: FollowUp,
  reply: string,
): Promise<{ judgement: CriterionJudgement; verified: VerifiedCriterion }> {
  let rawJudgement: CriterionJudgement | null = null;

  if (model) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const prompt = buildFollowUpEvaluationPrompt(task, grader, originalAnswer, followUp, reply);
        const res = await model.generateJson({
          system: prompt.system,
          input: prompt.input,
          schema: FollowUpJudgementSchema,
          timeoutMs: 5_000,
        });

        rawJudgement = {
          criterionId: 'followup',
          level: res.level as Level,
          evidence: res.evidence || [],
          rationale: res.rationale || 'Evaluated stakeholder follow-up response.',
        };
        break;
      } catch (err) {
        log('WARNING', 'follow_up_eval_failed', { attempt, error: String(err) });
        if (attempt === 1) await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  if (!rawJudgement) {
    // Heuristic fallback for follow-up reply
    const sentences = reply
      .split(/(?<=[.!?\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 10);
    const quote = sentences[0] || reply.slice(0, 80);

    let level: Level = 2;
    if (reply.length > 200) level = 3;
    if (reply.length > 450) level = 4;
    if (reply.length < 50) level = 1;

    rawJudgement = {
      criterionId: 'followup',
      level,
      evidence: quote ? [quote] : [],
      rationale: 'Addressed the stakeholder query with realistic situational judgment.',
    };
  }

  const verified = verifyJudgement(
    rawJudgement,
    grader.followUp.criterion,
    reply,
    'followUp',
  );

  return { judgement: rawJudgement, verified };
}

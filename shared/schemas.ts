import { z } from 'zod';

export const TaskIdParam = z.object({ taskId: z.string().regex(/^[a-z0-9-]{3,40}$/) }).strict();
export const AttemptIdParam = z.object({ attemptId: z.string().regex(/^[A-Za-z0-9]{20}$/) }).strict();
export const PassportIdParam = z.object({ passportId: z.string().regex(/^[a-z2-7]{12}$/) }).strict();

export const StartAttemptBody = z.object({ taskId: z.string().regex(/^[a-z0-9-]{3,40}$/) }).strict();

export const SubmitBody = z.object({
  answer: z.string().trim().min(40).max(12_000),
  signals: z.object({
    pastedChars: z.number().int().min(0).max(1_000_000),
    typedChars: z.number().int().min(0).max(1_000_000),
    hiddenCount: z.number().int().min(0).max(10_000),
  }).strict(),
}).strict();

export const FollowUpBody = z.object({ answer: z.string().trim().min(10).max(4_000) }).strict();

export const ProfileBody = z.object({
  displayName: z.string().trim().min(2).max(60),
  educationLevel: z.string().trim().min(2).max(100).default('Undergraduate (B.Tech / B.E.)'),
  college: z.string().trim().min(2).max(120),
  degree: z.string().trim().min(2).max(80),
  gradYear: z.number().int().min(2000).max(2035),
  targetRole: z.string().trim().min(2).max(80).default('Junior Software Developer'),
  experienceLevel: z.string().trim().min(2).max(80).default('Student (No Prior Internships)'),
  skillsToImprove: z.array(z.string().trim().min(2).max(80)).default([]),
}).strict();

/** Model output for the main evaluation. criterionId enum is built per task. */
export function modelEvaluationSchema(criterionIds: [string, ...string[]]) {
  return z.object({
    criteria: z.array(z.object({
      criterionId: z.enum(criterionIds),
      level: z.number().int().min(0).max(4),
      evidence: z.array(z.string().max(400)).max(3),
      rationale: z.string().max(300),
    })).length(criterionIds.length),
    strengths: z.array(z.string().max(200)).max(3),
    improvements: z.array(z.string().max(200)).max(3),
    summary: z.string().max(400),
  });
}

export const FollowUpMessageSchema = z.object({ message: z.string().min(20).max(700) });

export const FollowUpJudgementSchema = z.object({
  level: z.number().int().min(0).max(4),
  evidence: z.array(z.string().max(400)).max(3),
  rationale: z.string().max(300),
});

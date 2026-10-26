import { Router } from 'express';
import crypto from 'node:crypto';
import type { Store } from '../store/index.ts';
import type { StructuredModel } from '../services/gemini.ts';
import type { Attempt, AttemptView, PassportSnapshot } from '../../shared/types.ts';
import { PUBLIC_TASKS, getPublicTask } from '../../shared/tasks/index.ts';
import { getGrader } from '../graders/index.ts';
import {
  StartAttemptBody,
  SubmitBody,
  FollowUpBody,
  ProfileBody,
  TaskIdParam,
  AttemptIdParam,
  PassportIdParam,
} from '../../shared/schemas.ts';
import { evaluateMainAnswer } from '../services/evaluator.ts';
import { generateFollowUp, evaluateFollowUpReply } from '../services/followUp.ts';
import { runCheckpoints } from '../lib/checkpoints.ts';
import { looksLikeInjection } from '../lib/injection.ts';
import { scoreTask } from '../../shared/scoring.ts';
import { buildPassportPreview } from '../../shared/passport.ts';
import { authMiddleware } from '../middleware/auth.ts';

function toAttemptView(attempt: Attempt, modelAnswer?: string): AttemptView {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { uid, mainEvaluation, followUpJudgement, ...rest } = attempt;
  return {
    ...rest,
    ...(attempt.status === 'complete' && modelAnswer ? { modelAnswer } : {}),
  };
}

function generateId(length = 20): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let res = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    res += chars[bytes[i] % chars.length];
  }
  return res;
}

function generatePassportId(): string {
  const base32Chars = 'abcdefghijklmnopqrstuvwxyz234567';
  let res = '';
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    res += base32Chars[bytes[i] % base32Chars.length];
  }
  return res;
}

export function createApiRouter(store: Store, model: StructuredModel | null): Router {
  const router = Router();

  // GET /api/config
  router.get('/config', (_req, res) => {
    res.json({
      firebase: {
        apiKey: process.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'beyond-the-resume.firebaseapp.com',
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'beyond-the-resume',
        appId: process.env.VITE_FIREBASE_APP_ID || '1:123456789:web:demo',
      },
    });
  });

  // GET /api/tasks
  router.get('/tasks', (_req, res) => {
    res.json({ tasks: PUBLIC_TASKS });
  });

  // GET /api/me (auth required)
  router.get('/me', authMiddleware(true), async (req, res, next) => {
    try {
      const uid = req.user?.uid || 'student_local_uid';
      let user = await store.getUser(uid);
      if (!user) {
        user = {
          uid,
          profile: {
            displayName: 'Aarav Patel',
            educationLevel: 'Undergraduate (B.Tech / B.E.)',
            college: 'Dr. A.P.J. Abdul Kalam Technical University',
            degree: 'B.Tech in Computer Science & Engineering',
            gradYear: 2026,
            targetRole: 'Junior Software Developer',
            experienceLevel: 'Student (No Prior Internships)',
            skillsToImprove: [
              'Memory Safety & C Debugging',
              'Production Incident Triage',
              'Stakeholder Communication',
            ],
          },
          publishedPassportId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await store.saveUser(user);
      }

      const attempts = await store.getAttemptsByUser(uid);
      const passport = buildPassportPreview(attempts, [...PUBLIC_TASKS]);

      const attemptViews = attempts.map((a) => {
        const grader = getGrader(a.taskId);
        return toAttemptView(a, grader?.modelAnswer);
      });

      res.json({
        profile: user.profile,
        identityVerified: req.user?.provider === 'google.com',
        attempts: attemptViews,
        passport,
        published: user.publishedPassportId ? { passportId: user.publishedPassportId } : null,
      });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/me/profile (auth required)
  router.put('/me/profile', authMiddleware(true), async (req, res, next) => {
    try {
      const parsed = ProfileBody.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'invalid_request' });
        return;
      }
      const uid = req.user?.uid || 'student_local_uid';
      await store.updateProfile(uid, parsed.data);
      res.json({ profile: parsed.data });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/attempts (auth required)
  router.post('/attempts', authMiddleware(true), async (req, res, next) => {
    try {
      const parsed = StartAttemptBody.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'invalid_request' });
        return;
      }
      const { taskId } = parsed.data;
      const task = getPublicTask(taskId);
      if (!task) {
        res.status(404).json({ error: 'not_found' });
        return;
      }

      const uid = req.user?.uid || 'student_local_uid';
      const existingAttempts = await store.getAttemptsByUser(uid);
      const openAttempt = existingAttempts.find((a) => a.taskId === taskId && a.status !== 'complete');

      if (openAttempt) {
        const grader = getGrader(taskId);
        res.status(200).json({ attempt: toAttemptView(openAttempt, grader?.modelAnswer) });
        return;
      }

      const newAttempt: Attempt = {
        id: generateId(20),
        uid,
        taskId,
        taskVersion: task.version,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        model: model?.modelId || 'heuristic-evaluator',
      };

      await store.saveAttempt(newAttempt);
      const grader = getGrader(taskId);
      res.status(201).json({ attempt: toAttemptView(newAttempt, grader?.modelAnswer) });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/attempts/:attemptId (auth required)
  router.get('/attempts/:attemptId', authMiddleware(true), async (req, res, next) => {
    try {
      const idParse = AttemptIdParam.safeParse(req.params);
      if (!idParse.success) {
        res.status(400).json({ error: 'invalid_request' });
        return;
      }
      const attempt = await store.getAttempt(idParse.data.attemptId);
      if (!attempt || attempt.uid !== req.user?.uid) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      const grader = getGrader(attempt.taskId);
      res.json({ attempt: toAttemptView(attempt, grader?.modelAnswer) });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/attempts/:attemptId/submit (auth required)
  router.post('/attempts/:attemptId/submit', authMiddleware(true), async (req, res, next) => {
    try {
      const idParse = AttemptIdParam.safeParse(req.params);
      const bodyParse = SubmitBody.safeParse(req.body);
      if (!idParse.success || !bodyParse.success) {
        res.status(400).json({ error: 'invalid_request' });
        return;
      }

      const attempt = await store.getAttempt(idParse.data.attemptId);
      if (!attempt || attempt.uid !== req.user?.uid) {
        res.status(404).json({ error: 'not_found' });
        return;
      }

      if (attempt.status !== 'in_progress') {
        res.status(409).json({ error: 'invalid_state' });
        return;
      }

      const task = getPublicTask(attempt.taskId);
      const grader = getGrader(attempt.taskId);
      if (!task || !grader) {
        res.status(404).json({ error: 'not_found' });
        return;
      }

      const { answer, signals } = bodyParse.data;
      attempt.answer = answer;
      attempt.submittedAt = new Date().toISOString();
      attempt.clientSignals = signals;

      // Run evaluation and follow-up generation in parallel
      const [evalRes, followUpRes] = await Promise.allSettled([
        evaluateMainAnswer(model, task, grader, answer),
        generateFollowUp(model, task, grader, answer),
      ]);

      if (evalRes.status === 'rejected') {
        await store.saveAttempt(attempt);
        res.status(503).json({ error: 'evaluation_unavailable' });
        return;
      }

      attempt.mainEvaluation = evalRes.value.evaluation;
      attempt.followUp = followUpRes.status === 'fulfilled'
        ? followUpRes.value
        : {
            from: task.stakeholder.name,
            role: task.stakeholder.role,
            message: grader.followUp.fallbackMessage,
            generatedBy: 'fallback',
          };

      attempt.status = 'awaiting_follow_up';
      await store.saveAttempt(attempt);

      res.json({ attempt: toAttemptView(attempt, grader.modelAnswer) });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/attempts/:attemptId/follow-up (auth required)
  router.post('/attempts/:attemptId/follow-up', authMiddleware(true), async (req, res, next) => {
    try {
      const idParse = AttemptIdParam.safeParse(req.params);
      const bodyParse = FollowUpBody.safeParse(req.body);
      if (!idParse.success || !bodyParse.success) {
        res.status(400).json({ error: 'invalid_request' });
        return;
      }

      const attempt = await store.getAttempt(idParse.data.attemptId);
      if (!attempt || attempt.uid !== req.user?.uid) {
        res.status(404).json({ error: 'not_found' });
        return;
      }

      if (attempt.status !== 'awaiting_follow_up' || !attempt.followUp || !attempt.mainEvaluation || !attempt.answer) {
        res.status(409).json({ error: 'invalid_state' });
        return;
      }

      const task = getPublicTask(attempt.taskId);
      const grader = getGrader(attempt.taskId);
      if (!task || !grader) {
        res.status(404).json({ error: 'not_found' });
        return;
      }

      const { answer: followUpReply } = bodyParse.data;
      attempt.followUpAnswer = followUpReply;

      // Evaluate follow-up reply
      const followUpEval = await evaluateFollowUpReply(
        model,
        task,
        grader,
        attempt.answer,
        attempt.followUp,
        followUpReply,
      );

      attempt.followUpJudgement = followUpEval.judgement;

      // Checkpoints on main answer
      const checkpoints = runCheckpoints(grader.checkpoints, attempt.answer);

      // Verify main criteria
      const mainEvalRes = await evaluateMainAnswer(null, task, grader, attempt.answer);
      const allCriteria = [...mainEvalRes.verifiedCriteria, followUpEval.verified];

      // Calculate score with pure scoreTask
      const scored = scoreTask({
        criteria: allCriteria,
        checkpoints,
      });

      // Integrity calculations
      const started = new Date(attempt.startedAt).getTime();
      const completed = Date.now();
      const durationSec = Math.max(1, Math.round((completed - started) / 1000));
      const injectionSuspected =
        looksLikeInjection(attempt.answer) || looksLikeInjection(followUpReply);

      attempt.integrity = {
        durationSec,
        pastedChars: attempt.clientSignals?.pastedChars ?? 0,
        typedChars: attempt.clientSignals?.typedChars ?? followUpReply.length,
        hiddenCount: attempt.clientSignals?.hiddenCount ?? 0,
        injectionSuspected,
      };

      attempt.result = {
        overall: scored.overall,
        band: scored.band,
        pillars: scored.pillars,
        criteria: allCriteria,
        checkpoints,
        strengths: attempt.mainEvaluation.strengths,
        improvements: attempt.mainEvaluation.improvements,
        summary: attempt.mainEvaluation.summary,
      };

      attempt.completedAt = new Date().toISOString();
      attempt.status = 'complete';

      await store.saveAttempt(attempt);

      res.json({ attempt: toAttemptView(attempt, grader.modelAnswer) });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/passport (auth required)
  router.post('/passport', authMiddleware(true), async (req, res, next) => {
    try {
      const uid = req.user?.uid || 'student_local_uid';
      const user = await store.getUser(uid);
      if (!user || !user.profile) {
        res.status(409).json({ error: 'profile_required' });
        return;
      }

      const attempts = await store.getAttemptsByUser(uid);
      const preview = buildPassportPreview(attempts, [...PUBLIC_TASKS]);

      if (preview.coverage.completed === 0 || preview.overall === null || preview.band === null) {
        res.status(409).json({ error: 'nothing_to_publish' });
        return;
      }

      const passportId = user.publishedPassportId || generatePassportId();
      const snapshot: PassportSnapshot = {
        ...preview,
        passportId,
        displayName: user.profile.displayName,
        educationLevel: user.profile.educationLevel,
        college: user.profile.college,
        degree: user.profile.degree,
        gradYear: user.profile.gradYear,
        identityVerified: req.user?.provider === 'google.com',
        track: user.profile.targetRole || 'Junior Software Developer',
        experienceLevel: user.profile.experienceLevel,
        skillsToImprove: user.profile.skillsToImprove,
        issuedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await store.savePassport(snapshot, uid);
      res.json({ passportId, path: `/p/${passportId}` });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/passport (auth required)
  router.delete('/passport', authMiddleware(true), async (req, res, next) => {
    try {
      const uid = req.user?.uid || 'student_local_uid';
      const user = await store.getUser(uid);
      if (user?.publishedPassportId) {
        await store.deletePassport(user.publishedPassportId);
      }
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // GET /api/passports/:passportId (public, no auth)
  router.get('/passports/:passportId', async (req, res, next) => {
    try {
      const paramParse = PassportIdParam.safeParse(req.params);
      if (!paramParse.success) {
        res.status(400).json({ error: 'invalid_request' });
        return;
      }

      const passport = await store.getPassport(paramParse.data.passportId);
      if (!passport) {
        res.status(404).json({ error: 'not_found' });
        return;
      }

      res.json({ passport });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

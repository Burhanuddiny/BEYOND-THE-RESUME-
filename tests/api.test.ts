import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app.ts';
import { MemoryStore } from '../server/store/memoryStore.ts';

describe('Server API Endpoints', () => {
  const store = new MemoryStore();
  const app = createApp({ store, model: null });

  it('GET /healthz returns { ok: true }', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /api/tasks returns all public tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBe(3);
    // Answer keys must never leak in tasks!
    expect(res.body.tasks[0].modelAnswer).toBeUndefined();
    expect(res.body.tasks[0].sampleSolution).toBeUndefined();
  });

  it('GET /api/me returns initial student profile and preview', async () => {
    const res = await request(app).get('/api/me');
    expect(res.status).toBe(200);
    expect(res.body.profile).toBeDefined();
    expect(res.body.profile.displayName).toBe('Aarav Patel');
    expect(res.body.profile.targetRole).toBe('Junior Software Developer');
    expect(res.body.passport).toBeDefined();
    expect(res.body.attempts).toEqual([]);
  });

  it('PUT /api/me/profile personalizes student education, role, and focus skills', async () => {
    const updatedProfile = {
      displayName: 'Priya Sharma',
      educationLevel: 'Postgraduate (M.Tech / M.S. / MCA)',
      college: 'National Institute of Technology',
      degree: 'M.Tech Software Engineering',
      gradYear: 2026,
      targetRole: 'Backend Systems Engineer',
      experienceLevel: '1 Internship Completed',
      skillsToImprove: ['Memory Safety & C Debugging', 'Production Incident Triage'],
    };

    const res = await request(app)
      .put('/api/me/profile')
      .send(updatedProfile);
    expect(res.status).toBe(200);
    expect(res.body.profile.displayName).toBe('Priya Sharma');
    expect(res.body.profile.targetRole).toBe('Backend Systems Engineer');
    expect(res.body.profile.experienceLevel).toBe('1 Internship Completed');
    expect(res.body.profile.skillsToImprove).toContain('Memory Safety & C Debugging');
  });

  it('full simulation flow: start attempt -> submit answer -> submit follow-up -> complete', async () => {
    // 1. Start attempt
    const startRes = await request(app)
      .post('/api/attempts')
      .send({ taskId: 'client-bug-response' });
    expect(startRes.status).toBe(201);
    const attemptId = startRes.body.attempt.id;
    expect(startRes.body.attempt.status).toBe('in_progress');

    // 2. Submit initial answer (min 40 chars)
    const answer = `Dear Sarah, I sincerely apologize for the disruption to your Flash Summer Sale. We have reproduced the issue and our team is actively deploying a rollback. I will provide a status update by 14:45 EST.`;
    const submitRes = await request(app)
      .post(`/api/attempts/${attemptId}/submit`)
      .send({
        answer,
        signals: { pastedChars: 0, typedChars: answer.length, hiddenCount: 0 },
      });
    expect(submitRes.status).toBe(200);
    expect(submitRes.body.attempt.status).toBe('awaiting_follow_up');
    expect(submitRes.body.attempt.followUp).toBeDefined();

    // 3. Submit follow-up reply
    const reply = `I understand your frustration completely. We are monitoring live conversion and will deliver an incident post-mortem with preventative steps.`;
    const followUpRes = await request(app)
      .post(`/api/attempts/${attemptId}/follow-up`)
      .send({ answer: reply });
    expect(followUpRes.status).toBe(200);
    expect(followUpRes.body.attempt.status).toBe('complete');
    expect(followUpRes.body.attempt.result).toBeDefined();
    expect(followUpRes.body.attempt.result.overall).toBeGreaterThanOrEqual(0);
    expect(followUpRes.body.attempt.result.pillars.length).toBeGreaterThan(0);

    // 4. Publish passport
    const pubRes = await request(app).post('/api/passport').send({});
    expect(pubRes.status).toBe(200);
    const passportId = pubRes.body.passportId;
    expect(passportId).toBeDefined();

    // 5. Public recruiter passport inspection
    const recruiterRes = await request(app).get(`/api/passports/${passportId}`);
    expect(recruiterRes.status).toBe(200);
    expect(recruiterRes.body.passport.passportId).toBe(passportId);
    expect(recruiterRes.body.passport.tasks.length).toBe(1);
    expect(recruiterRes.body.passport.tasks[0].answer).toBe(answer);
  });
});

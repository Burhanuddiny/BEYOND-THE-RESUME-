import { describe, it, expect } from 'vitest';
import { scoreTask } from '../shared/scoring.ts';
import type { VerifiedCriterion, CheckpointResult } from '../shared/types.ts';

describe('Scoring Algorithm', () => {
  it('matches the worked example from specification', () => {
    const criteria: VerifiedCriterion[] = [
      {
        criterionId: 'tone',
        criterion: 'Tone & De-escalation',
        pillar: 'communication',
        source: 'answer',
        modelLevel: 3,
        level: 3,
        verifiedEvidence: ['quote1', 'quote2'],
        rejectedEvidence: 0,
        capped: false,
        rationale: '',
      },
      {
        criterionId: 'clarity',
        criterion: 'Clarity & Structure',
        pillar: 'communication',
        source: 'answer',
        modelLevel: 2,
        level: 2,
        verifiedEvidence: ['quote1'],
        rejectedEvidence: 0,
        capped: false,
        rationale: '',
      },
      {
        criterionId: 'ownership',
        criterion: 'Professional Ownership',
        pillar: 'problemSolving',
        source: 'answer',
        modelLevel: 3,
        level: 1, // capped
        verifiedEvidence: [],
        rejectedEvidence: 1,
        capped: true,
        rationale: '',
      },
      {
        criterionId: 'expectations',
        criterion: 'Expectation Management',
        pillar: 'communication',
        source: 'answer',
        modelLevel: 4,
        level: 4,
        verifiedEvidence: ['quote1'],
        rejectedEvidence: 0,
        capped: false,
        rationale: '',
      },
      {
        criterionId: 'followup',
        criterion: 'Follow-up',
        pillar: 'edgeCases',
        source: 'followUp',
        modelLevel: 2,
        level: 2,
        verifiedEvidence: ['quote1'],
        rejectedEvidence: 0,
        capped: false,
        rationale: '',
      },
    ];

    const checkpoints: CheckpointResult[] = [
      { id: 'empathy', pillar: 'communication', label: '', hit: true },
      { id: 'business-impact', pillar: 'communication', label: '', hit: true },
      { id: 'next-update', pillar: 'communication', label: '', hit: true },
      { id: 'actions-list', pillar: 'problemSolving', label: '', hit: false },
      { id: 'containment', pillar: 'problemSolving', label: '', hit: true },
      { id: 'escalation-path', pillar: 'edgeCases', label: '', hit: false },
    ];

    const result = scoreTask({ criteria, checkpoints });

    const commPillar = result.pillars.find((p) => p.pillar === 'communication');
    const psPillar = result.pillars.find((p) => p.pillar === 'problemSolving');
    const ecPillar = result.pillars.find((p) => p.pillar === 'edgeCases');

    expect(commPillar?.score).toBe(81);
    expect(psPillar?.score).toBe(31);
    expect(ecPillar?.score).toBe(38);
    expect(result.overall).toBe(50);
    expect(result.band).toBe('developing');
  });

  it('scores 0 for all zero criteria', () => {
    const criteria: VerifiedCriterion[] = [
      {
        criterionId: 'tech',
        criterion: 'Tech',
        pillar: 'technical',
        source: 'answer',
        modelLevel: 0,
        level: 0,
        verifiedEvidence: [],
        rejectedEvidence: 0,
        capped: false,
        rationale: '',
      },
    ];
    const checkpoints: CheckpointResult[] = [
      { id: 'cp1', pillar: 'technical', label: '', hit: false },
    ];
    const res = scoreTask({ criteria, checkpoints });
    expect(res.overall).toBe(0);
    expect(res.band).toBe('not_yet');
  });

  it('scores 100 for all level 4 criteria and all passed checkpoints', () => {
    const criteria: VerifiedCriterion[] = [
      {
        criterionId: 'tech',
        criterion: 'Tech',
        pillar: 'technical',
        source: 'answer',
        modelLevel: 4,
        level: 4,
        verifiedEvidence: ['sample verified quote'],
        rejectedEvidence: 0,
        capped: false,
        rationale: '',
      },
    ];
    const checkpoints: CheckpointResult[] = [
      { id: 'cp1', pillar: 'technical', label: '', hit: true },
    ];
    const res = scoreTask({ criteria, checkpoints });
    expect(res.overall).toBe(100);
    expect(res.band).toBe('strong');
  });
});

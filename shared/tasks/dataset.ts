import type { PublicTask } from '../types.ts';

export const DATASET_TASK: PublicTask = {
  id: 'analyse-dataset',
  version: 1,
  code: 'TASK-D02',
  title: 'Analyse a Small Dataset and Explain a Finding',
  subtitle: 'API Latency Spike & Database Connection Saturation',
  difficulty: 'Beginner-Intermediate',
  category: 'Data & Observability',
  estimatedMinutes: 25,
  objective: 'Analyse a 24-hour service metrics table, detect the true bottleneck behind user checkout delays, and articulate your findings in an executive engineering summary.',
  context: 'During Monday evening peak traffic, customers complained that the mobile checkout service slowed to a crawl. The infrastructure team took snapshots of hourly server metrics (CPU usage, DB connection pool utilization, p95 API response time, and active requests). You are asked to interpret the metrics and explain what happened.',
  scenarioDetail: 'Inspect the 6-hour critical window snapshot from the production observability dashboard below. Notice the relationships between Active Web Requests, CPU Load, DB Connections Pool % used, and API p95 response time in milliseconds.',
  dataSnippet: {
    headers: ['Hour (UTC)', 'Active Requests/sec', 'App CPU Usage (%)', 'DB Pool Utilized (%)', 'p95 Latency (ms)', 'Error Rate (%)'],
    rows: [
      ['16:00', 420, '42%', '38%', 145, '0.02%'],
      ['17:00', 680, '51%', '54%', 168, '0.04%'],
      ['18:00 (Peak Start)', 1150, '68%', '89%', 420, '0.85%'],
      ['19:00 (Severe Spike)', 1220, '71%', '99%', 2850, '4.90%'],
      ['20:00 (Throttling On)', 950, '64%', '98%', 2100, '3.10%'],
      ['21:00 (Post-Mitigation)', 600, '48%', '45%', 180, '0.08%'],
    ],
  },
  instructions: [
    'Examine the metrics table and identify which subsystem reached its limit first.',
    'Explain why p95 latency skyrocketed from 168ms at 17:00 to 2,850ms at 19:00 while CPU usage only rose from 51% to 71%.',
    'Distinguish between correlation and direct causation in this incident.',
    'Write a 3-paragraph executive summary suitable for a lead engineer and product manager explaining what happened, why, and a recommended architectural fix (e.g. connection pooling tuning, query indexing, or read replicas).',
  ],
  rubric: [
    {
      id: 'data-literacy',
      criterion: 'Data Literacy & Deduction',
      description: 'Correctly pinpoints Database Connection Pool saturation (99%) as the primary bottleneck rather than CPU.',
      pillar: 'problemSolving',
    },
    {
      id: 'root-cause',
      criterion: 'Root-Cause Reasoning',
      description: 'Explains queueing theory: threads blocking on unavailable DB connections causes p95 latency to explode exponentially.',
      pillar: 'technical',
    },
    {
      id: 'executive-communication',
      criterion: 'Executive Communication',
      description: 'Concise, jargon-free summary addressing business impact, technical reality, and next steps.',
      pillar: 'communication',
    },
    {
      id: 'recommendations',
      criterion: 'Actionable Recommendations',
      description: 'Proposes realistic fixes: connection pool scaling, query optimization, timeout adjustments, or cache layer.',
      pillar: 'problemSolving',
    },
  ],
  hints: [
    'Look for the first metric that approaches its limit, not the one that moves most.',
    'A metric rising at the same time is not automatically the cause.',
    'Your reader is a product manager: lead with what happened and what we will do.',
  ],
  answerOutline: `INCIDENT SUMMARY

1. WHAT HAPPENED:

2. WHY IT HAPPENED:

3. WHAT WE RECOMMEND:
- Immediate:
- Longer term:`,
  stakeholder: {
    name: 'Rahul Mehta',
    role: 'Product Manager, Checkout',
  },
};

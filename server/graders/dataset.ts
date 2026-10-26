import type { Grader } from './cProgram.ts';

export const DATASET_GRADER: Grader = {
  taskId: 'analyse-dataset',
  version: 1,
  referenceNotes: `Correct reading of the table:
- The DB connection pool saturates first: 54% at 17:00, 89% at 18:00, 99% at 19:00.
- CPU rises only from 51% to 71%, so compute is not the bottleneck.
- p95 latency jumps 168 ms -> 420 ms -> 2,850 ms as the pool saturates: requests queue
  waiting for a free connection, so latency grows non-linearly (queueing) once utilisation
  approaches 100%. Error rate rises to 4.9% from timeouts.
- Request volume correlates with the incident, but the cause is pool exhaustion
  (correlation vs causation). Throttling at 20:00 helps; post-mitigation at 21:00 recovers.
Good recommendations: right-size the pool (with DB max_connections in mind), statement
timeouts, find and fix slow queries / add indexes so connections are released faster,
caching for read-heavy paths, read replicas, alerts on pool utilisation.
The executive summary should be understandable by a product manager: what happened, why,
what we will do.`,
  checkpoints: [
    {
      id: 'pool-bottleneck',
      pillar: 'problemSolving',
      label: 'Identified DB connection pool saturation as the bottleneck',
      patterns: [
        /pool[\s\S]{0,40}(saturat|exhaust|99|bottleneck)/i,
        /(saturat|exhaust)[\s\S]{0,40}pool/i,
      ],
    },
    {
      id: 'cpu-not-cause',
      pillar: 'problemSolving',
      label: 'Ruled out CPU as the cause',
      patterns: [
        /cpu[\s\S]{0,60}(not|n't|only|headroom|below|safe|within|moderate)/i,
        /(not|n't)[\s\S]{0,30}cpu/i,
      ],
    },
    {
      id: 'queueing',
      pillar: 'technical',
      label: 'Explained requests queueing for connections',
      patterns: [/(queue|queu|wait|block)[\s\S]{0,60}(connection|pool)/i],
    },
    {
      id: 'correlation',
      pillar: 'problemSolving',
      label: 'Separated correlation from causation',
      patterns: [/correlat/i, /caus/i],
      match: 'all',
    },
    {
      id: 'remediation',
      pillar: 'technical',
      label: 'Proposed a concrete technical fix',
      patterns: [
        /pool size|max(imum)?[ _-]?connections|read replica|cach(e|ing)|index|statement timeout|query optimi/i,
      ],
    },
    {
      id: 'cites-data',
      pillar: 'communication',
      label: 'Backed the finding with numbers from the table',
      patterns: [/2,?850|99\s*%|1,?220|168\s*ms/i],
    },
  ],
  modelAnswer: `EXECUTIVE SUMMARY: INCIDENT RETROSPECTIVE (18:00 - 20:00 UTC)

1. Root Cause Finding:
The latency degradation was caused by complete exhaustion of the Database Connection Pool (peaking at 99% saturation), rather than server compute saturation. While App CPU remained within safe thresholds (71%), incoming web worker threads were blocked waiting in queue for an available DB connection, causing p95 response times to surge exponentially from 168ms to 2,850ms.

2. Correlation vs. Causation:
Although higher request volume (1,220 req/s) correlated with the incident, the direct driver of failure was database connection contention. Because long-running queries held connections without returning them to the pool promptly, subsequent requests backed up in memory, triggering HTTP 504 gateway timeouts and a 4.90% error rate.

3. Recommended Remediation:
- Immediate: Increase DB connection pool size from current limit with reasonable safety margins; enforce aggressive statement timeouts (e.g., 800ms) on checkout queries.
- Architectural: Introduce an ElastiCache Redis layer for read-heavy cart validations and implement read replicas to offload non-transactional database reads.`,
  followUp: {
    persona: `A friendly but time-pressed product manager who owns checkout. Not technical; thinks in deadlines and revenue. A big sale starts on Friday.`,
    brief: `Propose the tempting wrong fix: ask whether the team can simply add more app servers (scale the web tier) before Friday's sale, because that is the fastest thing to get approved. The candidate should push back with evidence.`,
    fallbackMessage: `Thanks, this is really clear. Quick one from my side: can't we just double the number of app servers before Friday's sale? That's the fastest thing I can get approved, and more servers should mean more capacity, right?`,
    criterion: {
      id: 'followup',
      criterion: 'Pushing back with evidence',
      description: 'Explains in plain language why more app servers would not help (and could make DB pool saturation worse by opening more connections), and offers a realistic alternative for Friday.',
      pillar: 'edgeCases',
    },
    referenceNotes: `Good replies: more app instances add more DB connections and more pressure on an already saturated pool, so it may worsen latency; CPU was not the limit; recommend pool/DB-side fixes, query fixes, caching, a load test before Friday, and a throttle/queue as a safety valve. Weak replies: agreeing to add servers, or refusing without explanation.`,
  },
};

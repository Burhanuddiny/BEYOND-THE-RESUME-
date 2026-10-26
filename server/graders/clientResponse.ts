import type { Grader } from './cProgram.ts';

export const CLIENT_RESPONSE_GRADER: Grader = {
  taskId: 'client-bug-response',
  version: 1,
  referenceNotes: `A strong reply to Sarah:
- Opens with a sincere apology and acknowledges the Flash Summer Sale and revenue impact.
- Does not blame third parties or the client, and does not admit legal liability.
- States current status in plain language (reproduced / investigating), no jargon.
- Lists concrete actions underway (bulleted): reproduce, isolate, rollback or hotfix, monitor.
- Offers containment or a workaround (rollback, alternate payment path, incident bridge).
- Commits to a specific time for the next update (for example "by 14:45 EST, in 30 minutes").
- Professional sign-off with name and role.
Weak replies: generic "we are looking into it", no time commitment, defensive tone,
technical jargon, promises a fix time the engineer cannot guarantee.`,
  checkpoints: [
    {
      id: 'empathy',
      pillar: 'communication',
      label: 'Apologised and showed empathy',
      patterns: [/apolog|sorry|understand (how|the|that|this)|appreciate/i],
    },
    {
      id: 'business-impact',
      pillar: 'communication',
      label: 'Acknowledged the sale and business impact',
      patterns: [/\bsale\b|revenue|lost (sales|orders)|business impact/i],
    },
    {
      id: 'actions-list',
      pillar: 'problemSolving',
      label: 'Listed concrete actions underway',
      patterns: [/^\s*([-*•]|\d+[.)])\s+\S/m],
    },
    {
      id: 'next-update',
      pillar: 'communication',
      label: 'Committed to a specific next-update time',
      patterns: [/\b\d{1,2}[:.]\d{2}\b/, /within \d+\s*(min|minute|hour)/i, /in \d+\s*(min|minute)/i],
    },
    {
      id: 'containment',
      pillar: 'problemSolving',
      label: 'Offered containment or a workaround',
      patterns: [/roll ?back|workaround|alternat(e|ive) (payment|gateway)|fallback|hot ?fix|disable/i],
    },
    {
      id: 'escalation-path',
      pillar: 'edgeCases',
      label: 'Gave a live escalation path (bridge / on-call)',
      patterns: [/bridge|direct line|on[- ]call|incident (lead|commander|channel)|escalat/i],
    },
  ],
  modelAnswer: `Subject: Re: URGENT: Mobile Checkout Resolution in Progress [Nordic Apparel - Ticket #8492]

Dear Sarah,

Thank you for alerting us immediately, and please accept our sincere apologies for the disruption this is causing during your Flash Summer Sale kickoff. We understand how critical every minute of this sale is for Nordic Apparel, and our highest-priority engineering incident team has been activated.

Here is what we know and the actions underway right now:
- Status: We have reproduced the mobile checkout button hang on iOS and Android devices and isolated it to a recent asset bundle load failure with the payment script.
- Active Containment: Our infrastructure lead is actively preparing a zero-downtime rollback to the stable morning build while testing the direct card gateway endpoint.
- Monitoring: Our telemetry team is tracking real-time checkout conversion funnels to verify the exact moment normal transaction volume resumes.

We will provide your next status update by 14:45 EST (in 30 minutes), or sooner if the fix is successfully deployed. If you or your team need real-time coordination, I am also available on our priority incident bridge link attached below.

Sincerely,
Aarav Patel
Associate Software Engineer | Customer Reliability Team
Incident Lead on Duty`,
  followUp: {
    persona: `Sarah Jenkins, VP of E-Commerce at Nordic Apparel. Under pressure from her CEO, losing money every minute, sharp but professional. She has just read the candidate's reply.`,
    brief: `Escalate realistically. Time has passed (about 35 minutes) and checkout is still down or only partly working. Demand to know whether Nordic Apparel will be compensated for lost sales and whether this will happen again during the next big sale. React to anything the candidate promised and did not deliver.`,
    fallbackMessage: `It's been 35 minutes and mobile checkout is still failing for most of our customers. My CEO is asking two things: will you compensate us for the sales we've lost today, and how do I know this won't happen again during our autumn sale? I need a straight answer.`,
    criterion: {
      id: 'followup',
      criterion: 'Handling the escalation',
      description: 'Stays calm and factual, gives an honest status update, does not promise compensation outside an engineer\'s authority (routes it to the account manager), commits to a post-incident review and a next update time.',
      pillar: 'edgeCases',
    },
    referenceNotes: `Good replies: acknowledge the frustration; concrete current status; "I've looped in your account manager, who can discuss service credits" (no promise of money); commit to a root-cause / post-incident report with prevention steps; next update time. Weak replies: promising refunds or credits; defensive tone; blaming a vendor; no time commitment.`,
  },
};

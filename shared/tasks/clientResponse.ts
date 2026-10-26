import type { PublicTask } from '../types.ts';

export const CLIENT_RESPONSE_TASK: PublicTask = {
  id: 'client-bug-response',
  version: 1,
  code: 'TASK-C03',
  title: 'Respond Professionally to a Client Reporting a Software Bug',
  subtitle: 'Escalation Triage & Stakeholder Communication',
  difficulty: 'Beginner',
  category: 'Workplace Communication & Triage',
  estimatedMinutes: 15,
  objective: 'Draft an empathetic, structured, and blameless client response addressing an urgent payment bug while managing expectations and proposing immediate mitigation.',
  context: 'You are working as an associate engineer at a B2B SaaS company that provides e-commerce checkouts for regional retailers. On Friday afternoon, Sarah Jenkins, VP of E-Commerce at an enterprise client "Nordic Apparel", sends an upset escalation message.',
  scenarioDetail: 'Read Sarah\'s email below carefully. Your goal is to reply in a way that de-escalates the tension, acknowledges the business urgency, explains your troubleshooting steps without confusing technical jargon, and sets a clear timeframe for the next update.',
  clientMessage: {
    from: 'Sarah Jenkins <sjenkins@nordicapparel.com>',
    role: 'VP of E-Commerce, Nordic Apparel',
    subject: 'URGENT: Checkout failing for mobile customers - Losing thousands in sales!',
    timestamp: 'Today at 14:15 EST',
    body: `Hi Engineering Team,\n\nThis is completely unacceptable. Starting roughly an hour ago, our customer support inbox has been flooded with complaints that shoppers on iOS and Android cannot tap the "Pay with Credit Card" button on our mobile checkout. It just hangs with an endless loading spinner!\n\nToday is the kickoff of our Flash Summer Sale. We are losing thousands of dollars every twenty minutes this stays broken. Nobody notified us of any maintenance. Is anyone looking into this? I need this resolved IMMEDIATELY or I will have to escalate to our executive board.\n\nSarah Jenkins\nVP of E-Commerce`,
  },
  instructions: [
    'Write a direct email reply to Sarah Jenkins that maintains high professional composure.',
    'Show genuine empathy and urgency without accepting premature legal liability or blaming external third parties before diagnosis.',
    'Provide clear, bulleted immediate action steps that the engineering team is executing right now.',
    'Offer a workaround or immediate containment suggestion (e.g. alternate payment gateway check, incident command bridge).',
    'Commit to a specific time for the next formal status update (e.g., within 30 minutes).',
  ],
  rubric: [
    {
      id: 'tone',
      criterion: 'Tone & De-escalation',
      description: 'Empathetic, calm, respectful, and acknowledging the commercial impact on their Summer Sale.',
      pillar: 'communication',
    },
    {
      id: 'clarity',
      criterion: 'Clarity & Structure',
      description: 'Logical email layout with immediate status, current actions, and transparent next touchpoint.',
      pillar: 'communication',
    },
    {
      id: 'ownership',
      criterion: 'Professional Ownership',
      description: 'Takes proactive responsibility for investigation without defensive excuses or blame.',
      pillar: 'problemSolving',
    },
    {
      id: 'expectations',
      criterion: 'Expectation Management',
      description: 'Sets a realistic, near-term commitment for the next progress check-in.',
      pillar: 'communication',
    },
  ],
  hints: [
    'Sarah needs to know three things: that you understand the impact, what is being done, and when she will hear from you next.',
    'Avoid blaming anyone, including third parties, before the root cause is known.',
    'Plain language beats technical detail for a business stakeholder.',
  ],
  answerOutline: `Subject: Re: URGENT: Checkout failing for mobile customers

Dear Sarah,



Best regards,
`,
  stakeholder: {
    name: 'Sarah Jenkins',
    role: 'VP of E-Commerce, Nordic Apparel',
  },
};

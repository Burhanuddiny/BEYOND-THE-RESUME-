export type PillarId = 'technical' | 'problemSolving' | 'edgeCases' | 'communication';
export type Level = 0 | 1 | 2 | 3 | 4;
export type Band = 'strong' | 'proficient' | 'developing' | 'not_yet';
export type TaskDifficulty = 'Beginner' | 'Beginner-Intermediate' | 'Intermediate' | 'Advanced';
export type TaskCategory =
  | 'Systems & Core Programming'
  | 'Data & Observability'
  | 'Workplace Communication & Triage';

export interface RubricCriterion {
  id: string;                 // e.g. 'technical-accuracy'; unique within a task
  criterion: string;          // label shown to the student
  description: string;        // what earns full marks
  pillar: PillarId;
}

export interface Stakeholder {
  name: string;               // 'Sarah Jenkins'
  role: string;               // 'VP of E-Commerce, Nordic Apparel'
}

/** Everything the browser may know about a task. No answers, no checkpoints. */
export interface PublicTask {
  id: string;                 // 'debug-c-program'
  version: number;            // bump when content or rubric changes
  code: string;               // 'TASK-C01'
  title: string;
  subtitle: string;
  difficulty: TaskDifficulty;
  category: TaskCategory;
  estimatedMinutes: number;
  objective: string;
  context: string;
  scenarioDetail: string;
  codeSnippet?: { filename: string; language: 'c'; code: string };
  dataSnippet?: { headers: string[]; rows: (string | number)[][] };
  clientMessage?: { from: string; role: string; subject: string; timestamp: string; body: string };
  instructions: string[];
  rubric: RubricCriterion[];
  hints: string[];            // the "Senior Engineer Guidance" content
  answerOutline: string;      // what "Insert answer outline" inserts
  stakeholder: Stakeholder;   // who sends the follow-up
}

export interface CriterionJudgement {
  criterionId: string;
  level: Level;
  evidence: string[];         // quotes the model claims are in the answer (max 3)
  rationale: string;          // one sentence
}

export interface ModelEvaluation {
  criteria: CriterionJudgement[];
  strengths: string[];        // max 3
  improvements: string[];     // max 3
  summary: string;            // max 2 sentences
}

export interface VerifiedCriterion {
  criterionId: string;
  criterion: string;
  pillar: PillarId;
  source: 'answer' | 'followUp';
  modelLevel: Level;          // what the model said
  level: Level;               // after the evidence cap
  verifiedEvidence: string[]; // quotes found in the text
  rejectedEvidence: number;   // count of quotes not found
  capped: boolean;
  rationale: string;
}

export interface CheckpointResult {
  id: string;
  label: string;              // student-facing, e.g. 'Spotted the sizeof(char) allocation bug'
  pillar: PillarId;
  hit: boolean;
}

export interface PillarScore {
  pillar: PillarId;
  score: number;
  band: Band;
}

export interface TaskResult {
  overall: number;            // 0-100, integer
  band: Band;
  pillars: PillarScore[];     // only pillars this task assesses
  criteria: VerifiedCriterion[];
  checkpoints: CheckpointResult[];
  strengths: string[];
  improvements: string[];
  summary: string;
}

export interface IntegritySignals {
  durationSec: number;        // server-computed
  pastedChars: number;        // browser-reported
  typedChars: number;         // browser-reported
  hiddenCount: number;        // times the tab was hidden, browser-reported
  injectionSuspected: boolean;
}

export interface FollowUp {
  from: string;
  role: string;
  message: string;
  generatedBy: 'model' | 'fallback';
}

export type AttemptStatus = 'in_progress' | 'awaiting_follow_up' | 'complete';

export interface Attempt {
  id: string;
  uid: string;
  taskId: string;
  taskVersion: number;
  status: AttemptStatus;
  startedAt: string;          // ISO, server clock
  submittedAt?: string;
  completedAt?: string;
  answer?: string;
  clientSignals?: { pastedChars: number; typedChars: number; hiddenCount: number };
  mainEvaluation?: ModelEvaluation;
  followUp?: FollowUp;
  followUpAnswer?: string;
  followUpJudgement?: CriterionJudgement;
  result?: TaskResult;
  integrity?: IntegritySignals;
  model: string;              // model ID used, for audit
}

/** What the browser receives about an attempt (no uid). */
export type AttemptView = Omit<Attempt, 'uid' | 'mainEvaluation' | 'followUpJudgement'> & {
  modelAnswer?: string;       // only when status === 'complete'
};

export interface Profile {
  displayName: string;
  educationLevel: string;
  college: string;
  degree: string;
  gradYear: number;
  targetRole: string;
  experienceLevel: string;
  skillsToImprove: string[];
}

export interface PassportTaskEntry {
  taskId: string;
  code: string;
  title: string;
  overall: number;
  band: Band;
  pillars: PillarScore[];
  completedAt: string;
  attemptsCount: number;      // completed attempts for this task
  answer: string;
  followUp: { from: string; role: string; message: string; answer: string };
  summary: string;
  strengths: string[];
  criteria: VerifiedCriterion[];
  integrity: IntegritySignals;
}

export interface PassportPreview {
  overall: number | null;     // null when no task is complete
  band: Band | null;
  pillars: PillarScore[];     // pillars with at least one completed task
  tasks: PassportTaskEntry[];
  coverage: { completed: number; total: number };
}

export interface PassportSnapshot extends PassportPreview {
  passportId: string;
  displayName: string;
  educationLevel?: string;
  college: string;
  degree: string;
  gradYear: number;
  identityVerified: boolean;  // true when signed in with Google at publish time
  track: string;              // e.g. target role
  experienceLevel?: string;
  skillsToImprove?: string[];
  issuedAt: string;
  updatedAt: string;
}

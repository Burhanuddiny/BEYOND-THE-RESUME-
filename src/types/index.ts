export type Page = 'landing' | 'dashboard' | 'tasks' | 'assessment' | 'passport' | 'public_passport';

export * from '../../shared/types.ts';

// Legacy compatibility types if needed during page transitions
export interface StudentProfile {
  name: string;
  college: string;
  collegeTier: string;
  degree: string;
  batch: string;
  careerTrack: string;
  avatarInitials: string;
  tasksCompletedCount: number;
  totalAttempts: number;
  readinessRating: string;
  overallScore: number;
}

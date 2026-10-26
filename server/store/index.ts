import type { Attempt, Profile, PassportSnapshot } from '../../shared/types.ts';

export interface UserRecord {
  uid: string;
  profile: Profile | null;
  publishedPassportId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  getUser(uid: string): Promise<UserRecord | null>;
  saveUser(user: UserRecord): Promise<void>;
  updateProfile(uid: string, profile: Profile): Promise<void>;
  getAttempt(attemptId: string): Promise<Attempt | null>;
  saveAttempt(attempt: Attempt): Promise<void>;
  getAttemptsByUser(uid: string): Promise<Attempt[]>;
  getPassport(passportId: string): Promise<PassportSnapshot | null>;
  savePassport(snapshot: PassportSnapshot, ownerUid: string): Promise<void>;
  deletePassport(passportId: string): Promise<void>;
}

export * from './memoryStore.ts';

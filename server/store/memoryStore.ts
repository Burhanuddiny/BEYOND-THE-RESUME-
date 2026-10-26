import type { Attempt, Profile, PassportSnapshot } from '../../shared/types.ts';
import type { Store, UserRecord } from './index.ts';

export class MemoryStore implements Store {
  private users = new Map<string, UserRecord>();
  private attempts = new Map<string, Attempt>();
  private passports = new Map<string, PassportSnapshot>();
  private passportOwners = new Map<string, string>(); // passportId -> ownerUid

  async getUser(uid: string): Promise<UserRecord | null> {
    return this.users.get(uid) || null;
  }

  async saveUser(user: UserRecord): Promise<void> {
    this.users.set(user.uid, { ...user, updatedAt: new Date().toISOString() });
  }

  async updateProfile(uid: string, profile: Profile): Promise<void> {
    const existing = this.users.get(uid) || {
      uid,
      profile: null,
      publishedPassportId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    existing.profile = profile;
    existing.updatedAt = new Date().toISOString();
    this.users.set(uid, existing);
  }

  async getAttempt(attemptId: string): Promise<Attempt | null> {
    const a = this.attempts.get(attemptId);
    return a ? { ...a } : null;
  }

  async saveAttempt(attempt: Attempt): Promise<void> {
    this.attempts.set(attempt.id, { ...attempt });
  }

  async getAttemptsByUser(uid: string): Promise<Attempt[]> {
    const list: Attempt[] = [];
    for (const a of this.attempts.values()) {
      if (a.uid === uid) {
        list.push({ ...a });
      }
    }
    return list.sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
  }

  async getPassport(passportId: string): Promise<PassportSnapshot | null> {
    const p = this.passports.get(passportId);
    return p ? { ...p } : null;
  }

  async savePassport(snapshot: PassportSnapshot, ownerUid: string): Promise<void> {
    this.passports.set(snapshot.passportId, { ...snapshot });
    this.passportOwners.set(snapshot.passportId, ownerUid);

    const user = this.users.get(ownerUid);
    if (user) {
      user.publishedPassportId = snapshot.passportId;
      user.updatedAt = new Date().toISOString();
    }
  }

  async deletePassport(passportId: string): Promise<void> {
    const owner = this.passportOwners.get(passportId);
    this.passports.delete(passportId);
    this.passportOwners.delete(passportId);

    if (owner) {
      const user = this.users.get(owner);
      if (user && user.publishedPassportId === passportId) {
        user.publishedPassportId = null;
        user.updatedAt = new Date().toISOString();
      }
    }
  }
}

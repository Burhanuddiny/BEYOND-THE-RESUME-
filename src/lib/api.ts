import type {
  PublicTask,
  Profile,
  AttemptView,
  PassportPreview,
  PassportSnapshot,
} from '../../shared/types.ts';

export interface MeResponse {
  profile: Profile | null;
  identityVerified: boolean;
  attempts: AttemptView[];
  passport: PassportPreview;
  published: { passportId: string } | null;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(`API error ${status}: ${code}`);
  }
}

// Persistent anonymous client token for dev / preview session
function getClientToken(): string {
  let token = localStorage.getItem('btr_client_uid');
  if (!token) {
    token = 'uid_' + Math.random().toString(36).slice(2, 12);
    localStorage.setItem('btr_client_uid', token);
  }
  return token;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers || {});
  headers.set('Authorization', `Bearer ${getClientToken()}`);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    let errorCode = 'unknown';
    try {
      const errData = await res.json();
      errorCode = errData.error || errorCode;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, errorCode);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }
  return res.json() as Promise<T>;
}

export async function getTasks(): Promise<{ tasks: PublicTask[] }> {
  return fetchJson<{ tasks: PublicTask[] }>('/api/tasks');
}

export async function getMe(): Promise<MeResponse> {
  return fetchJson<MeResponse>('/api/me');
}

export async function updateProfile(profile: Profile): Promise<{ profile: Profile }> {
  return fetchJson<{ profile: Profile }>('/api/me/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
}

export async function startAttempt(taskId: string): Promise<{ attempt: AttemptView }> {
  return fetchJson<{ attempt: AttemptView }>('/api/attempts', {
    method: 'POST',
    body: JSON.stringify({ taskId }),
  });
}

export async function getAttempt(attemptId: string): Promise<{ attempt: AttemptView }> {
  return fetchJson<{ attempt: AttemptView }>(`/api/attempts/${attemptId}`);
}

export async function submitAttempt(
  attemptId: string,
  answer: string,
  signals: { pastedChars: number; typedChars: number; hiddenCount: number },
): Promise<{ attempt: AttemptView }> {
  return fetchJson<{ attempt: AttemptView }>(`/api/attempts/${attemptId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answer, signals }),
  });
}

export async function submitFollowUp(
  attemptId: string,
  answer: string,
): Promise<{ attempt: AttemptView }> {
  return fetchJson<{ attempt: AttemptView }>(`/api/attempts/${attemptId}/follow-up`, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  });
}

export async function publishPassport(): Promise<{ passportId: string; path: string }> {
  return fetchJson<{ passportId: string; path: string }>('/api/passport', {
    method: 'POST',
  });
}

export async function unpublishPassport(): Promise<void> {
  return fetchJson<void>('/api/passport', {
    method: 'DELETE',
  });
}

export async function getPublicPassport(passportId: string): Promise<{ passport: PassportSnapshot }> {
  return fetchJson<{ passport: PassportSnapshot }>(`/api/passports/${passportId}`);
}

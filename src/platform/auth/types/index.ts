export interface AuthUser {
  id: string;
  email: string;
}

export type LoginResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

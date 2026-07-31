export interface AuthUser {
  id: string;
  email: string;
  /** Nombre para mostrar (de user_metadata) o, si falta, la parte local del correo. */
  name: string;
}

export type LoginResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

import type { LoginResult } from "../types";
import type { LoginInput } from "@/modules/login/schemas/login.schema";

/**
 * Sign a user in.
 *
 * NOTE — temporary local placeholder. Supabase auth is intentionally NOT called
 * yet (project not stable). This validates the input and returns a local
 * session so the login flow and app gating work end to end. Swap the body for
 * the Supabase version below once the project is ready — nothing else changes,
 * the contract (`LoginResult`) stays the same.
 *
 *   import { supabase, isSupabaseEnabled } from "@/platform/supabase/client";
 *
 *   export async function loginUser({ email, password }: LoginInput): Promise<LoginResult> {
 *     if (!isSupabaseEnabled || !supabase) {
 *       return { ok: false, error: "Autenticación no disponible por ahora." };
 *     }
 *     const { data, error } = await supabase.auth.signInWithPassword({ email, password });
 *     if (error || !data.user) {
 *       return { ok: false, error: "Correo o contraseña incorrectos." };
 *     }
 *     return { ok: true, user: { id: data.user.id, email: data.user.email ?? email } };
 *   }
 */
export async function loginUser({
  email,
  password,
}: LoginInput): Promise<LoginResult> {
  // Simulate network latency so the UI's loading state is exercised.
  await new Promise((r) => setTimeout(r, 400));

  if (password.length < 6) {
    return {
      ok: false,
      error: "",
      fieldErrors: { password: "La contraseña debe tener al menos 6 caracteres." },
    };
  }

  return {
    ok: true,
    user: {
      id: `local-${email.toLowerCase()}`,
      email,
    },
  };
}

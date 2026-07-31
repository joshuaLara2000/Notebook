import { supabase, isSupabaseEnabled } from "@/platform/supabase/client";
import type { LoginResult } from "../types";
import type { LoginInput } from "@/modules/login/schemas/login.schema";

// Inicia sesión con email y contraseña contra Supabase Auth.
export async function loginUser({
  email,
  password,
}: LoginInput): Promise<LoginResult> {
  if (!isSupabaseEnabled || !supabase) {
    return { ok: false, error: "Autenticación no disponible." };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }
  return { ok: true, user: { id: data.user.id, email: data.user.email ?? email } };
}

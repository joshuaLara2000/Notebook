import { supabase, isSupabaseEnabled } from "@/platform/supabase/client";
import type { LoginResult } from "../types";
import type { LoginInput } from "@/modules/login/schemas/login.schema";

// Crea una cuenta nueva. Si "Confirm email" está activo no habrá sesión hasta
// confirmar el correo; en ese caso avisamos y no marcamos ok.
export async function signUpUser({
  email,
  password,
}: LoginInput): Promise<LoginResult> {
  if (!isSupabaseEnabled || !supabase) {
    return { ok: false, error: "Registro no disponible." };
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { ok: false, error: error.message };
  }
  if (!data.session) {
    return {
      ok: false,
      error: "Cuenta creada. Revisa tu correo para confirmar y luego entra.",
    };
  }
  return {
    ok: true,
    user: { id: data.user?.id ?? "", email: data.user?.email ?? email },
  };
}

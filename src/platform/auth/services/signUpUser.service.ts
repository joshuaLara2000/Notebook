import { supabase, isSupabaseEnabled } from "@/platform/supabase/client";
import { mapUser } from "../mapUser";
import type { LoginResult } from "../types";
import type { LoginInput } from "@/modules/login/schemas/login.schema";

// Crea una cuenta nueva y guarda el nombre en user_metadata.display_name.
// Si "Confirm email" está activo no habrá sesión hasta confirmar el correo.
export async function signUpUser({
  email,
  password,
  name,
}: LoginInput & { name?: string }): Promise<LoginResult> {
  if (!isSupabaseEnabled || !supabase) {
    return { ok: false, error: "Registro no disponible." };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: name ? { data: { display_name: name.trim() } } : undefined,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  if (!data.session) {
    return {
      ok: false,
      error: "Cuenta creada. Revisa tu correo para confirmar y luego entra.",
    };
  }
  const user = mapUser(data.user);
  if (!user) return { ok: false, error: "No se pudo crear la cuenta." };
  return { ok: true, user };
}

import type { User } from "@supabase/supabase-js";

import type { AuthUser } from "./types";

// Traduce el usuario de Supabase a nuestro tipo, resolviendo el nombre a mostrar
// desde user_metadata (display_name / full_name / name) o el correo.
export function mapUser(u: User | null | undefined): AuthUser | null {
  if (!u) return null;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const metaName =
    (meta.display_name as string) ||
    (meta.full_name as string) ||
    (meta.name as string) ||
    "";
  const name = metaName || u.email?.split("@")[0] || "";
  return { id: u.id, email: u.email ?? "", name };
}

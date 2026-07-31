import type { User } from "@supabase/supabase-js";

import { supabase } from "@/platform/supabase/client";
import { useAuthStore } from "./store/useAuthStore";
import type { AuthUser } from "./types";

// Traduce el usuario de Supabase a nuestro tipo mínimo.
function toAuthUser(u: User | null | undefined): AuthUser | null {
  return u ? { id: u.id, email: u.email ?? "" } : null;
}

let started = false;

// Resuelve la sesión inicial y escucha cambios de auth. Llamar una sola vez.
export function initAuth() {
  if (started) return;
  started = true;
  const { setUser, setReady } = useAuthStore.getState();

  if (!supabase) {
    setReady();
    return;
  }

  supabase.auth.getSession().then(({ data }) => {
    setUser(toAuthUser(data.session?.user));
    setReady();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    setUser(toAuthUser(session?.user));
  });
}

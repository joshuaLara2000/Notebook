import { supabase } from "@/platform/supabase/client";
import { useAuthStore } from "./store/useAuthStore";
import { mapUser } from "./mapUser";

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
    setUser(mapUser(data.session?.user));
    setReady();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    setUser(mapUser(session?.user));
  });
}

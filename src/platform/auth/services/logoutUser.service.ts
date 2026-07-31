import { supabase } from "@/platform/supabase/client";

// Cierra sesión y limpia la cache local del tablero para no filtrarla a otro
// usuario en el mismo navegador.
export async function logoutUser() {
  await supabase?.auth.signOut();
  try {
    localStorage.removeItem("notebook-board");
  } catch {
    // sin acceso a localStorage: no pasa nada
  }
}

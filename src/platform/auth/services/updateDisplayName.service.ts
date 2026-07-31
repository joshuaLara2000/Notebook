import { supabase } from "@/platform/supabase/client";
import { mapUser } from "../mapUser";
import { useAuthStore } from "../store/useAuthStore";

// Actualiza el nombre para mostrar (user_metadata.display_name) vía la API de
// auth y refleja el cambio en el store. No toca la tabla auth.users directo.
export async function updateDisplayName(name: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.auth.updateUser({
    data: { display_name: name.trim() },
  });
  if (error) return false;
  const user = mapUser(data.user);
  if (user) useAuthStore.getState().setUser(user);
  return true;
}

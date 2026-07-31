import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para el navegador. Persiste la sesión y refresca el token
 * solo para que el login sobreviva recargas. Si faltan credenciales, es null.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;

export const isSupabaseEnabled = Boolean(url && publishableKey);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url as string, publishableKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "notebook-sb-auth",
      },
    })
  : null;

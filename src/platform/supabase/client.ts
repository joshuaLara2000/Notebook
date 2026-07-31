import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase browser client.
 *
 * Reads credentials from Vite env (`.env.local`). While the project is not yet
 * connected, `supabase` is `null` and feature stores fall back to local
 * persistence. Services must guard with `isSupabaseEnabled` before querying.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url as string, anonKey as string)
  : null;

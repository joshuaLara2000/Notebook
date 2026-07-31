import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase browser client.
 *
 * Reads credentials from Vite env (`.env`). When they are missing the client
 * is `null` and the app keeps working off the local (zustand + localStorage)
 * store. Sync code must guard on `isSupabaseEnabled` before querying.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;

export const isSupabaseEnabled = Boolean(url && publishableKey);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url as string, publishableKey as string, {
      auth: { persistSession: false },
    })
  : null;

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: SupabaseClient | null = null;

/**
 * Cliente de Supabase para el navegador (anon key).
 * Retorna null si las variables de entorno aún no han sido configuradas.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient) return browserClient;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  browserClient = createClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

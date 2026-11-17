import { createClient, SupabaseClient } from "@supabase/supabase-js";
let c: SupabaseClient | null = null;
export function db() {
  if (!c) {
    const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL of SUPABASE_SERVICE_ROLE_KEY ontbreekt");
    c = createClient(url, key, { auth: { persistSession: false } });
  }
  return c;
}

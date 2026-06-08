import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

export function getSupabaseConfigError(): string | null {
  if (!process.env.SUPABASE_URL) {
    return "Missing SUPABASE_URL.";
  }

  if (!process.env.SUPABASE_ANON_KEY) {
    return "Missing SUPABASE_ANON_KEY.";
  }

  return null;
}

export function createSupabaseServerClient() {
  const configError = getSupabaseConfigError();

  if (configError) {
    throw new Error(configError);
  }

  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

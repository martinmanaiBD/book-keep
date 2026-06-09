import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

export function getSupabaseConfigError(): string | null {
  const supabaseUrl = process.env.SUPABASE_URL;

  if (!supabaseUrl) {
    return "Missing SUPABASE_URL.";
  }

  try {
    const url = new URL(supabaseUrl);

    if (url.pathname !== "/") {
      return "SUPABASE_URL must be the project root URL, without /rest/v1 or any path.";
    }
  } catch {
    return "SUPABASE_URL is not a valid URL.";
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

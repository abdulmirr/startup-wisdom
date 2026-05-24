import { createClient } from "@supabase/supabase-js"

import { env } from "../env"

/**
 * Service-role Supabase client. Bypasses RLS.
 * Server-only. Never expose this in client code or commit it.
 * Use for scripts (scrape/extract/embed) and admin server actions.
 */
export function createSupabaseAdminClient() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      "Supabase admin env not set (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)."
    )
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

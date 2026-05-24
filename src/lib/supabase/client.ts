import { createBrowserClient } from "@supabase/ssr"

import { env } from "../env"

/** Supabase client for use inside client components. */
export function createSupabaseBrowserClient() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error(
      "Supabase env not set (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    )
  }
  return createBrowserClient(url, anon)
}

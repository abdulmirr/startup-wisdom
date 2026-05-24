import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import { env } from "../env"

/** Supabase client for use inside RSC / route handlers. Honors auth cookies. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error(
      "Supabase env not set (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    )
  }
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // RSCs cannot set cookies; ignore.
        }
      },
    },
  })
}

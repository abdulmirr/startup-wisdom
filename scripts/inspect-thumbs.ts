import { config as dotenv } from "dotenv"
dotenv({ path: ".env.local" })

import { createSupabaseAdminClient } from "../src/lib/supabase/admin"

const SLUGS = [
  "organic-startup-ideas", "when-to-do-what-you-love", "startups-in-13-sentences",
  "the-hardest-lessons-for-startups-to-learn", "billionaires-build",
  "advice-for-ambitious-19-year-olds", "startup-advice-briefly", "how-to-hire",
  "employee-retention", "how-things-get-done", "making-yourself-a-ceo",
  "managing-your-own-psychology", "ceos-should-tell-it-like-it-is",
]

async function main() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("resources")
    .select("slug, thumbnail_url")
    .in("slug", SLUGS)
  if (error) throw error
  for (const r of data ?? []) {
    console.log(`${r.slug.padEnd(48)}  ${r.thumbnail_url ?? "(null)"}`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })

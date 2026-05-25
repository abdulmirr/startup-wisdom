// One-shot: promote the 14 newly-scraped playbook essays from draft →
// published so the resource page renders them. Run once:
//   tsx --env-file=.env.local scripts/publish-playbook-essays.ts

import { config as dotenv } from "dotenv"
dotenv({ path: ".env.local" })

import { createSupabaseAdminClient } from "../src/lib/supabase/admin"

const SLUGS = [
  "organic-startup-ideas",
  "when-to-do-what-you-love",
  "startups-in-13-sentences",
  "the-hardest-lessons-for-startups-to-learn",
  "billionaires-build",
  "advice-for-ambitious-19-year-olds",
  "startup-advice-briefly",
  "how-to-hire",
  "employee-retention",
  "how-things-get-done",
  "making-yourself-a-ceo",
  "managing-your-own-psychology",
  "ceos-should-tell-it-like-it-is",
]

async function main() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from("resources")
    .update({ status: "published" })
    .in("slug", SLUGS)
    .select("slug, status")
  if (error) throw error
  console.log(`✓ promoted ${data?.length ?? 0} essays to published`)
  for (const row of data ?? []) console.log(`  - ${row.slug}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

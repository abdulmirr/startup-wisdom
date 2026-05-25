// One-shot: update peacetime-ceo-wartime-ceo + a-good-place-to-work to their
// a16z.com canonical URLs. The bhorowitz.com versions 404, so the prior
// rows had broken external_url. Scrape can't upsert because (source_id,
// external_url) is the conflict target and the URL itself changed.
// Run once with: tsx --env-file=.env.local scripts/migrate-bh-urls.ts

import { config as dotenv } from "dotenv"
dotenv({ path: ".env.local" })

import { createSupabaseAdminClient } from "../src/lib/supabase/admin"

const updates: Array<{ slug: string; url: string }> = [
  { slug: "peacetime-ceo-wartime-ceo", url: "https://a16z.com/peacetime-ceo-wartime-ceo/" },
  { slug: "a-good-place-to-work", url: "https://a16z.com/a-good-place-to-work/" },
]

async function main() {
  const supabase = createSupabaseAdminClient()
  for (const { slug, url } of updates) {
    const { data, error } = await supabase
      .from("resources")
      .update({ external_url: url })
      .eq("slug", slug)
      .select("slug, external_url")
    if (error) throw error
    console.log(`✓ ${slug} → ${data?.[0]?.external_url ?? "(no row)"}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

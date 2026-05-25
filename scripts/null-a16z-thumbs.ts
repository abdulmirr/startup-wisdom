// One-shot: the a16z.com scrape pulls in generic Yoast OG images as
// thumbnails. They're stock corporate art, not article images, and they
// crash next/image because a16z.com isn't whitelisted. Null any thumbnail
// pointing at a16z.com so the creator avatar renders.
//   tsx --env-file=.env.local scripts/null-a16z-thumbs.ts

import { config as dotenv } from "dotenv"
dotenv({ path: ".env.local" })

import { createSupabaseAdminClient } from "../src/lib/supabase/admin"

const BH_SLUGS = [
  "peacetime-ceo-wartime-ceo",
  "a-good-place-to-work",
  "making-yourself-a-ceo",
  "managing-your-own-psychology",
  "ceos-should-tell-it-like-it-is",
]

async function main() {
  const supabase = createSupabaseAdminClient()

  // First show what's there.
  const { data: before, error: selErr } = await supabase
    .from("resources")
    .select("slug, thumbnail_url")
    .in("slug", BH_SLUGS)
  if (selErr) throw selErr
  console.log("Before:")
  for (const row of before ?? []) console.log(`  ${row.slug}: ${row.thumbnail_url}`)

  const { data, error } = await supabase
    .from("resources")
    .update({ thumbnail_url: null })
    .in("slug", BH_SLUGS)
    .select("slug")
  if (error) throw error
  console.log(`✓ cleared ${data?.length ?? 0} BH thumbnails`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

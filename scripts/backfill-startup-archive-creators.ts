// One-off: re-attribute existing startup-archive-yt resources from the
// generic "various-founders" creator to the actual speaker named in each
// post title. Safe to re-run — it skips rows that already point at the
// right creator.
//
// Run with:  npx tsx --env-file=.env.local scripts/backfill-startup-archive-creators.ts

import { config as dotenv } from "dotenv"
dotenv({ path: ".env.local" })
dotenv()

import { createSupabaseAdminClient } from "../src/lib/supabase/admin"

const SPEAKER_TO_SLUG: Record<string, string> = {
  "jeff bezos": "jeff-bezos",
  "steve jobs": "steve-jobs",
  "marc andreessen": "marc-andreessen",
  "sam altman": "sam-altman",
  "paul graham": "paul-graham",
  "tobi lutke": "tobi-lutke",
  "tobi lütke": "tobi-lutke",
  "keith rabois": "keith-rabois",
  "mark zuckerberg": "mark-zuckerberg",
  "eric schmidt": "eric-schmidt",
  "jony ive": "jony-ive",
  "naval ravikant": "naval-ravikant",
  "patrick collison": "patrick-collison",
  "brian chesky": "brian-chesky",
  "ben horowitz": "ben-horowitz",
}

function creatorSlugFromTitle(title: string): string {
  const lower = title.toLowerCase()
  for (const [name, slug] of Object.entries(SPEAKER_TO_SLUG)) {
    if (lower.startsWith(name)) return slug
  }
  return "various-founders"
}

async function main() {
  const supabase = createSupabaseAdminClient()

  const { data: source, error: sErr } = await supabase
    .from("sources")
    .select("id")
    .eq("slug", "startup-archive-yt")
    .single()
  if (sErr || !source) throw sErr ?? new Error("source not found")

  const { data: creators, error: cErr } = await supabase
    .from("creators")
    .select("id, slug")
  if (cErr) throw cErr
  const creatorIdBySlug = new Map(creators.map((c) => [c.slug, c.id]))

  const { data: rows, error: rErr } = await supabase
    .from("resources")
    .select("id, title, creator_id")
    .eq("source_id", source.id)
  if (rErr) throw rErr
  if (!rows?.length) {
    console.log("Nothing to backfill.")
    return
  }

  let updated = 0
  let skipped = 0
  let missing = 0
  for (const r of rows) {
    const targetSlug = creatorSlugFromTitle(r.title)
    const targetId = creatorIdBySlug.get(targetSlug)
    if (!targetId) {
      console.warn(`  ! no creator row for slug=${targetSlug} (title="${r.title}")`)
      missing++
      continue
    }
    if (targetId === r.creator_id) {
      skipped++
      continue
    }
    const { error: uErr } = await supabase
      .from("resources")
      .update({ creator_id: targetId })
      .eq("id", r.id)
    if (uErr) {
      console.error(`  ✗ ${r.title}:`, uErr.message)
      continue
    }
    console.log(`  ✓ ${r.title}  →  ${targetSlug}`)
    updated++
  }
  console.log(`\nDone. updated=${updated} skipped=${skipped} missing=${missing}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

// One-shot: insert the "jobs-on-focus" YouTube clip directly into Supabase.
// It lives in mock.ts but isn't backed by a startupArchive.org writeup, so
// the manifest-driven scraper doesn't pick it up. Run once:
//   tsx --env-file=.env.local scripts/insert-jobs-on-focus.ts

import { config as dotenv } from "dotenv"
dotenv({ path: ".env.local" })

import { createSupabaseAdminClient } from "../src/lib/supabase/admin"

async function main() {
  const supabase = createSupabaseAdminClient()

  const [{ data: source }, { data: creator }] = await Promise.all([
    supabase.from("sources").select("id").eq("slug", "startup-archive-yt").single(),
    supabase.from("creators").select("id").eq("slug", "various-founders").single(),
  ])
  if (!source || !creator) throw new Error("source/creator missing")

  const { error } = await supabase.from("resources").upsert(
    {
      source_id: source.id,
      creator_id: creator.id,
      slug: "jobs-on-focus",
      title: "Steve Jobs on Focus",
      external_url: "https://www.youtube.com/watch?v=H8eP99neOVs",
      medium: "video",
      description: "Jobs at his 1997 internal Apple meeting: 'Focusing is about saying no.'",
      duration_seconds: 184,
      published_at: "1997-09-01",
      status: "published",
      extraction_status: "done",
    },
    { onConflict: "slug" }
  )
  if (error) throw error
  console.log("✓ inserted/updated jobs-on-focus")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

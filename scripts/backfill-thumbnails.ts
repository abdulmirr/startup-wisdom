// One-time backfill: visit each resource's external_url, look for an
// og:image / twitter:image, and update thumbnail_url if found. Resources
// without an og:image keep their creator-portrait fallback.
//
// Run with: npx tsx --env-file=.env.local scripts/backfill-thumbnails.ts

import { config as dotenv } from "dotenv"
dotenv({ path: ".env.local" })
dotenv()

import { load } from "cheerio"

import { fetchHtml } from "./fetchers/_shared/http"
import { createSupabaseAdminClient } from "../src/lib/supabase/admin"

async function findOgImage(url: string): Promise<string | null> {
  try {
    const html = await fetchHtml(url)
    const $ = load(html)
    const og =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('meta[property="twitter:image"]').attr("content")
    return og?.trim() || null
  } catch {
    return null
  }
}

async function main() {
  const supa = createSupabaseAdminClient()
  const { data, error } = await supa
    .from("resources")
    .select("id, title, external_url, thumbnail_url")
    .is("thumbnail_url", null)
    .eq("status", "published")
  if (error) throw error
  if (!data || data.length === 0) {
    console.log("Nothing to backfill.")
    return
  }
  console.log(`Checking ${data.length} resources for og:image…`)

  let updated = 0
  let skipped = 0
  for (const r of data) {
    const og = await findOgImage(r.external_url)
    if (og) {
      const { error: uErr } = await supa
        .from("resources")
        .update({ thumbnail_url: og })
        .eq("id", r.id)
      if (uErr) {
        console.log(`  ✗ ${r.title}: ${uErr.message}`)
        continue
      }
      console.log(`  + ${r.title}`)
      updated++
    } else {
      skipped++
    }
  }
  console.log(`\nDone. updated=${updated} no-og-image=${skipped}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

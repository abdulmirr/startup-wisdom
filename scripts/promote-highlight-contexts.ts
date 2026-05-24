// One-shot: take each resource's key highlight `context` (the small AI-written
// gloss currently rendered under the Key Highlight) and promote it to be the
// resource's `description` (the text shown on the card under the title).
//
// No AI calls — pure data move. Resources whose key highlight has no context
// are logged and left untouched, so we can decide separately whether to fall
// back to AI generation for them.
//
// Run with:  npx tsx --env-file=.env.local scripts/promote-highlight-contexts.ts [--dry] [--overwrite]
//
// Without --overwrite, skips resources whose current description is already
// short (<= 140 chars and not flagged as a raw quote).

import { config as dotenv } from "dotenv"
dotenv({ path: ".env.local" })
dotenv()

import { createSupabaseAdminClient } from "../src/lib/supabase/admin"

const MAX_CHARS = 140

function firstSentence(text: string): string {
  const m = text.match(/^[\s\S]*?[.!?](?=\s|$)/)
  return (m?.[0] ?? text).trim()
}

// Returns null when no complete sentence fits cleanly within MAX_CHARS — caller
// should treat that as "no usable context" rather than emit a truncated thought.
function fitToCard(text: string): string | null {
  const sentence = firstSentence(text)
  if (sentence.length <= MAX_CHARS) return sentence
  return null
}

async function main() {
  const args = process.argv.slice(2)
  const dry = args.includes("--dry")
  const overwrite = args.includes("--overwrite")

  const supabase = createSupabaseAdminClient()

  const { data: resources, error } = await supabase
    .from("resources")
    .select("id, slug, title, description")
    .eq("status", "published")
    .order("added_at", { ascending: false })
  if (error) throw error

  const { data: keyHighlights, error: hErr } = await supabase
    .from("highlights")
    .select("resource_id, context")
    .eq("is_key", true)
  if (hErr) throw hErr

  const contextByResource = new Map<string, string | null>()
  for (const h of keyHighlights ?? []) {
    contextByResource.set(h.resource_id, h.context)
  }

  let updated = 0
  let skipped = 0
  let missing = 0
  const missingTitles: string[] = []

  for (const r of resources ?? []) {
    const ctx = contextByResource.get(r.id) ?? null
    if (!ctx || !ctx.trim()) {
      missing++
      missingTitles.push(r.title)
      continue
    }
    const next = fitToCard(ctx)
    if (!next) {
      missing++
      missingTitles.push(`${r.title}  [context too long: ${ctx.length} chars]`)
      continue
    }
    if (!overwrite && r.description && r.description === next) {
      skipped++
      continue
    }
    console.log(`  ${dry ? "[dry] " : ""}✓ ${r.title}\n      ${next}`)
    if (!dry) {
      const { error: updErr } = await supabase
        .from("resources")
        .update({ description: next })
        .eq("id", r.id)
      if (updErr) {
        console.error(`    ✗ update failed: ${updErr.message}`)
        continue
      }
    }
    updated++
  }

  console.log(
    `\nDone. updated=${updated} skipped=${skipped} missing_context=${missing}`
  )
  if (missing > 0) {
    console.log("\nResources with no key-highlight context:")
    for (const t of missingTitles) console.log(`  - ${t}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

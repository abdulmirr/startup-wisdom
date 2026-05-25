// One-shot: remove the 4 old playbook collections after the new ones were
// seeded. Run once: tsx --env-file=.env.local scripts/drop-stale-collections.ts

import { config as dotenv } from "dotenv"
dotenv({ path: ".env.local" })

import { createSupabaseAdminClient } from "../src/lib/supabase/admin"

const STALE = [
  "pre-launch-canon",
  "founder-mode-reading-list",
  "when-youre-stuck-on-ideas",
  "operators-notebook",
]

async function main() {
  const supabase = createSupabaseAdminClient()

  const { data: rows, error: selErr } = await supabase
    .from("collections")
    .select("id, slug")
    .in("slug", STALE)
  if (selErr) throw selErr
  if (!rows?.length) {
    console.log("no stale collections found")
    return
  }
  const ids = rows.map((r) => r.id as string)

  // Drop join rows first to satisfy any FK constraint.
  const { error: ciErr } = await supabase
    .from("collection_items")
    .delete()
    .in("collection_id", ids)
  if (ciErr) throw ciErr

  const { error: cErr } = await supabase
    .from("collections")
    .delete()
    .in("id", ids)
  if (cErr) throw cErr

  console.log(`✓ removed ${rows.length} collections: ${rows.map((r) => r.slug).join(", ")}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import { config as dotenv } from "dotenv"
dotenv({ path: ".env.local" })

import { createSupabaseAdminClient } from "../src/lib/supabase/admin"

const restore: Record<string, string> = {
  "peacetime-ceo-wartime-ceo": "/paintings/bar-folies-bergere.webp",
  "a-good-place-to-work": "/paintings/luncheon-of-the-boating-party.webp",
}

async function main() {
  const supabase = createSupabaseAdminClient()
  for (const [slug, url] of Object.entries(restore)) {
    const { error } = await supabase
      .from("resources")
      .update({ thumbnail_url: url })
      .eq("slug", slug)
    if (error) throw error
    console.log(`✓ ${slug} → ${url}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

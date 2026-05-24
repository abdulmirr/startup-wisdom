// One-shot cleanup: any thumbnail_url still pointing at upload.wikimedia.org
// is currently rate-limited from this IP. Reset those to null so the card
// falls back to the (now-local) creator portrait. Keep local-path URLs intact.

import { createSupabaseAdminClient } from "../src/lib/supabase/admin"

async function main() {
  const supa = createSupabaseAdminClient()
  const { data } = await supa
    .from("resources")
    .select("id, title, thumbnail_url")
    .not("thumbnail_url", "is", null)
  if (!data) return
  const wikipediaIds = data
    .filter((r) => r.thumbnail_url?.includes("upload.wikimedia.org"))
    .map((r) => r.id)
  console.log(`Found ${wikipediaIds.length} resources still on Wikipedia.`)
  if (wikipediaIds.length === 0) return
  const { error } = await supa
    .from("resources")
    .update({ thumbnail_url: null })
    .in("id", wikipediaIds)
  if (error) throw error
  console.log(`Nulled ${wikipediaIds.length}. They'll fall back to creator portraits.`)
}
main()

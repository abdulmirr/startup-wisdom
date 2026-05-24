// Seeds the Supabase project with the static data the scrapers need as FK
// targets: creators, sources, and the controlled topic vocabulary.
//
// Run once after applying migrations:  npx tsx scripts/seed-static.ts

import { config as dotenv } from "dotenv"
dotenv({ path: ".env.local" })
dotenv() // also pick up plain .env if present

import { TOPIC_DEFINITIONS } from "../data/topics"
import {
  COLLECTION_ITEMS,
  COLLECTIONS,
  CREATORS,
  SOURCES,
} from "../src/lib/data/mock"
import { createSupabaseAdminClient } from "../src/lib/supabase/admin"

async function main() {
  const supabase = createSupabaseAdminClient()

  // Creators (drop the mock-only id; let Postgres generate UUIDs)
  const creatorRows = CREATORS.map(({ id: _id, ...c }) => {
    void _id
    return c
  })
  const { error: cErr } = await supabase
    .from("creators")
    .upsert(creatorRows, { onConflict: "slug" })
  if (cErr) throw cErr
  console.log(`✓ creators (${creatorRows.length})`)

  // Sources
  const sourceRows = SOURCES.map(({ id: _id, ...s }) => {
    void _id
    return s
  })
  const { error: sErr } = await supabase
    .from("sources")
    .upsert(sourceRows, { onConflict: "slug" })
  if (sErr) throw sErr
  console.log(`✓ sources (${sourceRows.length})`)

  // Topics — from the controlled vocabulary
  const topicRows = TOPIC_DEFINITIONS.map((t) => ({
    slug: t.slug,
    name: t.name,
    description: null,
    sort_order: Math.round(t.order),
  }))
  const { error: tErr } = await supabase
    .from("topics")
    .upsert(topicRows, { onConflict: "slug" })
  if (tErr) throw tErr
  console.log(`✓ topics (${topicRows.length})`)

  // Collections (drop the mock-only id; upsert by slug so Postgres assigns UUIDs)
  const collectionRows = COLLECTIONS.map(({ id: _id, ...c }) => {
    void _id
    return c
  })
  const { error: colErr } = await supabase
    .from("collections")
    .upsert(collectionRows, { onConflict: "slug" })
  if (colErr) throw colErr
  console.log(`✓ collections (${collectionRows.length})`)

  // Collection items: mock uses slugs as IDs, but the real tables use UUIDs.
  // Re-select to build slug → uuid maps, then translate the join rows.
  const mockCollectionSlugs = COLLECTIONS.map((c) => c.slug)
  const { data: liveCollections, error: lcErr } = await supabase
    .from("collections")
    .select("id, slug")
    .in("slug", mockCollectionSlugs)
  if (lcErr) throw lcErr
  const collectionIdBySlug = new Map(
    (liveCollections ?? []).map((c) => [c.slug as string, c.id as string])
  )

  const resourceSlugs = Array.from(
    new Set(COLLECTION_ITEMS.map((ci) => ci.resource_id))
  )
  const { data: liveResources, error: lrErr } = await supabase
    .from("resources")
    .select("id, slug")
    .in("slug", resourceSlugs)
  if (lrErr) throw lrErr
  const resourceIdBySlug = new Map(
    (liveResources ?? []).map((r) => [r.slug as string, r.id as string])
  )

  const missingResources = resourceSlugs.filter((s) => !resourceIdBySlug.has(s))
  if (missingResources.length) {
    console.warn(
      `  ⚠ skipping ${missingResources.length} collection_items — resources not in DB yet: ${missingResources.join(", ")}`
    )
  }

  const itemRows = COLLECTION_ITEMS.flatMap((ci) => {
    // ci.collection_id is the mock slug-as-id, which also matches collections.slug
    const collectionId = collectionIdBySlug.get(ci.collection_id)
    const resourceId = resourceIdBySlug.get(ci.resource_id)
    if (!collectionId || !resourceId) return []
    return [{
      collection_id: collectionId,
      resource_id: resourceId,
      rank: ci.rank,
      note: ci.note,
    }]
  })

  // Wipe-and-replace so removed/reordered items in the mock take effect.
  const collectionIds = Array.from(collectionIdBySlug.values())
  if (collectionIds.length) {
    const { error: delErr } = await supabase
      .from("collection_items")
      .delete()
      .in("collection_id", collectionIds)
    if (delErr) throw delErr
  }
  if (itemRows.length) {
    const { error: ciErr } = await supabase
      .from("collection_items")
      .insert(itemRows)
    if (ciErr) throw ciErr
  }
  console.log(`✓ collection_items (${itemRows.length})`)

  console.log("\nStatic seed complete.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

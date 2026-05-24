// Supabase-backed implementation of the data layer. Mirrors the function
// signatures in ./index.ts. We use the service-role admin client server-side
// for simplicity (the public site only reads published rows, but service-role
// bypasses RLS so we don't risk the policies blocking SSR queries).
//
// All queries run server-side (RSC / route handlers). Never import this from
// a client component.

import { createSupabaseAdminClient } from "../supabase/admin"
import type {
  Collection,
  CollectionWithItems,
  Creator,
  Highlight,
  HighlightWithResource,
  Resource,
  ResourceDetail,
  ResourceMedium,
  ResourceQuery,
  ResourceWithRelations,
  Source,
  Topic,
  TopicWithCount,
} from "../types"

const RESOURCE_COLUMNS = `
  id, slug, title, creator_id, source_id, medium, external_url, external_id,
  thumbnail_url, duration_seconds, word_count, published_at, added_at,
  description, status, extraction_status,
  creator:creators(*),
  source:sources(*)
` as const

type RawResource = Resource & {
  creator: Creator
  source: Source
}

function pickOne<T>(x: T | T[] | null | undefined): T | null {
  if (!x) return null
  return Array.isArray(x) ? (x[0] ?? null) : x
}

function normalizeResource(raw: RawResource): ResourceWithRelations {
  const { creator, source, ...rest } = raw
  return {
    ...rest,
    creator: pickOne<Creator>(creator)!,
    source: pickOne<Source>(source)!,
    topics: [], // attached separately
  }
}

async function attachTopics(
  resources: ResourceWithRelations[]
): Promise<ResourceWithRelations[]> {
  if (resources.length === 0) return resources
  const supa = createSupabaseAdminClient()
  const ids = resources.map((r) => r.id)
  const { data, error } = await supa
    .from("resource_topics")
    .select("resource_id, topic:topics(*)")
    .in("resource_id", ids)
  if (error) throw error
  const byResource = new Map<string, Topic[]>()
  for (const row of data ?? []) {
    const topic = pickOne<Topic>(row.topic as unknown as Topic | Topic[])
    if (!topic) continue
    const list = byResource.get(row.resource_id) ?? []
    list.push(topic)
    byResource.set(row.resource_id, list)
  }
  return resources.map((r) => ({ ...r, topics: byResource.get(r.id) ?? [] }))
}

export function readingMinutes(r: Resource): number | null {
  if (r.duration_seconds) return Math.max(1, Math.round(r.duration_seconds / 60))
  if (r.word_count) return Math.max(1, Math.round(r.word_count / 225))
  return null
}

export async function listResources(
  query: ResourceQuery = {}
): Promise<ResourceWithRelations[]> {
  const supa = createSupabaseAdminClient()

  let creatorId: string | undefined
  if (query.creator) {
    const { data } = await supa
      .from("creators")
      .select("id")
      .eq("slug", query.creator)
      .maybeSingle()
    if (!data) return []
    creatorId = data.id
  }

  let topicResourceIds: string[] | undefined
  if (query.topic) {
    const { data: topic } = await supa
      .from("topics")
      .select("id")
      .eq("slug", query.topic)
      .maybeSingle()
    if (!topic) return []
    const { data: links } = await supa
      .from("resource_topics")
      .select("resource_id")
      .eq("topic_id", topic.id)
    topicResourceIds = (links ?? []).map((l) => l.resource_id)
    if (topicResourceIds.length === 0) return []
  }

  let q = supa
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .eq("status", "published")

  if (creatorId) q = q.eq("creator_id", creatorId)
  if (query.medium) q = q.eq("medium", query.medium)
  if (topicResourceIds) q = q.in("id", topicResourceIds)
  if (query.search?.trim()) {
    q = q.textSearch("fts", query.search.trim().split(/\s+/).join(" & "))
  }

  // Sorting
  if (query.sort === "published_desc") {
    q = q.order("published_at", { ascending: false, nullsFirst: false })
  } else if (query.sort === "shuffle") {
    // PostgREST has no built-in shuffle; we just take a generous slice and
    // shuffle client-side below.
    q = q.order("added_at", { ascending: false })
  } else {
    q = q.order("added_at", { ascending: false })
  }

  if (typeof query.offset === "number" || typeof query.limit === "number") {
    const from = query.offset ?? 0
    const to = from + (query.limit ?? 60) - 1
    q = q.range(from, to)
  } else {
    q = q.limit(120)
  }

  const { data, error } = await q
  if (error) throw error

  let list = (data as unknown as RawResource[]).map(normalizeResource)

  // Reading-time filter — applied post-fetch since it's derived.
  if (query.reading_time && query.reading_time !== "any") {
    list = list.filter((r) => {
      const mins = readingMinutes(r)
      if (mins == null) return true
      if (query.reading_time === "short") return mins <= 5
      if (query.reading_time === "medium") return mins <= 15
      return mins > 15
    })
  }

  if (query.sort === "shuffle") {
    list = [...list].sort(() => Math.random() - 0.5)
  }

  return attachTopics(list)
}

export async function countResources(
  query: ResourceQuery = {}
): Promise<number> {
  const all = await listResources({
    ...query,
    limit: undefined,
    offset: undefined,
  })
  return all.length
}

export async function getResourceBySlug(
  slug: string
): Promise<ResourceDetail | null> {
  const supa = createSupabaseAdminClient()
  const { data, error } = await supa
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const base = normalizeResource(data as unknown as RawResource)
  const [withTopics] = await attachTopics([base])

  const { data: highlights } = await supa
    .from("highlights")
    .select("*")
    .eq("resource_id", base.id)
    .order("rank", { ascending: true })

  const { data: collectionLinks } = await supa
    .from("collection_items")
    .select("collection:collections(*)")
    .eq("resource_id", base.id)
  const collections: Collection[] = (collectionLinks ?? [])
    .map((row) => pickOne<Collection>(row.collection as unknown as Collection | Collection[]))
    .filter((c): c is Collection => c !== null && c.status === "published")

  return {
    ...withTopics,
    highlights: (highlights ?? []) as Highlight[],
    collections,
  }
}

export async function listCreators(): Promise<Creator[]> {
  const supa = createSupabaseAdminClient()
  const { data, error } = await supa
    .from("creators")
    .select("*")
    .order("name", { ascending: true })
  if (error) throw error
  return (data ?? []) as Creator[]
}

export async function getCreatorBySlug(
  slug: string
): Promise<Creator | null> {
  const supa = createSupabaseAdminClient()
  const { data, error } = await supa
    .from("creators")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()
  if (error) throw error
  return (data as Creator | null) ?? null
}

export async function listSources(): Promise<Source[]> {
  const supa = createSupabaseAdminClient()
  const { data, error } = await supa.from("sources").select("*").order("slug")
  if (error) throw error
  return (data ?? []) as Source[]
}

export async function listTopics(): Promise<TopicWithCount[]> {
  const supa = createSupabaseAdminClient()
  const { data, error } = await supa
    .from("topics")
    .select("*, resource_topics(resource_id)")
    .order("sort_order")
  if (error) throw error
  return (data ?? []).map((t) => {
    const links = (t as { resource_topics?: Array<{ resource_id: string }> })
      .resource_topics
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description,
      sort_order: t.sort_order,
      resource_count: links?.length ?? 0,
    } satisfies TopicWithCount
  })
}

export async function getTopicBySlug(
  slug: string
): Promise<Topic | null> {
  const supa = createSupabaseAdminClient()
  const { data, error } = await supa
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()
  if (error) throw error
  return (data as Topic | null) ?? null
}

export async function listCollections(): Promise<Collection[]> {
  const supa = createSupabaseAdminClient()
  const { data, error } = await supa
    .from("collections")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as Collection[]
}

export async function getCollectionBySlug(
  slug: string
): Promise<CollectionWithItems | null> {
  const supa = createSupabaseAdminClient()
  const { data: collection, error } = await supa
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()
  if (error) throw error
  if (!collection) return null

  const { data: items } = await supa
    .from("collection_items")
    .select(`rank, note, resource:resources(${RESOURCE_COLUMNS})`)
    .eq("collection_id", collection.id)
    .order("rank", { ascending: true })

  const built = await Promise.all(
    (items ?? []).map(async (item) => {
      const rawResource = pickOne<RawResource>(
        item.resource as unknown as RawResource | RawResource[]
      )
      if (!rawResource) return null
      const [resource] = await attachTopics([normalizeResource(rawResource)])
      return {
        rank: item.rank,
        note: item.note,
        resource: resource as unknown as ResourceWithRelations,
      }
    })
  )

  return {
    ...(collection as Collection),
    items: built.filter((x): x is NonNullable<typeof x> => x !== null),
  }
}

export async function listHighlights(
  opts: { limit?: number; offset?: number; keyOnly?: boolean } = {}
): Promise<HighlightWithResource[]> {
  const supa = createSupabaseAdminClient()
  let q = supa
    .from("highlights")
    .select(`*, resource:resources!inner(${RESOURCE_COLUMNS})`)
    .order("created_at", { ascending: false })

  if (opts.keyOnly) q = q.eq("is_key", true)
  if (opts.limit != null) {
    const from = opts.offset ?? 0
    q = q.range(from, from + opts.limit - 1)
  }

  const { data, error } = await q
  if (error) throw error

  const pairs: HighlightWithResource[] = (data ?? [])
    .map((row) => {
      const rawResource = pickOne<RawResource>(
        row.resource as unknown as RawResource | RawResource[]
      )
      if (!rawResource || rawResource.status !== "published") return null
      const highlight: Highlight = {
        id: row.id,
        resource_id: row.resource_id,
        body: row.body,
        is_key: row.is_key,
        rank: row.rank,
        context: row.context,
        timestamp_seconds: row.timestamp_seconds,
        created_at: row.created_at,
      }
      return { highlight, resource: normalizeResource(rawResource) }
    })
    .filter((x): x is HighlightWithResource => x !== null)

  const withTopics = await attachTopics(pairs.map((p) => p.resource))
  return pairs.map((p, i) => ({ ...p, resource: withTopics[i] }))
}

export async function getHighlightById(
  id: string
): Promise<HighlightWithResource | null> {
  const supa = createSupabaseAdminClient()
  const { data, error } = await supa
    .from("highlights")
    .select(`*, resource:resources!inner(${RESOURCE_COLUMNS})`)
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const rawResource = pickOne<RawResource>(
    data.resource as unknown as RawResource | RawResource[]
  )
  if (!rawResource || rawResource.status !== "published") return null
  const [resource] = await attachTopics([normalizeResource(rawResource)])
  return {
    highlight: {
      id: data.id,
      resource_id: data.resource_id,
      body: data.body,
      is_key: data.is_key,
      rank: data.rank,
      context: data.context,
      timestamp_seconds: data.timestamp_seconds,
      created_at: data.created_at,
    },
    resource,
  }
}

export async function listKeyHighlights(): Promise<HighlightWithResource[]> {
  return listHighlights({ keyOnly: true, limit: 200 })
}

export async function getDailyHighlight(
  isoDate: string
): Promise<HighlightWithResource | null> {
  const supa = createSupabaseAdminClient()
  const { data } = await supa
    .from("daily_highlights")
    .select("highlight_id")
    .lte("date", isoDate)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return null
  return getHighlightById(data.highlight_id)
}

export async function listRelatedResources(
  resourceSlug: string,
  limit = 4
): Promise<ResourceWithRelations[]> {
  const supa = createSupabaseAdminClient()
  const { data: target } = await supa
    .from("resources")
    .select("id, creator_id")
    .eq("slug", resourceSlug)
    .maybeSingle()
  if (!target) return []

  const { data: sameCreator } = await supa
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .eq("creator_id", target.creator_id)
    .neq("id", target.id)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit)

  let list = (sameCreator ?? []).map((r) =>
    normalizeResource(r as unknown as RawResource)
  )

  if (list.length < limit) {
    const { data: topicLinks } = await supa
      .from("resource_topics")
      .select("topic_id")
      .eq("resource_id", target.id)
    const topicIds = (topicLinks ?? []).map((l) => l.topic_id)
    if (topicIds.length > 0) {
      const { data: byTopic } = await supa
        .from("resource_topics")
        .select(`resource:resources!inner(${RESOURCE_COLUMNS})`)
        .in("topic_id", topicIds)
        .neq("resource_id", target.id)
        .limit(limit * 2)

      const seen = new Set(list.map((r) => r.id))
      const more: ResourceWithRelations[] = []
      for (const row of byTopic ?? []) {
        const raw = pickOne<RawResource>(
          row.resource as unknown as RawResource | RawResource[]
        )
        if (!raw || raw.status !== "published") continue
        if (seen.has(raw.id)) continue
        seen.add(raw.id)
        more.push(normalizeResource(raw))
        if (list.length + more.length >= limit) break
      }
      list = [...list, ...more]
    }
  }

  return attachTopics(list)
}

export async function listFilterOptions(): Promise<{
  creators: Creator[]
  topics: Topic[]
  media: ResourceMedium[]
}> {
  const [creators, topics] = await Promise.all([listCreators(), listTopics()])
  return {
    creators,
    topics: topics.map(({ resource_count: _c, ...t }) => {
      void _c
      return t
    }),
    media: ["essay", "video", "podcast", "lecture", "letter"],
  }
}

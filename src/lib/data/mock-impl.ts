// Mock implementation of the data layer. Same function signatures as the
// Supabase adapter. Used when Supabase env is not set.

import type {
  Collection,
  CollectionWithItems,
  Creator,
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
import {
  COLLECTIONS,
  COLLECTION_ITEMS,
  CREATORS,
  DAILY_HIGHLIGHTS,
  HIGHLIGHTS,
  RESOURCES,
  RESOURCE_TOPICS,
  SOURCES,
  TOPICS,
  buildCollectionWithItems,
  findResourceDetailBySlug,
} from "./mock"

function attachRelations(resource: Resource): ResourceWithRelations {
  const creator = CREATORS.find((c) => c.id === resource.creator_id)!
  const source = SOURCES.find((s) => s.id === resource.source_id)!
  const topicIds = RESOURCE_TOPICS.filter(
    (rt) => rt.resource_id === resource.id
  ).map((rt) => rt.topic_id)
  const topics = TOPICS.filter((t) => topicIds.includes(t.id))
  return { ...resource, creator, source, topics }
}

function readingMinutes(r: Resource): number | null {
  if (r.duration_seconds) return Math.max(1, Math.round(r.duration_seconds / 60))
  if (r.word_count) return Math.max(1, Math.round(r.word_count / 225))
  return null
}

function applyReadingTime(
  list: Resource[],
  bucket: ResourceQuery["reading_time"]
): Resource[] {
  if (!bucket || bucket === "any") return list
  return list.filter((r) => {
    const mins = readingMinutes(r)
    if (mins == null) return true
    if (bucket === "short") return mins <= 5
    if (bucket === "medium") return mins <= 15
    return mins > 15
  })
}

function applySort(list: Resource[], sort: ResourceQuery["sort"]): Resource[] {
  if (sort === "shuffle") return [...list].sort(() => Math.random() - 0.5)
  if (sort === "published_desc")
    return [...list].sort((a, b) =>
      (b.published_at ?? "").localeCompare(a.published_at ?? "")
    )
  return [...list].sort((a, b) => b.added_at.localeCompare(a.added_at))
}

export async function listResources(
  query: ResourceQuery = {}
): Promise<ResourceWithRelations[]> {
  let list = RESOURCES.filter((r) => r.status === "published")
  if (query.creator) {
    const c = CREATORS.find((x) => x.slug === query.creator)
    list = c ? list.filter((r) => r.creator_id === c.id) : []
  }
  if (query.topic) {
    const t = TOPICS.find((x) => x.slug === query.topic)
    if (!t) list = []
    else {
      const ids = new Set(
        RESOURCE_TOPICS.filter((rt) => rt.topic_id === t.id).map(
          (rt) => rt.resource_id
        )
      )
      list = list.filter((r) => ids.has(r.id))
    }
  }
  if (query.medium) list = list.filter((r) => r.medium === query.medium)
  if (query.search?.trim()) {
    const q = query.search.toLowerCase().trim()
    list = list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    )
  }
  list = applyReadingTime(list, query.reading_time)
  list = applySort(list, query.sort)
  if (typeof query.offset === "number" || typeof query.limit === "number") {
    const off = query.offset ?? 0
    const lim = query.limit ?? list.length
    list = list.slice(off, off + lim)
  }
  return list.map(attachRelations)
}

export async function countResources(
  query: ResourceQuery = {}
): Promise<number> {
  const all = await listResources({ ...query, limit: undefined, offset: undefined })
  return all.length
}

export async function getResourceBySlug(
  slug: string
): Promise<ResourceDetail | null> {
  return findResourceDetailBySlug(slug) ?? null
}

export async function listCreators(): Promise<Creator[]> {
  return CREATORS
}

export async function getCreatorBySlug(slug: string): Promise<Creator | null> {
  return CREATORS.find((c) => c.slug === slug) ?? null
}

export async function listSources(): Promise<Source[]> {
  return SOURCES
}

export async function listTopics(): Promise<TopicWithCount[]> {
  return TOPICS.map((t) => ({
    ...t,
    resource_count: RESOURCE_TOPICS.filter((rt) => rt.topic_id === t.id).length,
  })).sort((a, b) => a.sort_order - b.sort_order)
}

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  return TOPICS.find((t) => t.slug === slug) ?? null
}

export async function listCollections(): Promise<Collection[]> {
  return COLLECTIONS.filter((c) => c.status === "published")
}

export async function getCollectionBySlug(
  slug: string
): Promise<CollectionWithItems | null> {
  return buildCollectionWithItems(slug) ?? null
}

export async function listHighlights(
  opts: { limit?: number; offset?: number; keyOnly?: boolean } = {}
): Promise<HighlightWithResource[]> {
  const filtered = opts.keyOnly
    ? HIGHLIGHTS.filter((h) => h.is_key)
    : HIGHLIGHTS
  const sorted = [...filtered].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  )
  const sliced =
    opts.limit != null
      ? sorted.slice(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit)
      : sorted
  return sliced.map((highlight) => {
    const resource = RESOURCES.find((r) => r.id === highlight.resource_id)!
    return { highlight, resource: attachRelations(resource) }
  })
}

export async function listKeyHighlights(): Promise<HighlightWithResource[]> {
  return listHighlights({ keyOnly: true })
}

export async function getHighlightById(
  id: string
): Promise<HighlightWithResource | null> {
  const h = HIGHLIGHTS.find((x) => x.id === id)
  if (!h) return null
  const resource = RESOURCES.find((r) => r.id === h.resource_id)!
  return { highlight: h, resource: attachRelations(resource) }
}

export async function getDailyHighlight(
  isoDate: string
): Promise<HighlightWithResource | null> {
  const entry = DAILY_HIGHLIGHTS.find((d) => d.date === isoDate)
  if (!entry) {
    const past = [...DAILY_HIGHLIGHTS]
      .filter((d) => d.date <= isoDate)
      .sort((a, b) => b.date.localeCompare(a.date))
    const pick = past[0] ?? DAILY_HIGHLIGHTS[0]
    if (!pick) return null
    return getHighlightById(pick.highlight_id)
  }
  return getHighlightById(entry.highlight_id)
}

export async function listRelatedResources(
  resourceSlug: string,
  limit = 4
): Promise<ResourceWithRelations[]> {
  const target = RESOURCES.find((r) => r.slug === resourceSlug)
  if (!target) return []
  const sameCreator = RESOURCES.filter(
    (r) => r.creator_id === target.creator_id && r.id !== target.id
  )
  const targetTopicIds = new Set(
    RESOURCE_TOPICS.filter((rt) => rt.resource_id === target.id).map(
      (rt) => rt.topic_id
    )
  )
  const sameTopic = RESOURCES.filter((r) => {
    if (r.id === target.id) return false
    if (sameCreator.find((c) => c.id === r.id)) return false
    const ids = RESOURCE_TOPICS.filter((rt) => rt.resource_id === r.id).map(
      (rt) => rt.topic_id
    )
    return ids.some((id) => targetTopicIds.has(id))
  })
  return [...sameCreator, ...sameTopic].slice(0, limit).map(attachRelations)
}

export async function listFilterOptions(): Promise<{
  creators: Creator[]
  topics: Topic[]
  media: ResourceMedium[]
}> {
  return {
    creators: CREATORS,
    topics: [...TOPICS].sort((a, b) => a.sort_order - b.sort_order),
    media: ["essay", "video", "podcast", "lecture", "letter"],
  }
}

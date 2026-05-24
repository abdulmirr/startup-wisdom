// Hand-written types matching the Supabase schema in supabase/migrations/.
// Replace with generated types (`supabase gen types typescript`) once linked.

export type ResourceMedium =
  | "essay"
  | "video"
  | "podcast"
  | "lecture"
  | "letter"

export type ResourceStatus = "draft" | "published" | "hidden"
export type ExtractionStatus = "pending" | "running" | "done" | "failed"
export type SourceKind = "blog" | "youtube" | "podcast" | "letters" | "lectures"

// Used to override the default `object-cover` center crop when a thumbnail's
// subject sits off-center (e.g. a head at the top of a portrait photo).
export type ThumbnailPosition = "top" | "center" | "bottom" | "left" | "right"

export interface Creator {
  id: string
  slug: string
  name: string
  bio: string | null
  avatar_url: string | null
  homepage_url: string | null
}

export interface Source {
  id: string
  slug: string
  name: string
  base_url: string
  kind: SourceKind
}

export interface Topic {
  id: string
  slug: string
  name: string
  description: string | null
  sort_order: number
}

export interface Resource {
  id: string
  slug: string
  title: string
  creator_id: string
  source_id: string
  medium: ResourceMedium
  external_url: string
  external_id: string | null
  thumbnail_url: string | null
  thumbnail_position: ThumbnailPosition | null
  duration_seconds: number | null
  word_count: number | null
  published_at: string | null
  added_at: string
  description: string | null
  status: ResourceStatus
  extraction_status: ExtractionStatus
}

export interface Highlight {
  id: string
  resource_id: string
  body: string
  is_key: boolean
  rank: number
  context: string | null
  timestamp_seconds: number | null
  created_at: string
}

export interface Collection {
  id: string
  slug: string
  title: string
  description: string | null
  cover_image: string | null
  status: ResourceStatus
  created_at: string
}

export interface CollectionItem {
  collection_id: string
  resource_id: string
  rank: number
  note: string | null
}

// Joined / view types ---------------------------------------------------------

export interface ResourceWithRelations extends Resource {
  creator: Creator
  source: Source
  topics: Topic[]
}

export interface ResourceDetail extends ResourceWithRelations {
  highlights: Highlight[]
  collections: Collection[]
}

export interface HighlightWithResource {
  highlight: Highlight
  resource: ResourceWithRelations
}

export interface CollectionWithItems extends Collection {
  items: Array<{
    resource: ResourceWithRelations
    rank: number
    note: string | null
  }>
}

export interface TopicWithCount extends Topic {
  resource_count: number
}

// Filter / query types --------------------------------------------------------

export interface ResourceQuery {
  creator?: string
  topic?: string
  medium?: ResourceMedium
  reading_time?: "short" | "medium" | "long" | "any"
  sort?: "added_desc" | "published_desc" | "shuffle"
  search?: string
  limit?: number
  offset?: number
}

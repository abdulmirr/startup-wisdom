import type { ResourceMedium } from "../../../src/lib/types"

/** What every fetcher returns. The dispatcher upserts these into Supabase. */
export interface FetchedResource {
  source_slug: string
  creator_slug: string
  external_url: string
  external_id?: string
  slug: string
  title: string
  description?: string
  medium: ResourceMedium
  duration_seconds?: number
  word_count?: number
  published_at?: string
  thumbnail_url?: string
  /** Full text used for AI extraction. Mandatory. */
  raw_text: string
}

// Data access layer. Components import from here, never from the
// implementations. Dispatches between mock (during demo) and Supabase
// (production) based on env. When Supabase env is set, the real adapter
// runs; otherwise mock returns the hand-seeded data.

import { env } from "../env"
import * as mockImpl from "./mock-impl"
import * as supabaseImpl from "./supabase"
import type {
  Collection,
  CollectionWithItems,
  Creator,
  HighlightWithResource,
  ResourceDetail,
  ResourceMedium,
  ResourceQuery,
  ResourceWithRelations,
  Source,
  Topic,
  TopicWithCount,
} from "../types"

export const usingMockData =
  !env.NEXT_PUBLIC_SUPABASE_URL ||
  !env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  !env.SUPABASE_SERVICE_ROLE_KEY

const impl = usingMockData ? mockImpl : supabaseImpl

export const listResources = (
  q?: ResourceQuery
): Promise<ResourceWithRelations[]> => impl.listResources(q)
export const countResources = (q?: ResourceQuery): Promise<number> =>
  impl.countResources(q)
export const getResourceBySlug = (slug: string): Promise<ResourceDetail | null> =>
  impl.getResourceBySlug(slug)
export const listCreators = (): Promise<Creator[]> => impl.listCreators()
export const getCreatorBySlug = (slug: string): Promise<Creator | null> =>
  impl.getCreatorBySlug(slug)
export const listSources = (): Promise<Source[]> => impl.listSources()
export const listTopics = (): Promise<TopicWithCount[]> => impl.listTopics()
export const getTopicBySlug = (slug: string): Promise<Topic | null> =>
  impl.getTopicBySlug(slug)
export const listCollections = (): Promise<Collection[]> =>
  impl.listCollections()
export const getCollectionBySlug = (
  slug: string
): Promise<CollectionWithItems | null> => impl.getCollectionBySlug(slug)
export const listHighlights = (
  opts?: { limit?: number; offset?: number; keyOnly?: boolean }
): Promise<HighlightWithResource[]> => impl.listHighlights(opts)
export const listKeyHighlights = (): Promise<HighlightWithResource[]> =>
  impl.listKeyHighlights()
export const getHighlightById = (
  id: string
): Promise<HighlightWithResource | null> => impl.getHighlightById(id)
export const getDailyHighlight = (
  isoDate: string
): Promise<HighlightWithResource | null> => impl.getDailyHighlight(isoDate)
export const listRelatedResources = (
  resourceSlug: string,
  limit?: number
): Promise<ResourceWithRelations[]> =>
  impl.listRelatedResources(resourceSlug, limit)
export const listFilterOptions = (): Promise<{
  creators: Creator[]
  topics: Topic[]
  media: ResourceMedium[]
}> => impl.listFilterOptions()

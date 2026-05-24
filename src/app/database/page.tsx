import { Suspense } from "react"

import { FilterBar } from "@/components/resource/filter-bar"
import { ResourceGrid } from "@/components/resource/resource-grid"
import { ResourceList } from "@/components/resource/resource-list"
import { PageShell } from "@/components/page-shell"
import {
  listFilterOptions,
  listResources,
} from "@/lib/data"
import type {
  ResourceMedium,
  ResourceQuery,
} from "@/lib/types"

export const metadata = {
  title: "Database",
  description:
    "The full archive of founder essays, talks, and interviews. Filter, sort, and search.",
}

type SearchParams = Promise<{
  creator?: string
  topic?: string
  medium?: string
  reading_time?: string
  sort?: string
  view?: string
  q?: string
  r?: string
}>

const VALID_MEDIA: ResourceMedium[] = ["essay", "video", "podcast", "lecture", "letter"]

function parseQuery(params: Awaited<SearchParams>): ResourceQuery {
  const medium =
    params.medium && (VALID_MEDIA as string[]).includes(params.medium)
      ? (params.medium as ResourceMedium)
      : undefined
  const reading_time =
    params.reading_time === "short" ||
    params.reading_time === "medium" ||
    params.reading_time === "long"
      ? params.reading_time
      : undefined
  const sort =
    params.sort === "published_desc" || params.sort === "shuffle"
      ? params.sort
      : "added_desc"
  return {
    creator: params.creator || undefined,
    topic: params.topic || undefined,
    medium,
    reading_time,
    sort,
    search: params.q || undefined,
  }
}

export default async function DatabasePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const query = parseQuery(params)
  const [resources, options] = await Promise.all([
    listResources(query),
    listFilterOptions(),
  ])
  const view = params.view === "list" ? "list" : "grid"

  return (
    <PageShell
      eyebrow="Database"
      title="Everything in the archive."
      description="Filter by creator, topic, medium, or reading time. Open any card to read the highlights."
      width="wide"
    >
      <Suspense fallback={null}>
        <FilterBar creators={options.creators} topics={options.topics} />
      </Suspense>

      {view === "list" ? (
        <ResourceList resources={resources} />
      ) : (
        <ResourceGrid resources={resources} />
      )}
    </PageShell>
  )
}

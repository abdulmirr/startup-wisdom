import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { CollectionPosterCard } from "@/components/collection/collection-poster-card"
import { FilterBar } from "@/components/resource/filter-bar"
import { ResourceGrid } from "@/components/resource/resource-grid"
import { ResourceList } from "@/components/resource/resource-list"
import { SubscribeForm } from "@/components/subscribe-form"
import {
  listCollections,
  listFilterOptions,
  listResources,
} from "@/lib/data"
import type {
  ResourceMedium,
  ResourceQuery,
} from "@/lib/types"

export const metadata = {
  title: "Startup Wisdom — The founder archive",
  description:
    "The greatest founder wisdom on the internet, indexed and searchable.",
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

const COLLECTION_COVERS: Record<string, { src: string; alt: string }> = {
  "finding-ideas": {
    src: "/paintings/melencolia-i.webp",
    alt: "Albrecht Dürer, Melencolia I",
  },
  "cold-start": {
    src: "/paintings/tower-of-babel.webp",
    alt: "Pieter Bruegel, The Tower of Babel",
  },
  "founder-mode-playbook": {
    src: "/paintings/wanderer-above-the-sea-of-fog.webp",
    alt: "Caspar David Friedrich, Wanderer Above the Sea of Fog",
  },
  "time-management": {
    src: "/paintings/the-geographer.webp",
    alt: "Johannes Vermeer, The Geographer",
  },
}

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

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const query = parseQuery(params)
  const [resources, options, collections] = await Promise.all([
    listResources(query),
    listFilterOptions(),
    listCollections(),
  ])
  const view = params.view === "list" ? "list" : "grid"

  return (
    <div className="mx-auto w-full max-w-[90rem] px-5 pb-24 sm:px-8">
      {/* Hero */}
      <section className="mx-auto max-w-2xl pt-14 pb-14 text-center sm:pt-20 sm:pb-16">
        <h1 className="font-serif text-[1.82rem] font-semibold leading-[1.1] tracking-tight text-ink sm:text-[2.25rem] md:text-[2.75rem]">
          Discover the greatest founder wisdom on the internet.
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-ink-muted sm:text-[1.0625rem]">
          Subscribe to get one timeless startup resource in your inbox every
          week day.
        </p>
        <SubscribeForm
          id="hero-email"
          medium="hero"
          className="mx-auto mt-8 max-w-md"
        />
        <Link
          href="/newsletter"
          className="mt-4 inline-flex items-center gap-1 text-sm text-ink-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          See the latest issue
          <ArrowRight className="size-3.5" />
        </Link>
      </section>

      {collections.length > 0 && (
        <section id="collections" className="mb-20 scroll-mt-24">
          <h2 className="mb-8 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Collections
          </h2>
          <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {collections.map((c, i) => (
              <li key={c.id}>
                <CollectionPosterCard
                  collection={c}
                  cover={COLLECTION_COVERS[c.slug]}
                  index={i}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-6 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Database
        </h2>
        <Suspense fallback={null}>
          <FilterBar creators={options.creators} topics={options.topics} />
        </Suspense>

        {view === "list" ? (
          <ResourceList resources={resources} />
        ) : (
          <ResourceGrid resources={resources} />
        )}
      </section>
    </div>
  )
}

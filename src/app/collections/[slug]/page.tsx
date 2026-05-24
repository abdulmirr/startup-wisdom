import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight } from "lucide-react"

import {
  formatPublishedDate,
  formatReadingTime,
  mediumLabel,
} from "@/lib/format"
import {
  getCollectionBySlug,
  listCollections,
} from "@/lib/data"
import type { ResourceWithRelations } from "@/lib/types"

export async function generateStaticParams() {
  const collections = await listCollections()
  return collections.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)
  if (!collection) return {}
  return {
    title: collection.title,
    description: collection.description ?? undefined,
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)
  if (!collection) notFound()

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <header className="mb-14">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-brand">
          Curated path · {collection.items.length} items
        </p>
        <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            {collection.description}
          </p>
        )}
      </header>

      <ol className="overflow-hidden rounded-lg border border-line bg-surface-2 shadow-xs">
        {collection.items.map((item, i) => {
          const r = item.resource as unknown as ResourceWithRelations
          const reading = formatReadingTime(r.duration_seconds, r.word_count)
          const date = formatPublishedDate(r.published_at)
          return (
            <li
              key={r.id}
              className={i > 0 ? "border-t border-line" : undefined}
            >
              <Link
                href={`/resource/${r.slug}`}
                className="group flex items-start gap-6 px-6 py-5 transition-colors hover:bg-surface-3"
              >
                <span className="pt-1 font-mono text-sm font-medium tabular-nums text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-lg font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-brand">
                    {r.title}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    {r.creator.name}
                    {date ? ` · ${date}` : ""}
                    {reading ? ` · ${reading}` : ""}
                    <span className="text-ink-soft"> · {mediumLabel(r.medium)}</span>
                  </p>
                  {item.note && (
                    <p className="mt-2 border-l-2 border-brand/30 pl-3 text-sm italic text-ink-muted">
                      {item.note}
                    </p>
                  )}
                </div>
                <ArrowUpRight className="mt-1 size-4 shrink-0 text-ink-soft transition-colors group-hover:text-brand" />
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

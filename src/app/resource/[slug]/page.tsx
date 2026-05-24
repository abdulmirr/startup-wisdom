import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight } from "lucide-react"

import { BookmarkButton } from "@/components/bookmark-button"
import { HighlightCard } from "@/components/highlight/highlight-card"
import { KeyHighlight } from "@/components/highlight/key-highlight"
import { ResourceCard } from "@/components/resource/resource-card"
import { SectionHeading } from "@/components/page-shell"
import { ShareButton } from "@/components/share-button"
import { TopicChip } from "@/components/topic-chip"
import { Button } from "@/components/ui/button"
import {
  getResourceBySlug,
  listRelatedResources,
} from "@/lib/data"
import {
  formatPublishedDate,
  formatReadingTime,
  mediumLabel,
  mediumVerb,
} from "@/lib/format"
import { cn } from "@/lib/utils"
import { listResources } from "@/lib/data"

export async function generateStaticParams() {
  const resources = await listResources({ limit: 500 })
  return resources.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const detail = await getResourceBySlug(slug)
  if (!detail) return {}
  return {
    title: detail.title,
    description: detail.description ?? undefined,
  }
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const detail = await getResourceBySlug(slug)
  if (!detail) notFound()

  const related = await listRelatedResources(slug, 4)
  const keyHighlight = detail.highlights.find((h) => h.is_key)
  const supporting = detail.highlights.filter((h) => !h.is_key)
  const reading = formatReadingTime(
    detail.duration_seconds,
    detail.word_count
  )
  const date = formatPublishedDate(detail.published_at)

  const cover = detail.thumbnail_url || detail.creator.avatar_url
  const coverIsCreatorAvatar =
    !detail.thumbnail_url && !!detail.creator.avatar_url

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
        <aside className="lg:col-span-5 lg:sticky lg:top-20 lg:self-start">
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-brand">
            {mediumLabel(detail.medium)} · {detail.source.name}
          </p>
          <h1 className="mt-4 font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-[2.5rem]">
            {detail.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm text-ink-muted">
            <Link
              href={`/creator/${detail.creator.slug}`}
              className="font-medium text-ink underline-offset-4 hover:text-brand hover:underline"
            >
              {detail.creator.name}
            </Link>
            {date && <span className="text-ink-soft" aria-hidden>·</span>}
            {date && <span>{date}</span>}
            {reading && <span className="text-ink-soft" aria-hidden>·</span>}
            {reading && <span>{reading}</span>}
          </div>

          {cover && (
            <div className="relative mt-7 aspect-[16/9] w-full overflow-hidden rounded-lg border border-line bg-surface-3 shadow-sm">
              <Image
                src={cover}
                alt={detail.title}
                fill
                sizes="(min-width: 1024px) 28rem, (min-width: 640px) 100vw, 100vw"
                priority
                className={cn(
                  "object-cover",
                  coverIsCreatorAvatar && "object-top"
                )}
              />
            </div>
          )}

          {detail.description && (
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-ink-muted">
              {detail.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-1.5">
            <Button
              render={
                <a
                  href={detail.external_url}
                  target="_blank"
                  rel="noreferrer noopener"
                />
              }
              nativeButton={false}
              size="sm"
            >
              {mediumVerb(detail.medium)} on {detail.source.name}
              <ArrowUpRight className="size-3.5" />
            </Button>
            <BookmarkButton type="resource" id={detail.id} size="sm" />
            {keyHighlight && (
              <ShareButton
                quote={keyHighlight.body}
                attribution={`— ${detail.creator.name}, ${detail.title}`}
                permalinkPath={`/h/${keyHighlight.id}`}
                variant="compact"
              />
            )}
          </div>

          {detail.topics.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-1.5">
              {detail.topics.map((t) => (
                <TopicChip key={t.id} topic={t} />
              ))}
            </div>
          )}

          {detail.collections.length > 0 && (
            <div className="mt-8 border-t border-line pt-6">
              <p className="mb-3 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-ink-soft">
                Featured in
              </p>
              <ul className="space-y-1">
                {detail.collections.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/collections/${c.slug}`}
                      className="group flex items-center justify-between gap-4 py-1.5 text-sm transition-colors"
                    >
                      <span className="font-serif text-base font-medium text-ink transition-colors group-hover:text-brand">
                        {c.title}
                      </span>
                      <ArrowUpRight className="size-3.5 shrink-0 text-ink-soft transition-colors group-hover:text-brand" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className="lg:col-span-7">
          {keyHighlight && (
            <section className="mb-10">
              <KeyHighlight
                highlight={keyHighlight}
                className="px-6 py-9 sm:px-9 sm:py-11"
              />
            </section>
          )}

          {supporting.length > 0 && (
            <section>
              <SectionHeading>Highlights ({supporting.length})</SectionHeading>
              <div className="grid gap-3">
                {supporting.map((h) => (
                  <HighlightCard key={h.id} highlight={h} />
                ))}
              </div>
            </section>
          )}

          {!keyHighlight && supporting.length === 0 && (
            <div className="rounded-lg border border-dashed border-line bg-surface-2 px-6 py-12 text-center">
              <p className="font-serif text-lg text-ink-muted">
                No highlights yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-12">
          <SectionHeading>Keep reading</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

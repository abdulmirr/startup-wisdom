import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, ExternalLink } from "lucide-react"

import { BookmarkButton } from "@/components/bookmark-button"
import { HighlightSpotlight } from "@/components/highlight/highlight-spotlight"
import { ShareButton } from "@/components/share-button"
import { getHighlightById, listHighlights } from "@/lib/data"

export async function generateStaticParams() {
  const all = await listHighlights({ limit: 2000 })
  return all.map((h) => ({ id: h.highlight.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getHighlightById(id)
  if (!data) return {}
  const { highlight, resource } = data
  return {
    title: `${resource.title} — highlight`,
    description: highlight.body,
  }
}

export default async function HighlightPermalinkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getHighlightById(id)
  if (!data) notFound()

  const { highlight, resource } = data

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <Link
        href="/highlights"
        className="mb-10 inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-brand"
      >
        <ChevronLeft className="size-4" />
        Back to highlights
      </Link>

      <HighlightSpotlight data={data} variant="large" surface="feature" />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <a
          href={resource.external_url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-surface-2 px-3 text-sm font-medium text-ink shadow-xs transition-colors hover:bg-surface-3"
        >
          <ExternalLink className="size-3.5" />
          Visit source
        </a>
        <BookmarkButton type="highlight" id={highlight.id} size="md" />
        <ShareButton
          quote={highlight.body}
          attribution={`— ${resource.creator.name}, ${resource.title}`}
          permalinkPath={`/h/${highlight.id}`}
        />
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Link2,
  Share2,
} from "lucide-react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBookmarks } from "@/lib/bookmarks"
import { formatPublishedDate } from "@/lib/format"
import type { HighlightWithResource } from "@/lib/types"

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2H21.5l-7.5 8.567L22.96 22h-6.83l-5.347-6.99L4.7 22H1.44l8.022-9.166L1.04 2h6.998l4.832 6.39L18.244 2Zm-1.196 18h1.886L7.04 4H5.063l11.985 16Z" />
    </svg>
  )
}

interface HighlightViewerProps {
  highlights: HighlightWithResource[]
  initialId?: string
}

export function HighlightViewer({
  highlights,
  initialId: defaultInitialId,
}: HighlightViewerProps) {
  const params = useSearchParams()
  const queryId = params.get("id")
  const { isHighlightSaved, toggleHighlight } = useBookmarks()

  const indexById = useMemo(
    () =>
      Object.fromEntries(
        highlights.map((h, i) => [h.highlight.id, i] as const)
      ),
    [highlights]
  )

  const startId = queryId ?? defaultInitialId
  const initial =
    startId && indexById[startId] != null ? indexById[startId] : 0
  const [index, setIndex] = useState(initial)

  const current = highlights[index]

  const go = useCallback(
    (next: number) => {
      const safe =
        ((next % highlights.length) + highlights.length) % highlights.length
      setIndex(safe)
      const id = highlights[safe].highlight.id
      const url = new URL(window.location.href)
      url.searchParams.set("id", id)
      window.history.replaceState(null, "", url.pathname + url.search)
    },
    [highlights]
  )

  const indexRef = useRef(index)
  const goRef = useRef(go)
  useEffect(() => {
    indexRef.current = index
    goRef.current = go
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.isContentEditable)
      ) {
        return
      }
      if (e.key === "ArrowRight") {
        e.preventDefault()
        goRef.current(indexRef.current + 1)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        goRef.current(indexRef.current - 1)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  if (!current) {
    return (
      <p className="text-center text-sm text-ink-muted">No highlights yet.</p>
    )
  }

  const { highlight, resource } = current
  const date = formatPublishedDate(resource.published_at)
  const saved = isHighlightSaved(highlight.id)

  function permalinkUrl() {
    const path = `/h/${highlight.id}`
    if (typeof window === "undefined") return path
    return new URL(path, window.location.origin).toString()
  }

  function handleSave() {
    toggleHighlight(highlight.id)
    toast(saved ? "Removed from saved" : "Saved", { duration: 1500 })
  }

  async function copyQuote() {
    const text = `"${highlight.body}"\n\n— ${resource.creator.name}, ${resource.title}\n${permalinkUrl()}`
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Quote copied")
    } catch {
      toast.error("Couldn't copy")
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(permalinkUrl())
      toast.success("Link copied")
    } catch {
      toast.error("Couldn't copy")
    }
  }

  function tweet() {
    const tweetText = `"${highlight.body.length > 200 ? highlight.body.slice(0, 199).trimEnd() + "…" : highlight.body}"\n\n— ${resource.creator.name}, ${resource.title}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(permalinkUrl())}`
    window.open(url, "_blank", "noopener,width=600,height=600")
  }

  const SaveIcon = saved ? BookmarkCheck : Bookmark

  return (
    <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
      <article className="rounded-2xl border border-line bg-surface-2 px-7 py-8 shadow-xs sm:px-10 sm:py-10">
        <p className="font-serif text-2xl leading-snug text-ink sm:text-3xl">
          {highlight.body}
        </p>
        <div className="mt-8">
          <Link
            href={`/resource/${resource.slug}`}
            className="font-serif text-base font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
          >
            {resource.title}
          </Link>
          <p className="mt-1 text-sm text-ink-muted">
            {resource.creator.name}
            {date ? ` · ${date}` : ""}
          </p>
        </div>
      </article>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex items-center overflow-hidden rounded-full border border-line bg-surface-2 shadow-xs">
          <button
            type="button"
            onClick={handleSave}
            aria-label={saved ? "Remove bookmark" : "Save"}
            className="inline-flex h-9 items-center gap-1.5 px-4 text-sm text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <SaveIcon className="size-3.5" />
            {saved ? "Saved" : "Save"}
          </button>
          <span className="h-5 w-px bg-line" />
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center gap-1.5 px-4 text-sm text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink aria-expanded:bg-surface-3 aria-expanded:text-ink">
              <Share2 className="size-3.5" />
              Share
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-44">
              <DropdownMenuItem onSelect={tweet}>
                <XLogo className="mr-2 size-4" />
                Post on X
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={copyQuote}>
                <Link2 className="mr-2 size-4 opacity-0" />
                Copy quote
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={copyLink}>
                <Link2 className="mr-2 size-4" />
                Copy link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="h-5 w-px bg-line" />
          <a
            href={resource.external_url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-9 items-center gap-1.5 px-4 text-sm text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <ExternalLink className="size-3.5" />
            Visit
          </a>
        </div>

        <div className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 shadow-xs">
          <button
            type="button"
            aria-label="Previous highlight"
            onClick={() => go(index - 1)}
            className="inline-flex size-6 items-center justify-center rounded-md border border-line bg-surface-1 text-xs text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <span aria-hidden>←</span>
          </button>
          <button
            type="button"
            aria-label="Next highlight"
            onClick={() => go(index + 1)}
            className="inline-flex size-6 items-center justify-center rounded-md border border-line bg-surface-1 text-xs text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <span aria-hidden>→</span>
          </button>
          <span className="pl-0.5 pr-1.5 text-xs text-ink-muted">
            to browse
          </span>
        </div>
      </div>
    </div>
  )
}

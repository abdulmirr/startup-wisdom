"use client"

import { useEffect, useState } from "react"

import { HighlightCard } from "@/components/highlight/highlight-card"
import { ResourceGrid } from "@/components/resource/resource-grid"
import { SectionHeading } from "@/components/page-shell"
import { useBookmarks } from "@/lib/bookmarks"
import type {
  HighlightWithResource,
  ResourceWithRelations,
} from "@/lib/types"

interface ApiResponse {
  resources: ResourceWithRelations[]
  highlights: HighlightWithResource[]
}

export function SavedView() {
  const { bookmarks } = useBookmarks()
  const [data, setData] = useState<ApiResponse>({
    resources: [],
    highlights: [],
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const params = new URLSearchParams()
      if (bookmarks.resources.length)
        params.set("resources", bookmarks.resources.join(","))
      if (bookmarks.highlights.length)
        params.set("highlights", bookmarks.highlights.join(","))

      if (params.toString() === "") {
        if (!cancelled) {
          setData({ resources: [], highlights: [] })
          setLoaded(true)
        }
        return
      }

      const res = await fetch(`/api/bookmarks?${params.toString()}`)
      const json = (await res.json()) as ApiResponse
      if (!cancelled) {
        setData(json)
        setLoaded(true)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [bookmarks])

  if (!loaded) {
    return <p className="text-sm text-ink-muted">Loading your saves…</p>
  }

  const empty = data.resources.length === 0 && data.highlights.length === 0

  if (empty) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface-2 px-6 py-16 text-center">
        <p className="font-serif text-xl font-semibold text-ink">
          Nothing saved yet.
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Open any resource and tap <span className="font-medium text-ink">Save</span>{" "}
          to keep it here. Your saves live on this device.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {data.resources.length > 0 && (
        <section>
          <SectionHeading>
            Saved resources ({data.resources.length})
          </SectionHeading>
          <ResourceGrid resources={data.resources} />
        </section>
      )}
      {data.highlights.length > 0 && (
        <section>
          <SectionHeading>
            Saved highlights ({data.highlights.length})
          </SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.highlights.map((h) => (
              <HighlightCard key={h.highlight.id} highlight={h.highlight} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

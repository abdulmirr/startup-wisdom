import { NextResponse } from "next/server"

import { listCreators, listResources, listTopics } from "@/lib/data"

export const dynamic = "force-dynamic"

export interface SearchResult {
  kind: "resource" | "creator" | "topic"
  title: string
  subtitle?: string
  href: string
}

function score(text: string, q: string): number {
  const lowered = text.toLowerCase()
  const idx = lowered.indexOf(q)
  if (idx === -1) return 0
  // Earlier match = higher score. Whole-prefix match best.
  return 1000 - idx
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const raw = (searchParams.get("q") || "").trim().toLowerCase()
  if (!raw) return NextResponse.json({ results: [] })

  const [resources, creators, topics] = await Promise.all([
    listResources({}),
    listCreators(),
    listTopics(),
  ])

  const results: Array<SearchResult & { _score: number }> = []

  for (const r of resources) {
    const titleScore = score(r.title, raw)
    const descScore = (r.description && score(r.description, raw) / 2) || 0
    const creatorScore = score(r.creator.name, raw) / 3
    const s = Math.max(titleScore, descScore, creatorScore)
    if (s > 0) {
      results.push({
        _score: s,
        kind: "resource",
        title: r.title,
        subtitle: `${r.creator.name} · ${r.medium}`,
        href: `/resource/${r.slug}`,
      })
    }
  }

  for (const c of creators) {
    const s = score(c.name, raw)
    if (s > 0) {
      results.push({
        _score: s,
        kind: "creator",
        title: c.name,
        subtitle: "Creator",
        href: `/creator/${c.slug}`,
      })
    }
  }

  for (const t of topics) {
    const s = score(t.name, raw)
    if (s > 0) {
      results.push({
        _score: s,
        kind: "topic",
        title: t.name,
        subtitle: `${t.resource_count} ${t.resource_count === 1 ? "resource" : "resources"}`,
        href: `/topics/${t.slug}`,
      })
    }
  }

  results.sort((a, b) => b._score - a._score)
  return NextResponse.json({
    results: results.slice(0, 20).map(({ _score, ...rest }) => {
      void _score
      return rest
    }),
  })
}

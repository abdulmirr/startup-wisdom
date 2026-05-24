import { NextResponse } from "next/server"

import {
  getHighlightById,
  getResourceBySlug,
  listResources,
} from "@/lib/data"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const resourceIds = (searchParams.get("resources") || "")
    .split(",")
    .filter(Boolean)
  const highlightIds = (searchParams.get("highlights") || "")
    .split(",")
    .filter(Boolean)

  const all = await listResources({})
  const byId = new Map(all.map((r) => [r.id, r] as const))
  const resources = resourceIds
    .map((id) => byId.get(id))
    .filter(<T,>(x: T | undefined): x is T => x != null)

  const highlights = await Promise.all(
    highlightIds.map((id) => getHighlightById(id))
  )

  return NextResponse.json({
    resources,
    highlights: highlights.filter(Boolean),
  })
}

// Suppress unused-import lint while keeping the helper available for future use.
void getResourceBySlug

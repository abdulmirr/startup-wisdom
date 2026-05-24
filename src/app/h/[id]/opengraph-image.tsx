import { ImageResponse } from "next/og"

import { getHighlightById } from "@/lib/data"
import { formatPublishedDate } from "@/lib/format"
import { loadOgFonts } from "@/lib/og-fonts"

export const alt = "archive — founder highlight"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [{ fonts }, data] = await Promise.all([
    loadOgFonts(),
    getHighlightById(id),
  ])
  if (!data) {
    return new ImageResponse(<div>not found</div>, { ...size, fonts })
  }
  const { highlight, resource } = data
  const date = formatPublishedDate(resource.published_at)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: 72,
          color: "#fafafa",
          fontFamily: "Serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: 18,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#888",
            }}
          >
            archive · highlight
          </span>
        </div>

        <blockquote
          style={{
            fontSize: highlight.body.length > 180 ? 44 : 56,
            lineHeight: 1.18,
            letterSpacing: -0.5,
            margin: 0,
            fontFamily: "Serif",
            color: "#fafafa",
            maxWidth: 1050,
          }}
        >
          &ldquo;{truncate(highlight.body, 320)}&rdquo;
        </blockquote>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 26 }}>{resource.creator.name}</span>
            <span style={{ fontSize: 18, color: "#888" }}>
              {resource.title}
              {date ? ` · ${date}` : ""}
            </span>
          </div>
          <span style={{ fontSize: 18, color: "#666" }}>archive</span>
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s
  return s.slice(0, n - 1).trimEnd() + "…"
}

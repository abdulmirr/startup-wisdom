import { ImageResponse } from "next/og"

import { getResourceBySlug } from "@/lib/data"
import { formatPublishedDate, mediumLabel } from "@/lib/format"
import { loadOgFonts } from "@/lib/og-fonts"

export const alt = "archive — founder resource"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [{ fonts }, detail] = await Promise.all([
    loadOgFonts(),
    getResourceBySlug(slug),
  ])
  if (!detail) {
    return new ImageResponse(<div>not found</div>, { ...size, fonts })
  }
  const date = formatPublishedDate(detail.published_at)
  const key = detail.highlights.find((h) => h.is_key)

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
            archive
          </span>
          <span
            style={{
              fontSize: 18,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#888",
            }}
          >
            {mediumLabel(detail.medium)}
            {date ? ` · ${date}` : ""}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <h1
            style={{
              fontSize: 64,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              margin: 0,
              fontFamily: "Serif",
              maxWidth: 1000,
            }}
          >
            {detail.title}
          </h1>
          {key && (
            <p
              style={{
                fontSize: 26,
                lineHeight: 1.4,
                color: "#bbb",
                margin: 0,
                fontFamily: "Serif",
                fontStyle: "italic",
                maxWidth: 1000,
              }}
            >
              “{truncate(key.body, 180)}”
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 26, color: "#fafafa" }}>
            {detail.creator.name}
          </span>
          <span style={{ fontSize: 18, color: "#666" }}>
            archive · key highlight
          </span>
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

import { load } from "cheerio"

import { fetchHtml } from "./_shared/http"
import { slugify } from "./_shared/slug"
import type { FetchedResource } from "./_shared/types"

const DATE_PATTERNS = [
  /^([A-Za-z]+)\s+(\d{4})$/m, // "March 2023"
  /([A-Za-z]+)\s+(\d{4})/,
]

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
}

function extractDate(text: string): string | undefined {
  for (const re of DATE_PATTERNS) {
    const m = text.match(re)
    if (!m) continue
    const month = MONTHS[m[1].toLowerCase()]
    const year = parseInt(m[2], 10)
    if (month && year) {
      return `${year}-${String(month).padStart(2, "0")}-01`
    }
  }
  return undefined
}

export async function fetchPaulGraham(
  url: string,
  hintedTitle?: string
): Promise<FetchedResource> {
  const html = await fetchHtml(url)
  const $ = load(html)

  // PG essays are notoriously inconsistent. Title is in <title>, body is the
  // main <body> table. Strip nav, footnotes section, etc.
  const title = (hintedTitle || $("title").text() || "").trim()
  $("script, style, noscript").remove()
  // PG often uses <font>; let cheerio strip via .text()
  const bodyText = $("body").text().replace(/[ \t]+/g, " ").replace(/\s+\n/g, "\n").trim()
  const published = extractDate(bodyText.slice(0, 400)) // dates appear near the top
  const wordCount = bodyText.split(/\s+/).length

  return {
    source_slug: "paulgraham",
    creator_slug: "paul-graham",
    external_url: url,
    slug: slugify(title),
    title,
    description: bodyText.split(/\n\s*\n/)[1]?.slice(0, 280),
    medium: "essay",
    word_count: wordCount,
    published_at: published,
    raw_text: bodyText,
  }
}

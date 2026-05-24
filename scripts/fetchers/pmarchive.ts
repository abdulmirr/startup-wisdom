import { load } from "cheerio"

import { fetchHtml } from "./_shared/http"
import { slugify } from "./_shared/slug"
import type { FetchedResource } from "./_shared/types"

const DATE_RE = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+(\d{4})/i

function extractDate(text: string): string | undefined {
  const m = text.match(DATE_RE)
  if (!m) return undefined
  const date = new Date(m[0])
  if (isNaN(date.getTime())) return undefined
  return date.toISOString().slice(0, 10)
}

export async function fetchPmarchive(
  url: string,
  hintedTitle?: string
): Promise<FetchedResource> {
  const html = await fetchHtml(url)
  const $ = load(html)

  // pmarchive is largely plain HTML with the article body as the main <body>
  // content. Strip nav/header/footer markup heuristically.
  const title =
    hintedTitle ||
    $("h1").first().text().trim() ||
    $("title").text().trim()
  const bodyText = $("body").text().replace(/\s+\n/g, "\n").trim()
  const published = extractDate(bodyText)
  const wordCount = bodyText.split(/\s+/).length

  return {
    source_slug: "pmarchive",
    creator_slug: "marc-andreessen",
    external_url: url,
    slug: slugify(title),
    title,
    description: bodyText.split(/\n\s*\n/)[0]?.slice(0, 280),
    medium: "essay",
    word_count: wordCount,
    published_at: published,
    raw_text: bodyText,
  }
}

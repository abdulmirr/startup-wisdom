// Scrapes startupArchive.org blog posts (URL pattern: /p/<slug>).
// Each post is a curated writeup of a YouTube clip from the Startup Archive
// channel — direct founder quotes plus light editorial. We use the blog body
// as `raw_text` for AI highlight extraction, but the resource's canonical URL
// is the embedded YouTube video.

import { load } from "cheerio"

import { fetchHtml } from "./_shared/http"
import { slugify } from "./_shared/slug"
import type { FetchedResource } from "./_shared/types"

// Matches all the ways the Beehiiv-rendered posts reference a YouTube clip:
//   - https://www.youtube.com/watch?v=<id>
//   - https://youtu.be/<id>
//   - https://www.youtube.com/embed/<id>     (iframe src)
//   - https://www.youtube-nocookie.com/embed/<id>
const YT_URL_RE =
  /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/

function extractYouTubeId(html: string): string | undefined {
  const m = html.match(YT_URL_RE)
  return m?.[1]
}

function extractDatePublished(html: string): string | undefined {
  // JSON-LD: "datePublished":"2026-03-24T10:55:00.000Z"
  const m = html.match(/"datePublished"\s*:\s*"([^"]+)"/)
  if (m) return m[1].slice(0, 10)
  return undefined
}

// Map of speaker names (lowercase, no diacritics) that appear at the start of
// a startupArchive.org post title to their canonical creator slug. Anything
// not matched here falls back to "various-founders" — keep this in sync with
// the CREATORS list in src/lib/data/mock.ts.
const SPEAKER_TO_SLUG: Record<string, string> = {
  "jeff bezos": "jeff-bezos",
  "steve jobs": "steve-jobs",
  "marc andreessen": "marc-andreessen",
  "sam altman": "sam-altman",
  "paul graham": "paul-graham",
  "tobi lutke": "tobi-lutke",
  "tobi lütke": "tobi-lutke",
  "keith rabois": "keith-rabois",
  "mark zuckerberg": "mark-zuckerberg",
  "eric schmidt": "eric-schmidt",
  "jony ive": "jony-ive",
  "naval ravikant": "naval-ravikant",
  "patrick collison": "patrick-collison",
  "brian chesky": "brian-chesky",
  "ben horowitz": "ben-horowitz",
}

function creatorSlugFromTitle(title: string): string {
  const lower = title.toLowerCase()
  for (const [name, slug] of Object.entries(SPEAKER_TO_SLUG)) {
    if (lower.startsWith(name)) return slug
  }
  return "various-founders"
}

export async function fetchStartupArchive(
  url: string,
  hintedTitle?: string
): Promise<FetchedResource> {
  const html = await fetchHtml(url)
  const $ = load(html)

  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim()
  const ogDesc = $('meta[property="og:description"]').attr("content")?.trim()
  const title =
    hintedTitle || ogTitle || $("#web-header h1").first().text().trim()

  // Body lives in #content-blocks. Strip share widgets and styles first.
  const root = $("#content-blocks")
  root.find("style, script, noscript, svg, .bh__byline_social_wrapper").remove()
  const bodyText = root
    .text()
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  if (!bodyText) {
    throw new Error(`startup-archive: empty body for ${url}`)
  }

  const ytId = extractYouTubeId(html)
  const publishedAt = extractDatePublished(html)
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length

  // Prefer YouTube as the canonical URL — that's the original. Fall back to
  // the blog URL if the post somehow doesn't embed a video.
  const externalUrl = ytId
    ? `https://www.youtube.com/watch?v=${ytId}`
    : url
  const thumbnail = ytId
    ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
    : $('meta[property="og:image"]').attr("content") || undefined

  return {
    source_slug: "startup-archive-yt",
    creator_slug: creatorSlugFromTitle(title),
    external_url: externalUrl,
    external_id: ytId,
    slug: slugify(title),
    title,
    description: ogDesc,
    medium: "video",
    word_count: wordCount,
    published_at: publishedAt,
    thumbnail_url: thumbnail,
    raw_text: bodyText,
  }
}

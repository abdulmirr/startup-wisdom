// Enrichment: for each painting in data/paintings.ts, hit the Wikipedia
// REST API to get the canonical lead image URL. Writes the result to
// data/paintings.enriched.json (consumed by the matcher and by the data
// layer).
//
// Incremental: entries already present in enriched.json with any imageUrl
// (remote or local /paintings/...) are preserved as-is. Only new ids in
// paintings.ts get fetched.
//
// Run with:  npx tsx scripts/fetch-painting-urls.ts

import { readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { paintings, type PaintingEntry } from "../data/paintings"

const UA = "archive-builder/0.1 (+local)"

async function viaRestSummary(page: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${page}`
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } })
    if (!res.ok) return null
    const json = (await res.json()) as {
      originalimage?: { source: string }
      thumbnail?: { source: string }
    }
    return json.originalimage?.source ?? json.thumbnail?.source ?? null
  } catch {
    return null
  }
}

async function viaActionQuery(page: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=original&format=json&titles=${page}`
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } })
    if (!res.ok) return null
    const json = (await res.json()) as {
      query?: { pages?: Record<string, { original?: { source: string } }> }
    }
    const pages = json.query?.pages
    if (!pages) return null
    const first = Object.values(pages)[0]
    return first?.original?.source ?? null
  } catch {
    return null
  }
}

async function getImageUrl(page: string): Promise<string | null> {
  return (await viaRestSummary(page)) ?? (await viaActionQuery(page))
}

async function main() {
  const outPath = join(process.cwd(), "data/paintings.enriched.json")
  let existing: PaintingEntry[] = []
  try {
    existing = JSON.parse(await readFile(outPath, "utf8")) as PaintingEntry[]
  } catch {
    // first run — no existing file
  }
  const existingById = new Map(existing.map((p) => [p.id, p]))

  const enriched: PaintingEntry[] = []
  let ok = 0
  let preserved = 0
  let missing = 0
  for (const p of paintings) {
    const prior = existingById.get(p.id)
    if (prior?.imageUrl) {
      // Re-use existing URL (preserves local /paintings/ paths from download step)
      enriched.push({ ...p, imageUrl: prior.imageUrl })
      preserved++
      continue
    }
    const imageUrl = await getImageUrl(p.wikipediaPage)
    if (imageUrl) {
      enriched.push({ ...p, imageUrl })
      ok++
      console.log(`  + ${p.title}`)
    } else {
      console.log(`  ✗ ${p.title}  (no image)`)
      missing++
    }
    await new Promise((r) => setTimeout(r, 1200)) // be polite
  }

  await writeFile(outPath, JSON.stringify(enriched, null, 2))
  console.log(
    `\nDone. preserved=${preserved} fetched=${ok} missing=${missing} → ${outPath}`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

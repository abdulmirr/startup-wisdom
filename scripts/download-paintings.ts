// Downloads each painting from upload.wikimedia.org, resizes to 1600px
// wide WebP, and writes it to public/paintings/<id>.webp. Then updates
// data/paintings.enriched.json and any resources.thumbnail_url that
// pointed at the original Wikimedia URL.
//
// Wikipedia rate-limits anon bulk fetches aggressively, especially on
// /thumb/<huge-size>/ URLs. We:
//  • prefer a smaller (≤1600px) thumb than the Wikipedia-default 3840px
//  • throttle to one request every 2.5s
//  • retry once after a 30s cooldown on 429
//  • skip entries already pointing at a local path (idempotent re-runs)
//
// Run with: npx tsx --env-file=.env.local scripts/download-paintings.ts

import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

import sharp from "sharp"

import { createSupabaseAdminClient } from "../src/lib/supabase/admin"
import type { PaintingEntry } from "../data/paintings"

const PUBLIC_DIR = join(process.cwd(), "public/paintings")
const ENRICHED_PATH = join(process.cwd(), "data/paintings.enriched.json")
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 archive-builder/0.1"
const REQUEST_DELAY_MS = 800
const RETRY_COOLDOWN_MS = 30_000
const TARGET_WIDTH = 1280

function thumbUrl(url: string, width = TARGET_WIDTH): string {
  // Convert any commons URL (thumb or original) to a pre-rendered thumb at
  // the desired width. The thumb endpoint is heavily cached and returns
  // much faster than downloading multi-MB originals (which get rate-limited
  // aggressively).
  //
  // Forms we handle:
  //   /wikipedia/commons/X/XX/file.jpg                    (original)
  //   /wikipedia/commons/thumb/X/XX/file.jpg/2000px-...   (existing thumb)
  //   /wikipedia/en/X/XX/file.jpg                         (en, non-commons)
  const thumbMatch = url.match(
    /^(https?:\/\/upload\.wikimedia\.org\/wikipedia\/(?:commons|en))\/thumb\/([a-f0-9]\/[a-f0-9]{2}\/([^/]+))\/\d+px-[^/]+$/i
  )
  if (thumbMatch) {
    const [, prefix, dirPath, filename] = thumbMatch
    return `${prefix}/thumb/${dirPath}/${width}px-${filename}`
  }
  const originalMatch = url.match(
    /^(https?:\/\/upload\.wikimedia\.org\/wikipedia\/(?:commons|en))\/([a-f0-9]\/[a-f0-9]{2}\/([^/]+))$/i
  )
  if (originalMatch) {
    const [, prefix, dirPath, filename] = originalMatch
    return `${prefix}/thumb/${dirPath}/${width}px-${filename}`
  }
  return url
}

async function fetchOnce(url: string): Promise<Response> {
  return fetch(url, { headers: { "User-Agent": UA } })
}

async function downloadAndResize(url: string, destPath: string): Promise<void> {
  const target = thumbUrl(url)
  let res = await fetchOnce(target)
  let retries = 2
  while (res.status === 429 && retries > 0) {
    await new Promise((r) => setTimeout(r, RETRY_COOLDOWN_MS))
    res = await fetchOnce(target)
    retries--
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${target}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await sharp(buf)
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(destPath)
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true })
  const raw = await readFile(ENRICHED_PATH, "utf8")
  const library = JSON.parse(raw) as PaintingEntry[]

  const urlMap = new Map<string, string>() // wikimediaUrl → /paintings/<id>.webp
  let ok = 0
  let failed = 0
  let skipped = 0

  for (const p of library) {
    if (!p.imageUrl) continue
    const localPath = `/paintings/${p.id}.webp`
    if (p.imageUrl.startsWith("/")) {
      skipped++
      continue
    }
    const filePath = join(PUBLIC_DIR, `${p.id}.webp`)
    try {
      await downloadAndResize(p.imageUrl, filePath)
      urlMap.set(p.imageUrl, localPath)
      console.log(`  ✓ ${p.title}`)
      ok++
      await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS))
    } catch (err) {
      console.error(
        `  ✗ ${p.title}: ${err instanceof Error ? err.message : err}`
      )
      failed++
    }
  }

  console.log(`\nDownloaded ${ok}, skipped ${skipped} (already local), failed ${failed}.`)

  // Update enriched JSON with new local paths
  const updatedLibrary = library.map((p) => {
    if (p.imageUrl && urlMap.has(p.imageUrl)) {
      return { ...p, imageUrl: urlMap.get(p.imageUrl)! }
    }
    return p
  })
  await writeFile(ENRICHED_PATH, JSON.stringify(updatedLibrary, null, 2))
  console.log(`Updated ${ENRICHED_PATH}`)

  // Update any resources whose thumbnail_url pointed at the old URL
  const supa = createSupabaseAdminClient()
  const { data: resources, error } = await supa
    .from("resources")
    .select("id, thumbnail_url")
    .not("thumbnail_url", "is", null)
  if (error) throw error

  let updated = 0
  for (const r of resources ?? []) {
    if (!r.thumbnail_url) continue
    const newUrl = urlMap.get(r.thumbnail_url)
    if (newUrl) {
      const { error: uErr } = await supa
        .from("resources")
        .update({ thumbnail_url: newUrl })
        .eq("id", r.id)
      if (!uErr) updated++
    }
  }
  console.log(`Updated ${updated} resource thumbnails to local paths.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

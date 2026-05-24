// Downloads each creator portrait from Wikipedia and writes it to
// public/portraits/<slug>.webp, then updates creators.avatar_url to the
// local path. Same rationale as download-paintings.ts: avoid Wikipedia
// rate-limits during Next/Image hot-fetch.
//
// Run with: npx tsx --env-file=.env.local scripts/download-portraits.ts

import { mkdir } from "node:fs/promises"
import { join } from "node:path"

import sharp from "sharp"

import { createSupabaseAdminClient } from "../src/lib/supabase/admin"

const PUBLIC_DIR = join(process.cwd(), "public/portraits")
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 archive-builder/0.1"

async function fetchOnce(url: string): Promise<Response> {
  return fetch(url, { headers: { "User-Agent": UA } })
}

async function downloadAndResize(url: string, dest: string): Promise<void> {
  let res = await fetchOnce(url)
  let retries = 3
  while (res.status === 429 && retries > 0) {
    await new Promise((r) => setTimeout(r, 60_000))
    res = await fetchOnce(url)
    retries--
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await sharp(buf)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(dest)
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true })
  const supa = createSupabaseAdminClient()
  const { data: creators } = await supa
    .from("creators")
    .select("id, slug, avatar_url")
  if (!creators) return

  let ok = 0
  let skipped = 0
  for (const c of creators) {
    if (!c.avatar_url) {
      skipped++
      continue
    }
    if (c.avatar_url.startsWith("/")) {
      console.log(`  · ${c.slug} already local`)
      skipped++
      continue
    }
    const file = join(PUBLIC_DIR, `${c.slug}.webp`)
    try {
      await downloadAndResize(c.avatar_url, file)
      await supa
        .from("creators")
        .update({ avatar_url: `/portraits/${c.slug}.webp` })
        .eq("id", c.id)
      console.log(`  ✓ ${c.slug}`)
      ok++
      await new Promise((r) => setTimeout(r, 5000))
    } catch (err) {
      console.error(`  ✗ ${c.slug}: ${err instanceof Error ? err.message : err}`)
    }
  }
  console.log(`\nDownloaded ${ok}, skipped ${skipped}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

// For each published resource, ask Claude to pick the painting from
// data/paintings.enriched.json that best fits the resource thematically.
// Updates thumbnail_url to the chosen painting's image URL.
//
// Run with:  npx tsx --env-file=.env.local scripts/match-paintings.ts
//            [--limit N] [--resource <slug>] [--all]
//
// By default skips resources that already have a thumbnail_url pointing
// at upload.wikimedia.org (i.e. already matched). --all forces re-match.

import { readFile } from "node:fs/promises"
import { join } from "node:path"

import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"

import { EXTRACTION_MODEL } from "../src/lib/anthropic"
import { createSupabaseAdminClient } from "../src/lib/supabase/admin"
import type { PaintingEntry } from "../data/paintings"

interface Args {
  limit?: number
  resourceSlug?: string
  all?: boolean
}

function parseArgs(): Args {
  const out: Args = {}
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--limit") out.limit = parseInt(argv[++i], 10)
    else if (argv[i] === "--resource") out.resourceSlug = argv[++i]
    else if (argv[i] === "--all") out.all = true
  }
  return out
}

const MatchOutputSchema = z.object({
  painting_id: z.string().min(1),
  reasoning: z.string().min(0).max(400).optional(),
})

const SYSTEM_PROMPT = `You curate visual pairings between founder essays/talks and famous paintings.

Given a resource (title + key insight + topic tags) and a library of paintings, pick the SINGLE painting that best fits — thematically or symbolically, not literally. The pairing should feel intentional, like a magazine editor chose it. Surprising and resonant beats safe and on-the-nose.

Rules:
- Return only the painting id from the provided library.
- Aim for variety across the dataset. If you're tempted to reuse the same painting many times, look for second-best fits that still resonate.
- One painting per resource. No commentary in the choice.`

interface LibraryEntry {
  id: string
  title: string
  artist: string
  summary: string
}

interface ResourceForMatching {
  id: string
  slug: string
  title: string
  medium: string
  description: string | null
  topics: string[]
  key_highlight: string | null
}

function buildLibraryBlock(library: LibraryEntry[]): string {
  return library
    .map((p) => `- ${p.id}: "${p.title}" — ${p.artist}. ${p.summary}`)
    .join("\n")
}

async function pickPainting(
  client: Anthropic,
  resource: ResourceForMatching,
  library: LibraryEntry[],
  alreadyUsed: Set<string>
): Promise<{ id: string; reasoning?: string }> {
  // Hard-enforce uniqueness: remove already-used paintings from both the
  // enum the model can pick from and the library block it sees.
  const available = library.filter((p) => !alreadyUsed.has(p.id))
  if (available.length === 0) {
    throw new Error("painting library exhausted — no unique pick possible")
  }

  const tool = {
    name: "choose_painting",
    description: "Select the painting id that best fits this resource.",
    input_schema: {
      type: "object",
      required: ["painting_id"],
      properties: {
        painting_id: {
          type: "string",
          enum: available.map((p) => p.id),
        },
        reasoning: {
          type: "string",
          description: "One sentence on why this painting fits.",
        },
      },
    },
  }

  const userContent = `Resource:
Title: ${resource.title}
Medium: ${resource.medium}
Topics: ${resource.topics.join(", ") || "(none)"}
${resource.key_highlight ? `\nKey insight: "${resource.key_highlight}"` : ""}
${resource.description ? `\nSummary: ${resource.description}` : ""}

Painting library (every painting listed is still available — pick the one that fits best):
${buildLibraryBlock(available)}

Call the choose_painting tool with the best fit.`

  const response = await client.messages.create({
    model: EXTRACTION_MODEL,
    max_tokens: 600,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT + "\n\n[library cached]",
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [{ ...tool, cache_control: { type: "ephemeral" } } as never],
    tool_choice: { type: "tool", name: "choose_painting" } as never,
    messages: [{ role: "user", content: userContent }],
  })

  const toolUse = response.content.find(
    (c): c is Extract<typeof c, { type: "tool_use" }> => c.type === "tool_use"
  )
  if (!toolUse) throw new Error("model did not call the tool")
  const parsed = MatchOutputSchema.parse(toolUse.input)
  return { id: parsed.painting_id, reasoning: parsed.reasoning }
}

async function main() {
  const args = parseArgs()
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not set")
  }

  // Load library
  const raw = await readFile(join(process.cwd(), "data/paintings.enriched.json"), "utf8")
  const fullLibrary = JSON.parse(raw) as PaintingEntry[]
  const library = fullLibrary
    .filter((p): p is PaintingEntry & { imageUrl: string } => Boolean(p.imageUrl))
    .map((p) => ({
      id: p.id,
      title: p.title,
      artist: p.artist,
      summary: p.summary,
      imageUrl: p.imageUrl,
    }))
  console.log(`Library: ${library.length} paintings.`)

  // Load resources to match
  const supa = createSupabaseAdminClient()
  let q = supa
    .from("resources")
    .select(
      "id, slug, title, medium, description, thumbnail_url, resource_topics(topic:topics(slug)), highlights(body, is_key)"
    )
    .eq("status", "published")
  if (args.resourceSlug) q = q.eq("slug", args.resourceSlug)

  const { data: resources, error } = await q
  if (error) throw error
  if (!resources || resources.length === 0) {
    console.log("Nothing to match.")
    return
  }

  // Normalize + filter
  type Row = (typeof resources)[number]
  const candidates: Array<ResourceForMatching & { thumbnail_url: string | null }> = resources.map(
    (r: Row) => {
      const topics =
        (r.resource_topics as Array<{ topic: { slug: string } | { slug: string }[] | null }>)
          .map((rt) => {
            const t = Array.isArray(rt.topic) ? rt.topic[0] : rt.topic
            return t?.slug
          })
          .filter((x): x is string => Boolean(x)) ?? []
      const highlights = (r.highlights as Array<{ body: string; is_key: boolean }>) ?? []
      const key = highlights.find((h) => h.is_key)?.body ?? null
      return {
        id: r.id as string,
        slug: r.slug as string,
        title: r.title as string,
        medium: r.medium as string,
        description: r.description as string | null,
        topics,
        key_highlight: key,
        thumbnail_url: r.thumbnail_url as string | null,
      }
    }
  )

  // Skip already-matched (thumbnail already points at a local painting)
  // unless --all is passed.
  const toMatch = args.all
    ? candidates
    : candidates.filter(
        (r) => !r.thumbnail_url || !r.thumbnail_url.startsWith("/paintings/")
      )
  const sliced = args.limit ? toMatch.slice(0, args.limit) : toMatch
  console.log(`Matching ${sliced.length} resources…`)

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Seed the used-set with any paintings already assigned to OTHER resources
  // we're not re-matching this run, so we still enforce uniqueness across the
  // full dataset (not just the slice). When --all is passed every resource is
  // in the slice, so the set starts empty.
  const used = new Set<string>()
  const sliceIds = new Set(sliced.map((r) => r.id))
  if (!args.all) {
    const localPathToId = new Map(library.map((p) => [p.imageUrl, p.id]))
    for (const r of candidates) {
      if (sliceIds.has(r.id)) continue
      if (!r.thumbnail_url) continue
      const pid = localPathToId.get(r.thumbnail_url)
      if (pid) used.add(pid)
    }
    if (used.size) console.log(`Reserving ${used.size} paintings already in use.`)
  }

  let ok = 0
  let failed = 0

  for (const resource of sliced) {
    try {
      const { id, reasoning } = await pickPainting(client, resource, library, used)
      const painting = library.find((p) => p.id === id)
      if (!painting) throw new Error(`unknown painting id ${id}`)

      const { error: uErr } = await supa
        .from("resources")
        .update({ thumbnail_url: painting.imageUrl })
        .eq("id", resource.id)
      if (uErr) throw uErr

      used.add(id)
      ok++
      console.log(`  ✓ ${resource.title} → ${painting.title} (${painting.artist})`)
      if (reasoning) console.log(`      ${reasoning}`)
    } catch (err) {
      failed++
      console.error(
        `  ✗ ${resource.title}: ${err instanceof Error ? err.message : err}`
      )
    }
  }

  console.log(`\nDone. ok=${ok} failed=${failed}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

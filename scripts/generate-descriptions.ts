// Generate one-sentence descriptions of resources for the card UI.
//
// These are descriptions *about* the piece (what the reader will learn),
// not verbatim quotes from it — distinct from the highlight extraction that
// scripts/extract.ts handles.
//
// By default, picks up rows where the description is null OR longer than the
// AI-target length (i.e. raw scraped paragraphs that need replacing). Pass
// --overwrite to regenerate everything.
//
// Run with:  npx tsx scripts/generate-descriptions.ts [--limit 20] [--resource <slug>] [--overwrite]

import { config as dotenv } from "dotenv"
dotenv({ path: ".env.local" })
dotenv()

import { EXTRACTION_MODEL, getAnthropic } from "../src/lib/anthropic"
import { createSupabaseAdminClient } from "../src/lib/supabase/admin"

interface Args {
  limit?: number
  resourceSlug?: string
  overwrite?: boolean
}

function parseArgs(): Args {
  const out: Args = {}
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--limit") out.limit = parseInt(argv[++i], 10)
    else if (a === "--resource") out.resourceSlug = argv[++i]
    else if (a === "--overwrite") out.overwrite = true
  }
  return out
}

const TOOL_NAME = "save_description"

const MAX_DESCRIPTION_CHARS = 140

const toolSchema = {
  name: TOOL_NAME,
  description:
    "Save a one-sentence description of what this resource is about.",
  input_schema: {
    type: "object",
    required: ["description"],
    properties: {
      description: {
        type: "string",
        description: `One sentence describing WHAT the resource is about — not a verbatim quote, not a teaser. Plain, declarative voice. Hard limit: ${MAX_DESCRIPTION_CHARS} characters total. Must end with a period.`,
        maxLength: MAX_DESCRIPTION_CHARS,
      },
    },
  },
} as const

const SYSTEM_PROMPT = `You write one-sentence descriptions for cards on a founder-wisdom archive.

Each description sits below the title on a card. The reader is deciding in a glance whether to open the piece.

Rules:
- ONE sentence only. Hard limit: ${MAX_DESCRIPTION_CHARS} characters total. If you can't fit it in one sentence under ${MAX_DESCRIPTION_CHARS} characters, cut harder.
- Describe what the piece is *about*. Not a quote. Not a teaser ("find out why..."). Not a recap of the first paragraph.
- Plain, declarative voice. No marketing fluff ("must-read", "essential"). No "in this essay, the author argues...".
- Start with a concrete noun phrase or "How / Why / What" question, not the author's name.
- If the piece has a strong central argument, lead with it.
- Faithful to the source. Don't invent claims that aren't there.
- End with a period.

Examples (each under ${MAX_DESCRIPTION_CHARS} characters):
- "Why the most successful early-stage startups do things that don't scale."
- "Look for problems you have yourself — the best startup ideas come from genuine need, not brainstorming."
- "Two incompatible ways to use time: the maker's schedule and the manager's schedule."

Call the ${TOOL_NAME} tool with your output. Do not respond in plain text.`

interface ResourceRow {
  id: string
  slug: string
  title: string
  medium: string
  description: string | null
  raw_text: string | null
  creator: { name: string } | null
}

async function generateOne(r: ResourceRow): Promise<string> {
  const client = getAnthropic()
  const creatorName = r.creator?.name ?? "Unknown"

  // Truncate raw_text to ~25k chars to keep token cost down — the first ~10k
  // chars are usually enough for a description, but we include more for very
  // long pieces where the thesis comes later.
  const source = r.raw_text ? r.raw_text.slice(0, 25_000) : ""
  const userContent = source
    ? `Resource: "${r.title}" by ${creatorName} (${r.medium}).\n\nContent (may be truncated):\n\n${source}`
    : `Resource: "${r.title}" by ${creatorName} (${r.medium}).\n\nNo full text available — write a description based on the title and what you can infer about a piece with this title by this author.`

  const response = await client.messages.create({
    model: EXTRACTION_MODEL,
    max_tokens: 400,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [
      {
        ...toolSchema,
        cache_control: { type: "ephemeral" },
      } as never,
    ],
    tool_choice: { type: "tool", name: TOOL_NAME } as never,
    messages: [{ role: "user", content: userContent }],
  })

  const toolUse = response.content.find(
    (c): c is Extract<typeof c, { type: "tool_use" }> => c.type === "tool_use"
  )
  if (!toolUse) throw new Error("Model did not call the tool")
  const input = toolUse.input as { description?: unknown }
  if (typeof input.description !== "string" || !input.description.trim()) {
    throw new Error("Tool returned no description")
  }
  const description = input.description.trim()
  if (description.length > MAX_DESCRIPTION_CHARS) {
    throw new Error(
      `Description too long (${description.length} > ${MAX_DESCRIPTION_CHARS}): ${description}`
    )
  }
  return description
}

async function main() {
  const args = parseArgs()
  const supabase = createSupabaseAdminClient()

  let query = supabase
    .from("resources")
    .select("id, slug, title, medium, description, raw_text, creator:creators(name)")
    .eq("status", "published")
    .order("added_at", { ascending: false })

  if (args.resourceSlug) query = query.eq("slug", args.resourceSlug)

  const { data: allRows, error } = await query
  if (error) throw error

  // Backfill mode (default): pick rows where description is null OR longer
  // than the AI target (i.e. raw scraped paragraphs that need replacing).
  // PostgREST has no clean length-based filter, so do it in JS.
  const filtered = (allRows ?? []).filter((r) => {
    if (args.resourceSlug) return true
    if (args.overwrite) return true
    if (!r.description) return true
    return r.description.length > MAX_DESCRIPTION_CHARS
  })

  const resources = args.limit ? filtered.slice(0, args.limit) : filtered

  if (resources.length === 0) {
    console.log("Nothing to do.")
    return
  }

  console.log(`Generating descriptions for ${resources.length} resources…`)
  let ok = 0
  let failed = 0

  for (const row of resources) {
    const creator = Array.isArray(row.creator) ? row.creator[0] : row.creator
    const r: ResourceRow = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      medium: row.medium,
      description: row.description,
      raw_text: row.raw_text,
      creator: creator ? { name: creator.name } : null,
    }
    try {
      const description = await generateOne(r)
      const { error: updErr } = await supabase
        .from("resources")
        .update({ description })
        .eq("id", r.id)
      if (updErr) throw updErr
      console.log(`  ✓ ${r.title}\n    ${description}`)
      ok++
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`  ✗ ${r.title}: ${message}`)
      failed++
    }
  }

  console.log(`\nDone. ok=${ok} failed=${failed}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import { z } from "zod"

import { TOPIC_SLUGS, type TopicSlug } from "../../data/topics"

export const ExtractedHighlightSchema = z.object({
  body: z.string().min(20).max(1000),
  context: z.string().min(0).max(400).nullable().optional(),
  timestamp_seconds: z.number().int().nonnegative().nullable().optional(),
})

export const ExtractedKeyHighlightSchema = ExtractedHighlightSchema.extend({
  // Same as supporting but body is required to be substantive
  body: z.string().min(40).max(800),
})

export const ExtractionOutputSchema = z.object({
  key_highlight: ExtractedKeyHighlightSchema,
  highlights: z.array(ExtractedHighlightSchema).min(4).max(8),
  topics: z
    .array(z.enum(TOPIC_SLUGS as [TopicSlug, ...TopicSlug[]]))
    .min(3)
    .max(6),
})

export type ExtractionOutput = z.infer<typeof ExtractionOutputSchema>

/**
 * Claude tool_use schema for the extraction call. Mirrors the Zod schema.
 * Returned in the tool definition; Claude calls it once per resource.
 */
export const EXTRACTION_TOOL_NAME = "save_highlights"

export const extractionToolSchema = {
  name: EXTRACTION_TOOL_NAME,
  description:
    "Save the extracted highlights and topic tags for this resource. Call exactly once.",
  input_schema: {
    type: "object",
    required: ["key_highlight", "highlights", "topics"],
    properties: {
      key_highlight: {
        type: "object",
        required: ["body"],
        properties: {
          body: {
            type: "string",
            description:
              "The single most distinctive, quotable insight in the piece. 1–3 sentences. Verbatim quote when possible.",
          },
          context: {
            type: ["string", "null"],
            description: "Optional surrounding context. 1–2 sentences.",
          },
          timestamp_seconds: {
            type: ["integer", "null"],
            description:
              "Only for video/podcast/lecture: seconds into the recording where this is said.",
          },
        },
      },
      highlights: {
        type: "array",
        minItems: 4,
        maxItems: 8,
        items: {
          type: "object",
          required: ["body"],
          properties: {
            body: {
              type: "string",
              description:
                "A supporting highlight: insight, framework, anecdote, or memorable line. 1–4 sentences. Stand-alone.",
            },
            context: { type: ["string", "null"] },
            timestamp_seconds: { type: ["integer", "null"] },
          },
        },
      },
      topics: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: {
          type: "string",
          enum: TOPIC_SLUGS,
          description: "Topic slug from the controlled vocabulary.",
        },
      },
    },
  },
} as const

export const EXTRACTION_SYSTEM_PROMPT = `You extract founder wisdom from long-form content (essays, video transcripts, podcasts, letters).

Your reader is a founder skimming for signal. They have 90 seconds.

For each resource, produce:
1. ONE "key highlight" — the single most distinctive, quotable, non-obvious insight in the piece. If you removed everything else and showed only this, the reader should think "I need to read this." Avoid generic startup truisms ("focus on the customer", "hire slow fire fast"). Prefer the specific, the counterintuitive, the founder's own framing.
2. 4–8 supporting highlights — additional insights, frameworks, anecdotes, or memorable lines. Aim for 5–6. Quality over quantity: only include something if it's genuinely worth remembering on its own. If the piece only has three more highlights worth keeping after the key one, return four total. Don't pad. Each must stand alone (no "as he said earlier"). Ordered by importance, not chronology.
3. 3–6 topic tags from the provided controlled vocabulary. Pick the most central themes, not every theme that appears.

Rules:
- Prefer verbatim quotes. If paraphrasing, keep it tight and faithful to the voice.
- No filler ("In this essay, the author argues that..."). Just the insight.
- No duplicates and no near-duplicates. If two highlights make the same point, keep the better one.
- Length: key highlight 1–3 sentences. Supporting highlights 1–4 sentences each.
- If the content is a video/podcast and you have timestamps in the transcript, include them in seconds.

Available topic slugs (use these exact strings):
${TOPIC_SLUGS.join(", ")}

Call the ${EXTRACTION_TOOL_NAME} tool with your output. Do not respond in plain text.`

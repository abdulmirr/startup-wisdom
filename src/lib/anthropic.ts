import Anthropic from "@anthropic-ai/sdk"

import { env } from "./env"

let _client: Anthropic | null = null

export function getAnthropic(): Anthropic {
  if (!_client) {
    const key = env.ANTHROPIC_API_KEY
    if (!key) throw new Error("ANTHROPIC_API_KEY not set")
    _client = new Anthropic({ apiKey: key })
  }
  return _client
}

export const EXTRACTION_MODEL = "claude-opus-4-7"

import { NextResponse } from "next/server"
import { z } from "zod"

import { env } from "@/lib/env"

export const dynamic = "force-dynamic"

const BodySchema = z.object({
  email: z.string().email(),
  // Surface identifier used as utm_medium so attribution in beehiiv
  // distinguishes hero / resource callout / exit intent.
  medium: z.enum(["hero", "callout", "exit_intent", "landing"]),
})

const UTM_SOURCE = "startupwisdomhome"

export async function POST(req: Request) {
  if (!env.BEEHIIV_API_KEY || !env.BEEHIIV_PUBLICATION_ID) {
    return NextResponse.json(
      { error: "Newsletter is not configured." },
      { status: 500 }
    )
  }

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json(
      { error: "Please enter a valid email." },
      { status: 400 }
    )
  }

  const referer = req.headers.get("referer") ?? undefined

  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.BEEHIIV_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: UTM_SOURCE,
        utm_medium: body.medium,
        referring_site: referer,
        double_opt_override: "off",
      }),
    }
  )

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    console.error("[subscribe] beehiiv error", res.status, detail)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}

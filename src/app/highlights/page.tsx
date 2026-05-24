import { Suspense } from "react"

import { HighlightViewer } from "./HighlightViewer"
import { getDailyHighlight, listHighlights } from "@/lib/data"

export const metadata = {
  title: "Highlights",
  description: "The internet's greatest founder insights, one at a time.",
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default async function HighlightsPage() {
  const [highlights, daily] = await Promise.all([
    listHighlights({ limit: 200 }),
    getDailyHighlight(todayIso()),
  ])

  return (
    <div className="pt-10 pb-12 sm:pt-14">
      <header className="mx-auto mb-8 max-w-4xl px-5 text-center sm:mb-10 sm:px-8">
        <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
          The internet&rsquo;s greatest highlights
        </h1>
      </header>

      <Suspense
        fallback={
          <p className="text-center text-sm text-ink-muted">Loading…</p>
        }
      >
        <HighlightViewer
          highlights={highlights}
          initialId={daily?.highlight.id}
        />
      </Suspense>
    </div>
  )
}

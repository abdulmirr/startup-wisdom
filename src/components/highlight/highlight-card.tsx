import { cn } from "@/lib/utils"
import { formatTimestamp } from "@/lib/format"
import type { Highlight } from "@/lib/types"

interface HighlightCardProps {
  highlight: Highlight
  className?: string
}

export function HighlightCard({ highlight, className }: HighlightCardProps) {
  const ts = formatTimestamp(highlight.timestamp_seconds)
  return (
    <article
      className={cn(
        "relative border-l-2 border-brand/40 bg-surface-2 px-5 py-4 text-[0.8125rem] leading-relaxed text-ink transition-colors hover:border-brand hover:bg-surface-3",
        className
      )}
    >
      {ts && (
        <p className="mb-2 font-mono text-[0.625rem] font-medium uppercase tracking-wide text-brand">
          {ts}
        </p>
      )}
      <p>{highlight.body}</p>
      {highlight.context && (
        <p className="mt-3 text-xs text-ink-soft">{highlight.context}</p>
      )}
    </article>
  )
}

import type { Highlight } from "@/lib/types"
import { formatTimestamp } from "@/lib/format"
import { cn } from "@/lib/utils"

interface KeyHighlightProps {
  highlight: Highlight
  className?: string
}

export function KeyHighlight({ highlight, className }: KeyHighlightProps) {
  const ts = formatTimestamp(highlight.timestamp_seconds)
  return (
    <figure
      className={cn(
        "relative isolate overflow-hidden rounded-lg border border-brand/15 bg-surface-2 px-7 py-10 sm:px-12 sm:py-14",
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-4 left-4 select-none font-serif text-[12rem] font-bold leading-none text-brand/8 sm:left-8 sm:-top-6 sm:text-[16rem]"
      >
        &ldquo;
      </span>

      <div className="relative">
        <p className="mb-5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-brand">
          Key highlight
        </p>
        <blockquote className="font-serif text-2xl font-semibold leading-[1.2] tracking-tight text-ink sm:text-3xl">
          {highlight.body}
        </blockquote>
        {(ts || highlight.context) && (
          <figcaption className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
            {ts && (
              <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                {ts}
              </span>
            )}
            {highlight.context && <span>{highlight.context}</span>}
          </figcaption>
        )}
      </div>
    </figure>
  )
}

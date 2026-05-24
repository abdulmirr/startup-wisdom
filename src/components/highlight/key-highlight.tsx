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
        "relative isolate overflow-hidden rounded-lg border border-brand/15 bg-surface-2 px-6 py-8 sm:px-9 sm:py-10",
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-3 left-3 select-none font-serif text-[9rem] font-bold leading-none text-brand/8 sm:left-6 sm:-top-5 sm:text-[12rem]"
      >
        &ldquo;
      </span>

      <div className="relative">
        <p className="mb-4 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-brand">
          Key highlight
        </p>
        <blockquote className="font-serif text-base font-semibold leading-[1.3] tracking-tight text-ink sm:text-xl">
          {highlight.body}
        </blockquote>
        {ts && (
          <figcaption className="mt-5 font-mono text-xs uppercase tracking-wide text-ink-soft">
            {ts}
          </figcaption>
        )}
      </div>
    </figure>
  )
}

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import {
  formatPublishedDate,
  formatTimestamp,
} from "@/lib/format"
import { cn } from "@/lib/utils"
import type { HighlightWithResource } from "@/lib/types"

interface HighlightSpotlightProps {
  data: HighlightWithResource
  variant?: "default" | "large"
  /** Visual treatment. `feature` = navy bg + cream type (signature). `subtle` = cream bg + ink type. */
  surface?: "feature" | "subtle"
  className?: string
  eyebrow?: string
}

export function HighlightSpotlight({
  data,
  variant = "default",
  surface = "feature",
  className,
  eyebrow,
}: HighlightSpotlightProps) {
  const { highlight, resource } = data
  const ts = formatTimestamp(highlight.timestamp_seconds)
  const date = formatPublishedDate(resource.published_at)

  const isFeature = surface === "feature"

  return (
    <article
      className={cn(
        "relative isolate overflow-hidden rounded-lg shadow-md",
        isFeature
          ? "bg-brand text-brand-ink"
          : "border border-line bg-surface-2 text-ink",
        variant === "large"
          ? "px-7 py-12 sm:px-14 sm:py-20"
          : "px-7 py-10 sm:px-12 sm:py-14",
        className
      )}
    >
      {/* Oversized decorative quote mark */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-4 left-4 select-none font-serif font-bold leading-none sm:left-8 sm:-top-6",
          isFeature ? "text-brand-ink/10" : "text-brand/10",
          variant === "large" ? "text-[14rem] sm:text-[20rem]" : "text-[12rem] sm:text-[16rem]"
        )}
      >
        &ldquo;
      </span>

      <div className="relative">
        {(eyebrow || ts) && (
          <p
            className={cn(
              "mb-6 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em]",
              isFeature ? "text-brand-ink/70" : "text-brand"
            )}
          >
            {eyebrow ?? ts}
            {eyebrow && ts ? ` · ${ts}` : ""}
          </p>
        )}
        <blockquote
          className={cn(
            "font-serif font-semibold leading-[1.15] tracking-tight",
            variant === "large"
              ? "text-3xl sm:text-4xl md:text-[2.75rem]"
              : "text-2xl sm:text-3xl"
          )}
        >
          {highlight.body}
        </blockquote>

        <div
          className={cn(
            "mt-10 flex flex-wrap items-baseline justify-between gap-4 border-t pt-6",
            isFeature ? "border-brand-ink/20" : "border-line"
          )}
        >
          <div>
            <Link
              href={`/resource/${resource.slug}`}
              className={cn(
                "font-serif text-base font-semibold underline-offset-4 hover:underline",
                isFeature ? "text-brand-ink" : "text-ink"
              )}
            >
              {resource.title}
            </Link>
            <p
              className={cn(
                "mt-1 text-sm",
                isFeature ? "text-brand-ink/70" : "text-ink-muted"
              )}
            >
              {resource.creator.name}
              {date ? ` · ${date}` : ""}
            </p>
          </div>
          <a
            href={resource.external_url}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline",
              isFeature ? "text-brand-ink/80 hover:text-brand-ink" : "text-ink-muted hover:text-brand"
            )}
          >
            Visit source
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>
    </article>
  )
}

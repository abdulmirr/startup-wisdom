import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface PageShellProps {
  title?: string
  eyebrow?: string
  description?: string
  children?: ReactNode
  className?: string
  contained?: boolean
  align?: "left" | "center"
  width?: "default" | "wide"
}

export function PageShell({
  title,
  eyebrow,
  description,
  children,
  className,
  contained = true,
  align = "left",
  width = "default",
}: PageShellProps) {
  return (
    <div className={cn("pt-12 pb-24 sm:pt-16", className)}>
      <div
        className={cn(
          contained &&
            (width === "wide"
              ? "mx-auto w-full max-w-7xl px-5 sm:px-8"
              : "mx-auto w-full max-w-6xl px-5 sm:px-8")
        )}
      >
        {(eyebrow || title || description) && (
          <header
            className={cn(
              "mb-12 sm:mb-16",
              align === "left" ? "max-w-3xl" : "mx-auto max-w-3xl text-center"
            )}
          >
            {eyebrow && (
              <p className="mb-4 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-brand">
                {eyebrow}
              </p>
            )}
            {title && (
              <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
                {description}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </div>
  )
}

interface SectionHeadingProps {
  children: ReactNode
  href?: string
  hrefLabel?: string
  className?: string
}

export function SectionHeading({
  children,
  href,
  hrefLabel,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-6 flex items-end justify-between gap-6 border-b border-line pb-3",
        className
      )}
    >
      <h2 className="font-serif text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {children}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-ink-muted transition-colors hover:text-brand"
        >
          {hrefLabel ?? "All"}
          <ArrowUpRight className="size-3.5" />
        </Link>
      )}
    </div>
  )
}

export function ComingSoon({
  hint,
  milestone,
}: {
  hint?: string
  milestone?: string
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-2 shadow-sm">
      <div className="border-b border-line bg-surface-3 px-6 py-3">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-brand">
          {milestone ? `In development · ${milestone}` : "In development"}
        </p>
      </div>
      <div className="px-6 py-14 text-center sm:px-10 sm:py-20">
        <p className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Coming soon.
        </p>
        {hint && (
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">{hint}</p>
        )}
      </div>
    </div>
  )
}

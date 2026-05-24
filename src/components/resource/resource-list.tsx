import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import {
  formatPublishedDate,
  formatReadingTime,
  mediumLabel,
} from "@/lib/format"
import type { ResourceWithRelations } from "@/lib/types"

interface ResourceListProps {
  resources: ResourceWithRelations[]
}

export function ResourceList({ resources }: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <p className="text-sm text-ink-muted">No resources match these filters.</p>
    )
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface-2 shadow-xs">
      {resources.map((r) => {
        const reading = formatReadingTime(r.duration_seconds, r.word_count)
        const date = formatPublishedDate(r.published_at)
        return (
          <li key={r.id}>
            <Link
              href={`/resource/${r.slug}`}
              className="group flex items-center gap-6 px-6 py-5 transition-colors hover:bg-surface-3"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-serif text-base font-semibold tracking-tight text-ink transition-colors group-hover:text-brand sm:text-lg">
                  {r.title}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">
                  {r.creator.name}
                  {date ? <span className="text-ink-soft"> · {date}</span> : null}
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-4 sm:flex">
                <span className="font-mono text-[0.6875rem] uppercase tracking-wide text-ink-soft">
                  {mediumLabel(r.medium)}
                  {reading ? ` · ${reading}` : ""}
                </span>
                <ArrowUpRight className="size-4 text-ink-soft transition-colors group-hover:text-brand" />
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

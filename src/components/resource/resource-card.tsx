import Image from "next/image"
import Link from "next/link"
import type { ResourceWithRelations } from "@/lib/types"
import {
  formatPublishedDate,
  formatReadingTime,
  mediumLabel,
} from "@/lib/format"
import { cn } from "@/lib/utils"

interface ResourceCardProps {
  resource: ResourceWithRelations
  className?: string
}

export function ResourceCard({ resource, className }: ResourceCardProps) {
  const readingTime = formatReadingTime(
    resource.duration_seconds,
    resource.word_count
  )
  const date = formatPublishedDate(resource.published_at)
  const meta = [date, mediumLabel(resource.medium), readingTime]
    .filter(Boolean)
    .join(" · ")

  const thumbnail = resource.thumbnail_url || resource.creator.avatar_url
  const usingCreatorAvatar =
    !resource.thumbnail_url && resource.creator.avatar_url

  return (
    <Link
      href={`/resource/${resource.slug}`}
      className={cn(
        "group relative flex flex-col rounded-xl border border-line bg-surface-2 p-3 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-surface-3">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={resource.title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 100vw"
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-[1.03]",
              usingCreatorAvatar && "object-top"
            )}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-3xl italic text-ink-soft">
              {resource.creator.name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </span>
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-surface-1/85 px-2 py-0.5 font-mono text-[0.5625rem] font-medium uppercase tracking-[0.12em] text-ink-muted shadow-xs backdrop-blur-sm">
          {mediumLabel(resource.medium)}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <h3 className="font-serif text-[1.0625rem] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-brand">
          {resource.title}
        </h3>
        <p className="mt-1.5 text-[0.8125rem] font-medium text-ink-muted">
          {resource.creator.name}
        </p>
        {meta && (
          <p className="mt-0.5 text-[0.75rem] text-ink-soft">
            {meta}
          </p>
        )}

        {resource.description && (
          <p className="mt-3 line-clamp-3 text-[0.8125rem] leading-relaxed text-ink-muted">
            {resource.description}
          </p>
        )}
      </div>
    </Link>
  )
}

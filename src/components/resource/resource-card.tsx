import Image from "next/image"
import Link from "next/link"
import type { ResourceWithRelations } from "@/lib/types"
import {
  formatPublishedDate,
  formatReadingTime,
  mediumLabel,
} from "@/lib/format"
import { cn, thumbnailPositionClass } from "@/lib/utils"

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
  const meta = [date, readingTime].filter(Boolean).join(" · ")
  const firstSentence = resource.description
    ? (resource.description.match(/^[\s\S]*?[.!?](?=\s|$)/)?.[0] ??
        resource.description)
    : null

  const thumbnail = resource.thumbnail_url || resource.creator.avatar_url
  const usingCreatorAvatar =
    !resource.thumbnail_url && resource.creator.avatar_url
  const positionClass =
    thumbnailPositionClass(resource.thumbnail_position) ??
    (usingCreatorAvatar ? "object-top" : undefined)

  return (
    <Link
      href={`/resource/${resource.slug}`}
      className={cn(
        "group flex flex-col rounded-xl bg-surface-2 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-surface-3 hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-surface-3">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={resource.title}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 100vw"
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-[1.03]",
              positionClass
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
        <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[0.6875rem] font-medium text-white shadow-xs backdrop-blur-sm">
          {mediumLabel(resource.medium)}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-0.5 pb-0.5 pt-3.5">
        <h3 className="font-sans text-[0.9375rem] font-semibold leading-[1.25] tracking-tight text-ink underline-offset-[3px] decoration-1 transition-colors group-hover:text-brand group-hover:underline">
          {resource.title}
        </h3>
        <p className="mt-0.5 text-[0.75rem] font-medium text-ink-muted">
          {resource.creator.name}
        </p>
        {meta && (
          <p className="text-[0.6875rem] text-ink-soft">
            {meta}
          </p>
        )}
        {firstSentence && (
          <p className="mt-2 text-[0.75rem] leading-snug text-ink-muted">
            {firstSentence}
          </p>
        )}
      </div>
    </Link>
  )
}

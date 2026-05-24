import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Collection } from "@/lib/types"

interface CollectionPosterCardProps {
  collection: Collection
  cover?: { src: string; alt: string }
  index?: number
}

export function CollectionPosterCard({
  collection,
  cover,
  index = 0,
}: CollectionPosterCardProps) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group block"
      aria-label={`Open collection: ${collection.title}`}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-line bg-surface-2 shadow-sm",
          "transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "will-change-transform",
          "group-hover:-translate-y-2 group-hover:-rotate-[1.25deg] group-hover:shadow-lg",
          "group-focus-visible:-translate-y-2 group-focus-visible:-rotate-[1.25deg] group-focus-visible:shadow-lg"
        )}
      >
        <div className="relative aspect-[5/6] w-full overflow-hidden bg-surface-3">
          {cover ? (
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-4xl italic text-ink-soft">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
            <p className="font-mono text-[0.5625rem] font-medium uppercase tracking-[0.18em] text-white/70">
              Collection · {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-1.5 font-serif text-base font-semibold leading-tight tracking-tight text-white sm:text-[1.0625rem]">
              {collection.title}
            </h3>
          </div>
        </div>

        <div className="flex items-start justify-between gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3">
          {collection.description ? (
            <p className="text-[0.6875rem] leading-snug text-ink-muted">
              {collection.description}
            </p>
          ) : (
            <span />
          )}
          <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-[0.625rem] font-medium text-ink-muted transition-colors group-hover:text-brand">
            Open
            <ArrowUpRight className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

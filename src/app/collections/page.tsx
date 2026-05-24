import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { PageShell } from "@/components/page-shell"
import { listCollections } from "@/lib/data"

export const metadata = { title: "Collections" }

const COLLECTION_COVERS: Record<string, { src: string; alt: string }> = {
  "pre-launch-canon": {
    src: "/paintings/tower-of-babel.webp",
    alt: "Pieter Bruegel, The Tower of Babel",
  },
  "founder-mode-reading-list": {
    src: "/paintings/wanderer-above-the-sea-of-fog.webp",
    alt: "Caspar David Friedrich, Wanderer Above the Sea of Fog",
  },
  "when-youre-stuck-on-ideas": {
    src: "/paintings/melencolia-i.webp",
    alt: "Albrecht Dürer, Melencolia I",
  },
}

export default async function CollectionsPage() {
  const collections = await listCollections()

  return (
    <PageShell
      eyebrow="Collections"
      title="Curated paths through the archive."
      description="Pre-launch checklists, founder-mode reading orders, what to read when you're stuck on ideas — admin-curated, no algorithms."
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {collections.map((c, i) => {
          const cover = COLLECTION_COVERS[c.slug]
          return (
            <li key={c.id}>
              <Link
                href={`/collections/${c.slug}`}
                className="group flex h-full gap-5 rounded-lg border border-line bg-surface-2 p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
              >
                <div className="relative aspect-square w-32 shrink-0 overflow-hidden rounded-md bg-surface-3 sm:w-36">
                  {cover ? (
                    <Image
                      src={cover.src}
                      alt={cover.alt}
                      fill
                      sizes="(min-width: 640px) 144px, 128px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-serif text-3xl italic text-ink-soft">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4 py-1">
                  <div>
                    <h2 className="font-serif text-xl font-semibold leading-tight tracking-tight text-ink transition-colors group-hover:text-brand sm:text-2xl">
                      {c.title}
                    </h2>
                    {c.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                        {c.description}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-ink transition-colors group-hover:text-brand">
                    Open collection
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </PageShell>
  )
}

import Link from "next/link"
import { ArrowRight, ArrowUpRight, MessageSquareText } from "lucide-react"

import { HighlightSpotlight } from "@/components/highlight/highlight-spotlight"
import { ResourceCard } from "@/components/resource/resource-card"
import { SectionHeading } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import {
  getDailyHighlight,
  listCollections,
  listResources,
} from "@/lib/data"

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default async function HomePage() {
  const [daily, collections, recent] = await Promise.all([
    getDailyHighlight(todayIso()),
    listCollections(),
    listResources({ sort: "added_desc", limit: 6 }),
  ])

  const featured = collections[0]

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
      {/* Hero */}
      <section className="mb-24 max-w-4xl sm:mb-28">
        <p className="mb-5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-brand">
          The founder archive
        </p>
        <h1 className="font-serif text-[2.75rem] font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl md:text-[4.25rem]">
          The canonical library of founder wisdom.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl">
          Hand-picked essays, talks, and interviews from the founders who built
          the things you use. Read by humans, distilled by AI, indexed for the
          questions you&apos;ll actually ask.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button
            render={<Link href="/database" />}
            nativeButton={false}
            size="lg"
          >
            Open the database
            <ArrowRight className="size-4" />
          </Button>
          <Button
            render={<Link href="/ask" />}
            nativeButton={false}
            size="lg"
            variant="outline"
          >
            <MessageSquareText className="size-4" />
            Ask the archive
          </Button>
        </div>
      </section>

      {/* Today's highlight — signature feature surface */}
      {daily && (
        <section className="mb-24">
          <SectionHeading href="/today" hrefLabel="Past days">
            Today&rsquo;s highlight
          </SectionHeading>
          <HighlightSpotlight data={daily} variant="large" surface="feature" />
        </section>
      )}

      {/* Featured collection — editorial card */}
      {featured && (
        <section className="mb-24">
          <SectionHeading href="/collections" hrefLabel="All collections">
            Featured collection
          </SectionHeading>
          <Link
            href={`/collections/${featured.slug}`}
            className="group grid overflow-hidden rounded-lg border border-line bg-surface-2 shadow-sm transition-all hover:shadow-md sm:grid-cols-[5fr_4fr]"
          >
            <div className="flex flex-col justify-between gap-8 p-8 sm:p-12">
              <div>
                <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-brand">
                  Curated path
                </p>
                <h3 className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                  {featured.title}
                </h3>
                {featured.description && (
                  <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
                    {featured.description}
                  </p>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors group-hover:text-brand">
                Open collection
                <ArrowUpRight className="size-4" />
              </span>
            </div>
            <div className="relative hidden bg-brand sm:block">
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <span
                  aria-hidden
                  className="font-serif text-[14rem] font-bold leading-none text-brand-ink/10"
                >
                  &ldquo;
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Recent */}
      <section>
        <SectionHeading href="/database" hrefLabel="All resources">
          Recently added
        </SectionHeading>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      </section>
    </div>
  )
}

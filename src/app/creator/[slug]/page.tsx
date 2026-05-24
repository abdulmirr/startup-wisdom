import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { notFound } from "next/navigation"

import { PageShell, SectionHeading } from "@/components/page-shell"
import { ResourceGrid } from "@/components/resource/resource-grid"
import {
  getCreatorBySlug,
  listCreators,
  listResources,
} from "@/lib/data"

export async function generateStaticParams() {
  const creators = await listCreators()
  return creators.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const creator = await getCreatorBySlug(slug)
  if (!creator) return {}
  return { title: `${creator.name} — archive` }
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const creator = await getCreatorBySlug(slug)
  if (!creator) notFound()
  const resources = await listResources({
    creator: slug,
    sort: "published_desc",
  })

  return (
    <PageShell>
      <header className="mb-14 flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
        {creator.avatar_url && (
          <div className="relative size-28 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-3 shadow-sm sm:size-32">
            <Image
              src={creator.avatar_url}
              alt={creator.name}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-brand">
            Creator
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            {creator.name}
          </h1>
          {creator.bio && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              {creator.bio}
            </p>
          )}
          {creator.homepage_url && (
            <a
              href={creator.homepage_url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              {creator.homepage_url.replace(/^https?:\/\//, "")}
              <ArrowUpRight className="size-3.5" />
            </a>
          )}
        </div>
      </header>

      <SectionHeading>
        {resources.length}{" "}
        {resources.length === 1 ? "resource" : "resources"} in the archive
      </SectionHeading>
      <ResourceGrid resources={resources} />
    </PageShell>
  )
}

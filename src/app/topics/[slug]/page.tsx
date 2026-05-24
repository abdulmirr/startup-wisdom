import { notFound } from "next/navigation"

import { PageShell, SectionHeading } from "@/components/page-shell"
import { ResourceGrid } from "@/components/resource/resource-grid"
import { getTopicBySlug, listResources } from "@/lib/data"
import { TOPIC_DEFINITIONS } from "../../../../data/topics"

export async function generateStaticParams() {
  return TOPIC_DEFINITIONS.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const topic = await getTopicBySlug(slug)
  if (!topic) return {}
  return { title: `${topic.name} — topics` }
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const topic = await getTopicBySlug(slug)
  if (!topic) notFound()
  const resources = await listResources({ topic: slug })

  return (
    <PageShell
      eyebrow="Topic"
      title={topic.name}
      description={
        topic.description ??
        `Every resource in the archive tagged with ${topic.name.toLowerCase()}.`
      }
    >
      <SectionHeading>
        {resources.length}{" "}
        {resources.length === 1 ? "resource" : "resources"}
      </SectionHeading>
      <ResourceGrid resources={resources} />
    </PageShell>
  )
}

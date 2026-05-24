import type { MetadataRoute } from "next"

import {
  listCollections,
  listCreators,
  listResources,
  listTopics,
} from "@/lib/data"
import { env } from "@/lib/env"

function origin() {
  return env.SITE_URL ?? "https://archive.example"
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = origin()
  const [resources, creators, topics, collections] = await Promise.all([
    listResources({}),
    listCreators(),
    listTopics(),
    listCollections(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/highlights",
    "/today",
    "/quotes",
    "/saved",
    "/ask",
    "/newsletter",
    "/about",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }))

  return [
    ...staticRoutes,
    ...resources.map((r) => ({
      url: `${base}/resource/${r.slug}`,
      lastModified: r.added_at,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...creators.map((c) => ({
      url: `${base}/creator/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...topics
      .filter((t) => t.resource_count > 0)
      .map((t) => ({
        url: `${base}/topics/${t.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ...collections.map((c) => ({
      url: `${base}/collections/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]
}

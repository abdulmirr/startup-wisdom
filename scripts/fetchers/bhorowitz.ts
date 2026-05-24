import { fetchGenericBlog } from "./_shared/blog"
import type { FetchedResource } from "./_shared/types"

export function fetchHorowitz(
  url: string,
  hintedTitle?: string
): Promise<FetchedResource> {
  return fetchGenericBlog(
    url,
    {
      sourceSlug: "bhorowitz",
      creatorSlug: "ben-horowitz",
      // bhorowitz.com is WordPress — entry-content is the article
      contentSelectors: [".entry-content", "article", "main"],
    },
    hintedTitle
  )
}

import { fetchGenericBlog } from "./_shared/blog"
import type { FetchedResource } from "./_shared/types"

export function fetchNaval(
  url: string,
  hintedTitle?: string
): Promise<FetchedResource> {
  return fetchGenericBlog(
    url,
    {
      sourceSlug: "naval",
      creatorSlug: "naval-ravikant",
      contentSelectors: [".entry-content", "article", "main"],
    },
    hintedTitle
  )
}

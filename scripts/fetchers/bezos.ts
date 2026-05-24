import { fetchGenericBlog } from "./_shared/blog"
import type { FetchedResource } from "./_shared/types"

export function fetchBezos(
  url: string,
  hintedTitle?: string
): Promise<FetchedResource> {
  return fetchGenericBlog(
    url,
    {
      sourceSlug: "bezos",
      creatorSlug: "jeff-bezos",
      medium: "letter",
      contentSelectors: ["article", ".body-content", "main"],
    },
    hintedTitle
  )
}

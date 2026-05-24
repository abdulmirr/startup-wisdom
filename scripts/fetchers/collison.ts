import { fetchGenericBlog } from "./_shared/blog"
import type { FetchedResource } from "./_shared/types"

export function fetchCollison(
  url: string,
  hintedTitle?: string
): Promise<FetchedResource> {
  return fetchGenericBlog(
    url,
    {
      sourceSlug: "collison",
      creatorSlug: "patrick-collison",
      // patrickcollison.com is minimal HTML — body is fine
      contentSelectors: ["main", "body"],
    },
    hintedTitle
  )
}

import { fetchGenericBlog } from "./_shared/blog"
import type { FetchedResource } from "./_shared/types"

export function fetchAltman(
  url: string,
  hintedTitle?: string
): Promise<FetchedResource> {
  return fetchGenericBlog(
    url,
    {
      sourceSlug: "altman",
      creatorSlug: "sam-altman",
      // Posthaven blog — articles live under .article or .post-content
      contentSelectors: [".article", ".post-content", "article"],
    },
    hintedTitle
  )
}

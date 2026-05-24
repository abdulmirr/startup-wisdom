import { fetchGenericBlog } from "./_shared/blog"
import type { FetchedResource } from "./_shared/types"

export function fetchChesky(
  url: string,
  hintedTitle?: string
): Promise<FetchedResource> {
  return fetchGenericBlog(
    url,
    {
      sourceSlug: "chesky",
      creatorSlug: "brian-chesky",
      // Medium article body lives in <article>; can fall back to main
      contentSelectors: ["article", "main"],
      stripSelectors: [
        // Medium adds a lot of in-article UI we don't want
        "[role=button]",
        "button",
        ".pw-multi-vote-icon",
        ".pw-multi-vote-count",
        ".js-postFooter",
      ],
    },
    hintedTitle
  )
}

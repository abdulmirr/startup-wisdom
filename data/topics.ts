// Controlled topic vocabulary. AI tags resources from this list only.
// Adding a new topic = an admin action in production; in mock it's a code edit.

export const TOPIC_DEFINITIONS = [
  { slug: "idea-generation",     name: "Idea Generation",     order: 10 },
  { slug: "product-market-fit",  name: "Product–Market Fit",  order: 20 },
  { slug: "founder-mode",        name: "Founder Mode",        order: 30 },
  { slug: "hiring",              name: "Hiring",              order: 40 },
  { slug: "firing",              name: "Firing",              order: 41 },
  { slug: "cofounders",          name: "Cofounders",          order: 42 },
  { slug: "culture",             name: "Culture",             order: 43 },
  { slug: "leadership",          name: "Leadership",          order: 44 },
  { slug: "fundraising",         name: "Fundraising",         order: 50 },
  { slug: "sales",               name: "Sales",               order: 60 },
  { slug: "pricing",             name: "Pricing",             order: 61 },
  { slug: "distribution",        name: "Distribution",        order: 62 },
  { slug: "growth",              name: "Growth",              order: 63 },
  { slug: "strategy",            name: "Strategy",            order: 70 },
  { slug: "competition",         name: "Competition",         order: 71 },
  { slug: "productivity",        name: "Productivity",        order: 80 },
  { slug: "time",                name: "Time",                order: 80.5 },
  { slug: "mental-models",       name: "Mental Models",       order: 81 },
  { slug: "decision-making",     name: "Decision Making",     order: 82 },
  { slug: "career",              name: "Career",              order: 83 },
  { slug: "wealth",              name: "Wealth",              order: 84 },
  { slug: "leverage",            name: "Leverage",            order: 84.5 },
  { slug: "storytelling",        name: "Storytelling",        order: 85 },
  { slug: "writing",             name: "Writing",             order: 86 },
  { slug: "resilience",          name: "Resilience",          order: 87 },
  { slug: "risk",                name: "Risk",                order: 88 },
  { slug: "networks",            name: "Networks",            order: 89 },
  { slug: "mission",             name: "Mission",             order: 90 },
] as const

export type TopicSlug = (typeof TOPIC_DEFINITIONS)[number]["slug"]

export const TOPIC_SLUGS: TopicSlug[] = TOPIC_DEFINITIONS.map((t) => t.slug)

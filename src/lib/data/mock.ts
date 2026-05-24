// Mock data for the archive — used until Supabase env is wired up.
// Quotes are real where possible (verbatim from the source) but should be
// double-checked / replaced once the real extraction pipeline runs.

import { TOPIC_DEFINITIONS, type TopicSlug } from "../../../data/topics"
import type {
  Collection,
  CollectionWithItems,
  Creator,
  Highlight,
  Resource,
  ResourceDetail,
  Source,
  ThumbnailPosition,
  Topic,
} from "../types"

const uid = (s: string) => s // For mock, slugs serve as ids.

// Creators -------------------------------------------------------------------

export const CREATORS: Creator[] = [
  {
    id: uid("paul-graham"),
    slug: "paul-graham",
    name: "Paul Graham",
    bio: "Founded Viaweb (sold to Yahoo, 1998) and Y Combinator (2005). Essayist whose writing shaped a generation of founders.",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Paulgraham_240x320.jpg",
    homepage_url: "https://paulgraham.com",
  },
  {
    id: uid("marc-andreessen"),
    slug: "marc-andreessen",
    name: "Marc Andreessen",
    bio: "Co-founded Netscape (1994), Loudcloud / Opsware, and Andreessen Horowitz (2009).",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Marc_Andreessen-9_%28cropped%29.jpg",
    homepage_url: "https://pmarchive.com",
  },
  {
    id: uid("sam-altman"),
    slug: "sam-altman",
    name: "Sam Altman",
    bio: "Co-founded Loopt, ran Y Combinator, and co-founded OpenAI.",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped_3%29.jpg",
    homepage_url: "https://blog.samaltman.com",
  },
  {
    id: uid("naval-ravikant"),
    slug: "naval-ravikant",
    name: "Naval Ravikant",
    bio: "Co-founded AngelList. Writes and podcasts on wealth, leverage, and clear thinking.",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/5/55/Naval_Ravikant_%28cropped%29.jpg",
    homepage_url: "https://nav.al",
  },
  {
    id: uid("patrick-collison"),
    slug: "patrick-collison",
    name: "Patrick Collison",
    bio: "Co-founded Stripe (2010) with his brother John. Writes on progress and ambition.",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/7/74/Patrick_Collison_%28cropped%29.jpg",
    homepage_url: "https://patrickcollison.com",
  },
  {
    id: uid("brian-chesky"),
    slug: "brian-chesky",
    name: "Brian Chesky",
    bio: "Co-founded Airbnb (2008). Coined 'Founder Mode' in his 2024 YC talk.",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Brian_Chesky_2025.jpg",
    homepage_url: "https://medium.com/@bchesky",
  },
  {
    id: uid("jeff-bezos"),
    slug: "jeff-bezos",
    name: "Jeff Bezos",
    bio: "Founded Amazon (1994). His annual shareholder letters (1997–2020) are a canonical text on long-term thinking.",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/f/fc/260202-D-PM193-2205_SECWAR_Arsenal_of_Freedom_Tour_-_Florida_%283x4_cropped_on_Bezos_and_rotated%29.jpg",
    homepage_url: "https://aboutamazon.com",
  },
  {
    id: uid("ben-horowitz"),
    slug: "ben-horowitz",
    name: "Ben Horowitz",
    bio: "Co-founded Loudcloud / Opsware (sold to HP, 2007) and Andreessen Horowitz. Author of 'The Hard Thing About Hard Things.'",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/a/a6/TechCrunch_Disrupt_San_Francisco_2018_-_day_2_%2842713740520%29_%28cropped%29.jpg",
    homepage_url: "https://bhorowitz.com",
  },
  {
    id: uid("startup-archive"),
    slug: "various-founders",
    name: "Various Founders",
    bio: "Founder interviews from the Startup Archive YouTube channel — Jobs, Bezos, Musk, Spiegel, Karp, and others.",
    avatar_url: "https://yt3.googleusercontent.com/ytc/AGIKgqOzNQGUTvOSj1ojGsnUuPDMmsnTGu6oFKqK4_VK=s176-c-k-c0x00ffffff-no-rj",
    homepage_url: "https://youtube.com/@startuparchive_",
  },
  // ── Speakers featured in Startup Archive clips ──────────────────────
  // No homepage_url for the people without a canonical writing site.
  {
    id: uid("steve-jobs"),
    slug: "steve-jobs",
    name: "Steve Jobs",
    bio: "Co-founded Apple (1976), led the NeXT and Pixar eras, returned to Apple in 1997.",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Steve_Jobs_Headshot_2010-CROP2.jpg",
    homepage_url: null,
  },
  {
    id: uid("mark-zuckerberg"),
    slug: "mark-zuckerberg",
    name: "Mark Zuckerberg",
    bio: "Co-founded Facebook (2004); CEO of Meta.",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg",
    homepage_url: null,
  },
  {
    id: uid("eric-schmidt"),
    slug: "eric-schmidt",
    name: "Eric Schmidt",
    bio: "CEO of Google (2001–2011), Executive Chairman through 2017.",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Eric_E._Schmidt.jpg",
    homepage_url: null,
  },
  {
    id: uid("jony-ive"),
    slug: "jony-ive",
    name: "Jony Ive",
    bio: "Chief Design Officer at Apple (1997–2019); co-founded LoveFrom.",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/0/0c/JonyIve2014.jpg",
    homepage_url: null,
  },
  {
    id: uid("tobi-lutke"),
    slug: "tobi-lutke",
    name: "Tobi Lütke",
    bio: "Co-founded Shopify (2006) and serves as its CEO.",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/3/37/Tobias_L%C3%BCtke_-_2017_%28cropped%29.jpg",
    homepage_url: null,
  },
  {
    id: uid("keith-rabois"),
    slug: "keith-rabois",
    name: "Keith Rabois",
    bio: "Operating roles at PayPal, LinkedIn, Square; investor at Khosla and Founders Fund.",
    avatar_url: "https://upload.wikimedia.org/wikipedia/commons/7/75/Keith_Rabois_2014.jpg",
    homepage_url: null,
  },
]

// Sources --------------------------------------------------------------------

export const SOURCES: Source[] = [
  { id: uid("paulgraham"), slug: "paulgraham",       name: "paulgraham.com",          base_url: "https://paulgraham.com",     kind: "blog" },
  { id: uid("pmarchive"),  slug: "pmarchive",        name: "pmarchive.com",           base_url: "https://pmarchive.com",      kind: "blog" },
  { id: uid("altman"),     slug: "altman",           name: "blog.samaltman.com",      base_url: "https://blog.samaltman.com", kind: "blog" },
  { id: uid("naval"),      slug: "naval",            name: "nav.al",                  base_url: "https://nav.al",             kind: "blog" },
  { id: uid("collison"),   slug: "collison",         name: "patrickcollison.com",     base_url: "https://patrickcollison.com",kind: "blog" },
  { id: uid("chesky"),     slug: "chesky",           name: "Brian Chesky writing",    base_url: "https://medium.com/@bchesky",kind: "blog" },
  { id: uid("bezos"),      slug: "bezos",            name: "Bezos shareholder letters", base_url: "https://aboutamazon.com", kind: "letters" },
  { id: uid("bhorowitz"),  slug: "bhorowitz",        name: "bhorowitz.com",           base_url: "https://bhorowitz.com",      kind: "blog" },
  { id: uid("startup-archive-yt"), slug: "startup-archive-yt", name: "Startup Archive (YouTube)", base_url: "https://youtube.com/@startuparchive_", kind: "youtube" },
]

// Topics ---------------------------------------------------------------------

export const TOPICS: Topic[] = TOPIC_DEFINITIONS.map((t) => ({
  id: uid(t.slug),
  slug: t.slug,
  name: t.name,
  description: null,
  sort_order: t.order,
}))

// Resources ------------------------------------------------------------------

interface MockResourceInput {
  slug: string
  title: string
  creator: string
  source: string
  medium: Resource["medium"]
  external_url: string
  duration_seconds?: number
  word_count?: number
  published_at: string
  added_at: string
  description: string
  thumbnail_url?: string
  thumbnail_position?: ThumbnailPosition
  topics: TopicSlug[]
  key_highlight: { body: string; context?: string; timestamp?: number }
  highlights: Array<{ body: string; context?: string; timestamp?: number }>
}

const RAW: MockResourceInput[] = [
  // ── Paul Graham ────────────────────────────────────────────────────────
  {
    slug: "do-things-that-dont-scale",
    title: "Do Things That Don't Scale",
    creator: "paul-graham",
    source: "paulgraham",
    medium: "essay",
    external_url: "https://paulgraham.com/ds.html",
    word_count: 4200,
    published_at: "2013-07-15",
    added_at: "2026-05-12T10:00:00Z",
    description:
      "Why the most successful early-stage startups do things that look like they couldn't possibly scale — and why you should too.",
    topics: ["idea-generation", "product-market-fit", "growth", "founder-mode"],
    key_highlight: {
      body: "Startups take off because the founders make them take off. There may be a handful that just grew by themselves, but usually it takes some sort of push to get them going.",
    },
    highlights: [
      { body: "The most common unscalable thing founders have to do at the start is recruit users manually." },
      { body: "It's not enough just to be willing to do unscalable things. You have to be obsessed with delighting your early users." },
      { body: "Almost all startups are fragile initially. And that's one of the biggest things inexperienced founders and investors get wrong about them." },
      { body: "Sometimes the right unscalable trick is to focus on a deliberately narrow market. It's like keeping a fire contained at first to get it really hot before adding more logs." },
      { body: "Over-engaging with early users is not just a permissible technique for getting growth rolling. For most successful startups it's a necessary part of the feedback loop that makes the product good." },
      { body: "The need to do something unscalable to launch is so nearly universal that it might be a good idea to stop thinking of startup ideas as scalars. Instead we should try thinking of them as pairs of what you're going to build, plus the unscalable thing(s) you're going to do initially to get the company going." },
    ],
  },
  {
    slug: "how-to-get-startup-ideas",
    title: "How to Get Startup Ideas",
    creator: "paul-graham",
    source: "paulgraham",
    medium: "essay",
    external_url: "https://paulgraham.com/startupideas.html",
    word_count: 7500,
    published_at: "2012-11-01",
    added_at: "2026-05-11T10:00:00Z",
    description:
      "The way to get startup ideas is not to try to think of startup ideas. It's to look for problems, preferably problems you have yourself.",
    topics: ["idea-generation", "product-market-fit", "founder-mode"],
    key_highlight: {
      body: "The way to get startup ideas is not to try to think of startup ideas. It's to look for problems, preferably problems you have yourself.",
    },
    highlights: [
      { body: "The very best startup ideas tend to have three things in common: they're something the founders themselves want, that they themselves can build, and that few others realize are worth doing." },
      { body: "Live in the future, then build what's missing." },
      { body: "Pay particular attention to things that chafe you. The advantage of taking the status quo for granted is not just that it makes life (locally) more efficient, but also that it makes life more tolerable." },
      { body: "When a startup launches, there have to be at least some users who really need what they're making — not just people who could see themselves using it one day, but who want it urgently." },
      { body: "If you're not at the leading edge of some rapidly changing field, you can get to one. For example, anyone reasonably smart can probably get to an edge of programming (e.g. building mobile apps) in a year." },
    ],
  },
  {
    slug: "makers-schedule-managers-schedule",
    title: "Maker's Schedule, Manager's Schedule",
    creator: "paul-graham",
    source: "paulgraham",
    medium: "essay",
    external_url: "https://paulgraham.com/makersschedule.html",
    word_count: 1300,
    published_at: "2009-07-01",
    added_at: "2026-05-10T10:00:00Z",
    description:
      "Two ways to use time: the maker's schedule (units of half a day) and the manager's schedule (units of an hour). Mix them at your peril.",
    topics: ["productivity", "time", "founder-mode"],
    key_highlight: {
      body: "When you're operating on the maker's schedule, meetings are a disaster. A single meeting can blow a whole afternoon, by breaking it into two pieces each too small to do anything hard in.",
    },
    highlights: [
      { body: "There are two types of schedule, which I'll call the manager's schedule and the maker's schedule. The manager's schedule is for bosses. It's embodied in the traditional appointment book, with each day cut into one hour intervals." },
      { body: "When you use time that way, it's merely a practical problem to meet with someone. Find an open slot in your schedule, book them, and you're done." },
      { body: "Most powerful people are on the manager's schedule. It's the schedule of command. But there's another way of using time that's common among people who make things, like programmers and writers. They generally prefer to use time in units of half a day at least." },
      { body: "I find one meeting can sometimes affect a whole day. A meeting commonly blows at least half a day, by breaking up a morning or afternoon." },
    ],
  },
  {
    slug: "founder-mode",
    title: "Founder Mode",
    creator: "paul-graham",
    source: "paulgraham",
    medium: "essay",
    external_url: "https://paulgraham.com/foundermode.html",
    word_count: 1800,
    published_at: "2024-09-01",
    added_at: "2026-05-19T10:00:00Z",
    description:
      "The conventional wisdom about how to run a large company is mistaken. There's a different mode founders are reverting to.",
    topics: ["founder-mode", "leadership", "culture", "strategy"],
    key_highlight: {
      body: "There are things founders can do that managers can't, and not doing them feels wrong to founders, because it is.",
    },
    highlights: [
      { body: "Almost everyone who run companies eventually gets advice from VCs and others to 'hire good people and give them room to do their jobs.' Following this advice has often hurt them so badly that their stories sound like horror stories." },
      { body: "Hire good people and give them room to do their jobs. Sounds great when it's described that abstractly, doesn't it? Except in practice, judging from the report of founder after founder, what this often turns out to mean is: hire professional fakers and let them drive the company into the ground." },
      { body: "Whereas a CEO has to act like the manager of a manager of a manager, all the way down, a founder can — and arguably should — short-circuit the org chart whenever it serves the company." },
      { body: "Founder mode will be more chaotic and messier in some ways. The CEO will not be limited to communicating with their direct reports." },
    ],
  },
  {
    slug: "how-to-start-a-startup",
    title: "How to Start a Startup",
    creator: "paul-graham",
    source: "paulgraham",
    medium: "essay",
    external_url: "https://paulgraham.com/start.html",
    word_count: 6000,
    published_at: "2005-03-01",
    added_at: "2026-05-09T10:00:00Z",
    description:
      "You need three things to create a successful startup: to start with good people, to make something customers actually want, and to spend as little money as possible.",
    topics: ["cofounders", "product-market-fit", "fundraising", "hiring"],
    key_highlight: {
      body: "You need three things to create a successful startup: to start with good people, to make something customers actually want, and to spend as little money as possible. Most startups that fail do it because they fail at one of these.",
    },
    highlights: [
      { body: "What matters is not ideas, but the people who have them. Good people can fix bad ideas, but good ideas can't save bad people." },
      { body: "When you're choosing co-founders, character is more important than smarts. Smart but flaky founders are worse than mediocre but dependable founders." },
      { body: "The best way to make something customers want is to make something you yourself want. Then at least you know there's one person who wants it." },
      { body: "Don't get too attached to your original plan, because it's probably wrong. Most successful startups end up doing something different than they originally intended — often very different." },
    ],
  },

  // ── Marc Andreessen ───────────────────────────────────────────────────
  {
    slug: "guide-to-startups-part-1",
    title: "The Pmarca Guide to Startups, Part 1: Why not to do a startup",
    creator: "marc-andreessen",
    source: "pmarchive",
    medium: "essay",
    external_url: "https://pmarchive.com/guide_to_startups_part1.html",
    word_count: 2800,
    published_at: "2007-06-08",
    added_at: "2026-05-08T10:00:00Z",
    description:
      "Marc opens his 9-part guide by arguing most people shouldn't start startups — and that this is the most important thing to understand first.",
    topics: ["founder-mode", "career", "risk", "resilience"],
    key_highlight: {
      body: "Startups, like the rest of life, are full of pain. The pain of failure, of customers who don't want what you've built, of investors who don't return calls, of employees who quit. If you can't deal with that pain, don't start a startup.",
    },
    highlights: [
      { body: "Most startups fail. Always have, always will. The press doesn't write about failure because failure is boring; success is interesting. So your sample of what's possible is dramatically biased." },
      { body: "Working at a startup is not glamorous. The hours are long, the pay is low, and the odds of any sort of payoff are slim." },
      { body: "If you have a great job at a great company, with a great manager, doing something you love — don't quit." },
      { body: "The best startups don't get started because the founders sat around brainstorming startup ideas. They get started because the founders ran into a problem and couldn't help themselves from solving it." },
    ],
  },
  {
    slug: "guide-to-startups-part-4",
    title: "The Pmarca Guide to Startups, Part 4: The only thing that matters",
    creator: "marc-andreessen",
    source: "pmarchive",
    medium: "essay",
    external_url: "https://pmarchive.com/guide_to_startups_part4.html",
    word_count: 2400,
    published_at: "2007-06-25",
    added_at: "2026-05-07T10:00:00Z",
    description:
      "Marc's most-cited essay. Product/market fit isn't a step in the journey — it's the only thing that matters.",
    topics: ["product-market-fit", "strategy", "founder-mode"],
    key_highlight: {
      body: "The only thing that matters is getting to product/market fit. Product/market fit means being in a good market with a product that can satisfy that market.",
    },
    highlights: [
      { body: "You can always feel when product/market fit isn't happening. The customers aren't quite getting value out of the product, word of mouth isn't spreading, usage isn't growing that fast, press reviews are kind of 'blah,' the sales cycle takes too long, and lots of deals never close." },
      { body: "And you can always feel product/market fit when it's happening. The customers are buying the product just as fast as you can make it — or usage is growing just as fast as you can add more servers." },
      { body: "In a great market — a market with lots of real potential customers — the market pulls product out of the startup. The market needs to be fulfilled and the market will be fulfilled, by the first viable product that comes along." },
      { body: "In a terrible market, you can have the best product in the world and an absolutely killer team, and it doesn't matter — you're going to fail." },
      { body: "Whenever you see a successful startup, you see one that has reached product/market fit — and usually along the way screwed up all kinds of other things, from channel model to pipeline development strategy to marketing plan to press relations to compensation policies to the CEO sleeping with the venture capitalist. And the startup is still successful." },
    ],
  },
  {
    slug: "how-to-hire-the-best-people",
    title: "How to Hire the Best People You've Ever Worked With",
    creator: "marc-andreessen",
    source: "pmarchive",
    medium: "essay",
    external_url: "https://pmarchive.com/how_to_hire_the_best_people.html",
    word_count: 3200,
    published_at: "2007-06-06",
    added_at: "2026-05-06T10:00:00Z",
    description:
      "Marc's hiring framework: three traits that matter (drive, curiosity, ethics), and how to find them.",
    topics: ["hiring", "culture", "leadership"],
    key_highlight: {
      body: "Look for three things: drive, curiosity, and ethics. Drive is the willingness to commit to the kind of work it takes to win. Curiosity is the desire to learn new things constantly. Ethics is the willingness to do the right thing even when it's inconvenient.",
    },
    highlights: [
      { body: "Hire for the future, not the present. Hire people who can grow as the company grows, not people who fit the role as it exists today." },
      { body: "The worst hires aren't the ones who do bad work — they're the ones who do mediocre work indefinitely. Bad work gets fixed. Mediocre work slowly poisons everything around it." },
      { body: "Reference checks are 10x more valuable than interviews. Get references from people who actually worked with the candidate, not the references the candidate provides." },
      { body: "The best hires almost always come through your network. Cold pipelines and recruiters are a fallback, not a strategy." },
    ],
  },

  // ── Sam Altman ────────────────────────────────────────────────────────
  {
    slug: "startup-playbook",
    title: "Startup Playbook",
    creator: "sam-altman",
    source: "altman",
    medium: "essay",
    external_url: "https://playbook.samaltman.com",
    word_count: 10000,
    published_at: "2015-09-07",
    added_at: "2026-05-05T10:00:00Z",
    description:
      "Sam's compressed YC course: idea, team, product, execution, and growth.",
    topics: ["idea-generation", "product-market-fit", "growth", "founder-mode", "strategy"],
    key_highlight: {
      body: "A great startup is a vehicle for compounding leverage. You're not just building a product; you're building a system that lets a small number of people generate enormous value.",
    },
    highlights: [
      { body: "Bad markets kill good companies. The biggest risk in a startup is not having a market. It's where most startups die." },
      { body: "The most successful founders work on ideas that feel small, but are actually huge. Big ideas that don't feel small at the start are almost always too crowded." },
      { body: "Mediocre engineers do not build great companies. Build a company that great engineers want to work at." },
      { body: "Velocity of decision-making matters more than the quality of any individual decision, especially when you have less than 50 people." },
      { body: "Most founders give up too early. They lose because they don't execute well on something that would've worked." },
    ],
  },
  {
    slug: "how-to-be-successful",
    title: "How To Be Successful",
    creator: "sam-altman",
    source: "altman",
    medium: "essay",
    external_url: "https://blog.samaltman.com/how-to-be-successful",
    word_count: 3500,
    published_at: "2019-01-24",
    added_at: "2026-05-04T10:00:00Z",
    description:
      "13 things Sam observed in the most successful people he's met. Compound your way to extraordinary.",
    topics: ["career", "wealth", "productivity", "mental-models", "resilience"],
    key_highlight: {
      body: "Compound yourself. Compounding is magic. Look for it everywhere. Exponential curves are the key to wealth generation.",
    },
    highlights: [
      { body: "Have almost too much self-belief. Self-belief is immensely powerful. The most successful people I know believe in themselves almost to the point of delusion." },
      { body: "Learn to think independently. The most successful people I know are infuriatingly able to ignore the conventional wisdom." },
      { body: "Get good at 'sales.' All great careers, to some degree, become sales jobs. You have to evangelize your plans to customers, prospective employees, the press, investors, etc." },
      { body: "Make it easy to take risks. Most people overestimate the risk of trying things and underestimate the risk of not trying things." },
      { body: "Focus is a force multiplier on work. Almost everyone I've ever met would benefit from spending more time thinking about what to focus on." },
      { body: "Work hard. You can get to about the 90th percentile in your field by working either smart or hard. To be on the right tail of the distribution, you need both." },
      { body: "Be willing to let good opportunities pass you by to wait for a great one. Don't be afraid to take a long break to look for the right thing." },
    ],
  },
  {
    slug: "productivity",
    title: "Productivity",
    creator: "sam-altman",
    source: "altman",
    medium: "essay",
    external_url: "https://blog.samaltman.com/productivity",
    word_count: 3100,
    published_at: "2018-04-10",
    added_at: "2026-05-03T10:00:00Z",
    description:
      "Sam's framework for staying productive: pick the right work, prioritize ruthlessly, sustain energy.",
    topics: ["productivity", "time", "mental-models", "decision-making"],
    key_highlight: {
      body: "Compounding works on accomplishments too. Pick the right thing to work on. The right thing for you to work on is usually the thing you've been thinking about for years, the thing nobody else seems to be working on, and the thing you have a real edge in.",
    },
    highlights: [
      { body: "What I work on is more important than how much I work. Working on the right thing is more important than working many hours." },
      { body: "Don't fall into the trap of productivity porn. Reading about productivity is not the same as being productive." },
      { body: "Make a 'most important thing' list every day. Three to five things, in order of priority. Do them in order." },
      { body: "Don't be one of those people who does what is easy and immediate, instead of what is important." },
      { body: "Sleep more than you think you need to. Exercise. Spend time outdoors. Stay focused on what matters; everything else is noise." },
    ],
  },

  // ── Naval ─────────────────────────────────────────────────────────────
  {
    slug: "how-to-get-rich-without-getting-lucky",
    title: "How to Get Rich (Without Getting Lucky)",
    creator: "naval-ravikant",
    source: "naval",
    medium: "essay",
    external_url: "https://nav.al/rich",
    word_count: 4500,
    published_at: "2019-06-03",
    added_at: "2026-05-02T10:00:00Z",
    description:
      "Naval's tweetstorm-turned-canon on building wealth through specific knowledge, accountability, and leverage.",
    topics: ["wealth", "career", "leverage", "mental-models", "networks"],
    key_highlight: {
      body: "Seek wealth, not money or status. Wealth is having assets that earn while you sleep. Money is how we transfer time and wealth. Status is your place in the social hierarchy.",
    },
    highlights: [
      { body: "You're not going to get rich renting out your time. You must own equity — a piece of a business — to gain your financial freedom." },
      { body: "Specific knowledge is found by pursuing your genuine curiosity and passion rather than whatever is hot right now. Building specific knowledge will feel like play to you but will look like work to others." },
      { body: "Embrace accountability and take business risks under your own name. Society will reward you with responsibility, equity, and leverage." },
      { body: "Fortunes require leverage. Business leverage comes from capital, people, and products with no marginal cost of replication (code and media)." },
      { body: "Code and media are permissionless leverage. They're the leverage behind the newly rich. You can create software and media that works for you while you sleep." },
      { body: "Earn with your mind, not your time." },
    ],
  },
  {
    slug: "specific-knowledge",
    title: "How to Find Specific Knowledge",
    creator: "naval-ravikant",
    source: "naval",
    medium: "essay",
    external_url: "https://nav.al/specific-knowledge",
    word_count: 1200,
    published_at: "2019-11-15",
    added_at: "2026-05-01T10:00:00Z",
    description:
      "What specific knowledge actually is, why it can't be trained for, and how to recognize yours.",
    topics: ["career", "mental-models", "wealth"],
    key_highlight: {
      body: "Specific knowledge can't be taught, but it can be learned. The internet has massively broadened the possible space of careers. Most people haven't figured this out yet.",
    },
    highlights: [
      { body: "Specific knowledge is found much more by pursuing your innate talents, your genuine curiosity, and your passion." },
      { body: "It's not by going to school for whatever's the hottest job; it's not by going into whatever field investors say is the hottest." },
      { body: "If it can be taught, it can be outsourced and automated. Specific knowledge is, by definition, knowledge you cannot be trained for." },
      { body: "When specific knowledge is taught, it's through apprenticeships, not schools." },
    ],
  },

  // ── Patrick Collison ──────────────────────────────────────────────────
  {
    slug: "advice",
    title: "Advice",
    creator: "patrick-collison",
    source: "collison",
    medium: "essay",
    external_url: "https://patrickcollison.com/advice",
    word_count: 800,
    published_at: "2018-01-01",
    added_at: "2026-04-30T10:00:00Z",
    description:
      "Patrick's short list of unconventional advice for ambitious young people.",
    topics: ["career", "mental-models", "decision-making", "mission"],
    key_highlight: {
      body: "Be obsessed with the people you admire. Read everything they've written; study what they've done. The world is full of brilliant people you can apprentice to remotely.",
    },
    highlights: [
      { body: "Don't discount yourself. Many young people exhibit too much self-doubt." },
      { body: "Be ambitious. It's possible to do almost anything if you can put the years in." },
      { body: "Spend time around people who are doing impressive things in the world." },
      { body: "Use your judgment about what to do, not other people's. Don't ask, 'what should I do?' Ask, 'what should I make of this?'" },
    ],
  },

  // ── Brian Chesky ──────────────────────────────────────────────────────
  {
    slug: "dont-fuck-up-the-culture",
    title: "Don't Fuck Up the Culture",
    creator: "brian-chesky",
    source: "chesky",
    medium: "essay",
    external_url: "https://medium.com/@bchesky/dont-fuck-up-the-culture-597cde9ee9d4",
    word_count: 1100,
    published_at: "2014-04-20",
    added_at: "2026-04-29T10:00:00Z",
    description:
      "Brian's 2014 internal Airbnb memo on why protecting culture is the most important thing a founder does.",
    topics: ["culture", "founder-mode", "leadership", "mission"],
    key_highlight: {
      body: "The stronger the culture, the less corporate process a company needs. When the culture is strong, you can trust everyone to do the right thing. People can be independent and autonomous. They can be entrepreneurial.",
    },
    highlights: [
      { body: "Culture is a thousand things, a thousand times. It's living the core values when you hire; when you write an email; when you are working on a project; when you are walking in the hall." },
      { body: "We have the power, by living the culture, to build what we want to become. We have the power to fuck it up, too. We're not far enough along that we have a perfectly formed culture." },
      { body: "Why is culture so important to a business? Here is a simple way to frame it. The stronger the culture, the less corporate process a company needs." },
      { body: "If you break the culture, you break the machine that creates your products." },
    ],
  },

  // ── Jeff Bezos ────────────────────────────────────────────────────────
  {
    slug: "1997-shareholder-letter",
    title: "1997 Letter to Shareholders",
    creator: "jeff-bezos",
    source: "bezos",
    medium: "letter",
    external_url: "https://www.aboutamazon.com/news/company-news/1997-letter-to-shareholders",
    word_count: 2200,
    published_at: "1997-12-31",
    added_at: "2026-04-28T10:00:00Z",
    description:
      "The original. Bezos's first letter — establishing 'Day 1,' customer obsession, and long-term thinking as Amazon's operating doctrine.",
    topics: ["strategy", "mission", "leadership", "decision-making", "founder-mode"],
    key_highlight: {
      body: "It's all about the long term. We believe that a fundamental measure of our success will be the shareholder value we create over the long term. This value will be a direct result of our ability to extend and solidify our current market leadership position.",
    },
    highlights: [
      { body: "We will continue to make investment decisions in light of long-term market leadership considerations rather than short-term profitability considerations or short-term Wall Street reactions." },
      { body: "We will continue to focus relentlessly on our customers." },
      { body: "We will work hard to spend wisely and maintain our lean culture. We understand the importance of continually reinforcing a cost-conscious culture, particularly in a business incurring net losses." },
      { body: "When forced to choose between optimizing the appearance of our GAAP accounting and maximizing the present value of future cash flows, we'll take the cash flows." },
      { body: "This is Day 1 for the Internet and, if we execute well, for Amazon.com." },
    ],
  },
  {
    slug: "2016-shareholder-letter",
    title: "2016 Letter to Shareholders — Day 1",
    creator: "jeff-bezos",
    source: "bezos",
    medium: "letter",
    external_url: "https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders",
    word_count: 1800,
    published_at: "2017-04-12",
    added_at: "2026-04-27T10:00:00Z",
    description:
      "Bezos on staying Day 1: customer obsession, resisting proxies, embracing external trends, and high-velocity decision making.",
    topics: ["strategy", "decision-making", "leadership", "founder-mode", "competition"],
    key_highlight: {
      body: "Day 2 is stasis. Followed by irrelevance. Followed by excruciating, painful decline. Followed by death. And that is why it is always Day 1.",
    },
    highlights: [
      { body: "How do you fend off Day 2? What are the techniques and tactics? An obsessive customer focus. A skeptical view of proxies. The eager adoption of external trends. And high-velocity decision making." },
      { body: "There are many ways to center a business. You can be competitor focused, you can be product focused, you can be technology focused, you can be business model focused. In my view, obsessive customer focus is by far the most protective of Day 1 vitality." },
      { body: "A common example is process as proxy. Good process serves you so you can serve customers. But if you're not watchful, the process can become the thing." },
      { body: "Most decisions should probably be made with somewhere around 70% of the information you wish you had. If you wait for 90%, in most cases, you're probably being slow." },
      { body: "Use the phrase 'disagree and commit.' If you have conviction on a particular direction even though there's no consensus, it's helpful to say, 'Look, I know we disagree on this but will you gamble with me on it?'" },
    ],
  },

  // ── Ben Horowitz ──────────────────────────────────────────────────────
  {
    slug: "peacetime-ceo-wartime-ceo",
    title: "Peacetime CEO / Wartime CEO",
    creator: "ben-horowitz",
    source: "bhorowitz",
    medium: "essay",
    external_url: "https://bhorowitz.com/2011/04/14/peacetime-ceo-wartime-ceo/",
    thumbnail_position: "top",
    word_count: 2000,
    published_at: "2011-04-14",
    added_at: "2026-04-26T10:00:00Z",
    description:
      "Companies cycle between peacetime (defending market leadership) and wartime (fighting for survival). The CEO has to shift.",
    topics: ["leadership", "strategy", "competition", "founder-mode"],
    key_highlight: {
      body: "Peacetime CEO knows that proper protocol leads to winning. Wartime CEO violates protocol in order to win.",
    },
    highlights: [
      { body: "In peacetime, leaders must maximize and broaden the current opportunity. As a result, peacetime leaders employ techniques to encourage broad-based creativity and contribution across a diverse set of possible objectives." },
      { body: "In wartime, by contrast, the company typically has a single bullet in the chamber and must, at all costs, hit the target." },
      { body: "Peacetime CEO works to minimize conflict. Wartime CEO heightens the contradictions." },
      { body: "Peacetime CEO strives for broad based buy-in. Wartime CEO neither indulges consensus-building nor tolerates disagreements." },
      { body: "Most management books focus on peacetime techniques. Yet most successful companies are run as wartime companies during the periods when they're growing fastest." },
    ],
  },
  {
    slug: "the-struggle",
    title: "The Struggle",
    creator: "ben-horowitz",
    source: "bhorowitz",
    medium: "essay",
    external_url: "https://bhorowitz.com/2012/12/16/the-struggle/",
    word_count: 900,
    published_at: "2012-12-16",
    added_at: "2026-04-25T10:00:00Z",
    description:
      "Ben on the worst part of being a founder — the moment when you realize you might fail. And the reason to keep going.",
    topics: ["resilience", "founder-mode", "leadership"],
    key_highlight: {
      body: "The Struggle is when you wonder why you started the company in the first place. The Struggle is when people ask you why you don't quit and you don't know the answer.",
    },
    highlights: [
      { body: "The Struggle is when you don't believe you should be CEO of your company." },
      { body: "The Struggle is where greatness comes from." },
      { body: "Embrace your weirdness, your background, your instinct. If the keys are not in there, they do not exist." },
      { body: "Do not take it personally. The problem is not your problem. The problem is the company's problem." },
      { body: "Remember that this is what separates the women from the girls. If you want to be great, this is the choice." },
    ],
  },
  {
    slug: "a-good-place-to-work",
    title: "A Good Place to Work",
    creator: "ben-horowitz",
    source: "bhorowitz",
    medium: "essay",
    external_url: "https://bhorowitz.com/2011/08/15/a-good-place-to-work/",
    word_count: 1400,
    published_at: "2011-08-15",
    added_at: "2026-04-24T10:00:00Z",
    description:
      "Why making your company a good place to work isn't a soft luxury — it's the precondition for everything else.",
    topics: ["culture", "hiring", "leadership", "founder-mode"],
    key_highlight: {
      body: "The primary thing that any technology startup must do is build a product that's at least ten times better at doing something than the current prevailing way of doing that thing. The second thing is to make sure that the people who build the product enjoy doing it.",
    },
    highlights: [
      { body: "In good companies, people can focus on their work and have confidence that if they get their work done, good things will happen for both the company and them personally." },
      { body: "In bad companies, on the other hand, people spend much of their time fighting organizational boundaries, infighting, and broken processes." },
      { body: "When people in a good company come to work, the first thing they need to do is figure out how to make their work better. They are not figuring out how to navigate the politics or the broken systems." },
    ],
  },

  // ── Startup Archive YT ────────────────────────────────────────────────
  {
    slug: "bezos-customer-obsession",
    title: "Jeff Bezos on Customer Obsession",
    creator: "various-founders",
    source: "startup-archive-yt",
    medium: "video",
    external_url: "https://www.youtube.com/watch?v=O4MtQGRIIuA",
    duration_seconds: 312,
    published_at: "2018-04-12",
    added_at: "2026-04-23T10:00:00Z",
    description:
      "Bezos explains why being obsessed with the customer is the only sustainable competitive advantage.",
    topics: ["strategy", "competition", "leadership", "mission"],
    key_highlight: {
      body: "There are many ways to center a business. You can be competitor-focused, product-focused, technology-focused. We've always tried to be customer-focused, and the reason is that customers are always beautifully, wonderfully dissatisfied.",
      timestamp: 47,
    },
    highlights: [
      { body: "Even when they don't know what they want, they want better. Your desire to delight customers will drive you to invent on their behalf.", timestamp: 89 },
      { body: "If you're competitor-focused, you have to wait until there is a competitor doing something. Being customer-focused allows you to be more pioneering.", timestamp: 132 },
      { body: "The thing that drives me is innovation. The thing that I want to do is invent. And the best way to invent is to start with the customer.", timestamp: 178 },
    ],
  },
  {
    slug: "jobs-on-focus",
    title: "Steve Jobs on Focus",
    creator: "various-founders",
    source: "startup-archive-yt",
    medium: "video",
    external_url: "https://www.youtube.com/watch?v=H8eP99neOVs",
    duration_seconds: 184,
    published_at: "1997-09-01",
    added_at: "2026-04-22T10:00:00Z",
    description:
      "Jobs at his 1997 internal Apple meeting: 'Focusing is about saying no.'",
    topics: ["strategy", "founder-mode", "leadership", "decision-making"],
    key_highlight: {
      body: "People think focus means saying yes to the thing you've got to focus on. But that's not what it means at all. It means saying no to the hundred other good ideas that there are.",
      timestamp: 22,
    },
    highlights: [
      { body: "You have to pick carefully. I'm actually as proud of the things we haven't done as the things we have done.", timestamp: 51 },
      { body: "Innovation is saying no to a thousand things.", timestamp: 78 },
      { body: "You've got to be really clear about what's important to you and what isn't.", timestamp: 112 },
    ],
  },
  {
    slug: "musk-first-principles",
    title: "Elon Musk on First Principles Thinking",
    creator: "various-founders",
    source: "startup-archive-yt",
    medium: "video",
    external_url: "https://www.youtube.com/watch?v=NV3sBlRgzTI",
    duration_seconds: 246,
    published_at: "2013-02-15",
    added_at: "2026-04-21T10:00:00Z",
    description:
      "Musk explains how he uses first-principles reasoning to determine what's actually possible.",
    topics: ["mental-models", "decision-making", "strategy"],
    key_highlight: {
      body: "I think it's important to reason from first principles rather than by analogy. Boil things down to their fundamental truths, and reason up from there.",
      timestamp: 34,
    },
    highlights: [
      { body: "Most of the time we go through life reasoning by analogy. We're doing this because it's like something else that was done, or it's like what other people are doing.", timestamp: 67 },
      { body: "First principles is a physics way of looking at the world. You boil things down to the most fundamental truths and say, 'OK, what are we sure is true?' and then reason up from there.", timestamp: 103 },
      { body: "Somebody could say battery packs are really expensive. That's just the way they are. They cost $600 per kilowatt-hour. But what are the material constituents of the batteries? If we bought that on the London Metal Exchange, what would it cost? You'd find it's about $80 per kilowatt-hour.", timestamp: 158 },
    ],
  },
  {
    slug: "collison-stripe-early-days",
    title: "Patrick Collison on Stripe's Early Days",
    creator: "various-founders",
    source: "startup-archive-yt",
    medium: "video",
    external_url: "https://www.youtube.com/watch?v=collison-stripe",
    duration_seconds: 412,
    published_at: "2021-03-08",
    added_at: "2026-04-20T10:00:00Z",
    description:
      "Patrick on the unscalable work of acquiring Stripe's first 100 developers.",
    topics: ["product-market-fit", "growth", "founder-mode", "sales"],
    key_highlight: {
      body: "We would meet developers, walk them through the integration, and if they got stuck, we'd just sit down and write the code with them. There's no playbook that scales to a billion-dollar company that says 'sit down and code with your users' — but that's how the early product got good.",
      timestamp: 84,
    },
    highlights: [
      { body: "The first hundred developers were not acquired through any kind of growth strategy. They were acquired by reaching out, helping, listening, and shipping fixes within the same day.", timestamp: 142 },
      { body: "What we cared about was not how many users we had, but how delighted the few users we had were. That number is closer to a leading indicator than installs.", timestamp: 201 },
      { body: "If you can get 10 users to love your product enough to talk about it, you have something. If you have 10,000 users who are indifferent, you don't.", timestamp: 268 },
    ],
  },
]

// Build typed entities from raw input.

const HIGHLIGHT_IDS = new Map<string, string>()
const next = (resourceSlug: string, idx: number) => {
  const key = `${resourceSlug}-h${idx}`
  if (!HIGHLIGHT_IDS.has(key)) HIGHLIGHT_IDS.set(key, key)
  return HIGHLIGHT_IDS.get(key)!
}

const creatorBySlug = new Map(CREATORS.map((c) => [c.slug, c]))
const sourceBySlug = new Map(SOURCES.map((s) => [s.slug, s]))
const topicBySlug = new Map(TOPICS.map((t) => [t.slug, t]))

export const RESOURCES: Resource[] = RAW.map((r) => ({
  id: r.slug,
  slug: r.slug,
  title: r.title,
  creator_id: creatorBySlug.get(r.creator)!.id,
  source_id: sourceBySlug.get(r.source)!.id,
  medium: r.medium,
  external_url: r.external_url,
  external_id: null,
  thumbnail_url: r.thumbnail_url ?? null,
  thumbnail_position: r.thumbnail_position ?? null,
  duration_seconds: r.duration_seconds ?? null,
  word_count: r.word_count ?? null,
  published_at: r.published_at,
  added_at: r.added_at,
  description: r.description,
  status: "published",
  extraction_status: "done",
}))

export const HIGHLIGHTS: Highlight[] = RAW.flatMap((r) => {
  const base = [
    {
      id: next(r.slug, 0),
      resource_id: r.slug,
      body: r.key_highlight.body,
      is_key: true,
      rank: 0,
      context: r.key_highlight.context ?? null,
      timestamp_seconds: r.key_highlight.timestamp ?? null,
      created_at: r.added_at,
    } satisfies Highlight,
  ]
  const supporting = r.highlights.map(
    (h, i) =>
      ({
        id: next(r.slug, i + 1),
        resource_id: r.slug,
        body: h.body,
        is_key: false,
        rank: i + 1,
        context: h.context ?? null,
        timestamp_seconds: h.timestamp ?? null,
        created_at: r.added_at,
      }) satisfies Highlight
  )
  return [...base, ...supporting]
})

export const RESOURCE_TOPICS: Array<{
  resource_id: string
  topic_id: string
}> = RAW.flatMap((r) =>
  r.topics
    .filter((t) => topicBySlug.has(t))
    .map((t) => ({ resource_id: r.slug, topic_id: topicBySlug.get(t)!.id }))
)

// Collections ----------------------------------------------------------------

export const COLLECTIONS: Collection[] = [
  {
    id: "pre-launch-canon",
    slug: "pre-launch-canon",
    title: "The pre-launch canon",
    description:
      "Eight pieces every founder should read before opening signups. Idea, market, audience, and the messy work of getting your first users.",
    cover_image: null,
    status: "published",
    created_at: "2026-04-15T10:00:00Z",
  },
  {
    id: "founder-mode-reading-list",
    slug: "founder-mode-reading-list",
    title: "Founder Mode — the reading list",
    description:
      "Brian Chesky's 2024 essay started a conversation that's been brewing for decades. The deeper canon behind the meme.",
    cover_image: null,
    status: "published",
    created_at: "2026-04-12T10:00:00Z",
  },
  {
    id: "when-youre-stuck-on-ideas",
    slug: "when-youre-stuck-on-ideas",
    title: "When you're stuck on ideas",
    description:
      "Five resources to read when the next move isn't obvious. PG and Sam on how to find what to work on.",
    cover_image: null,
    status: "published",
    created_at: "2026-04-10T10:00:00Z",
  },
  {
    id: "operators-notebook",
    slug: "operators-notebook",
    title: "The operator's notebook",
    description:
      "Hiring, focus, customer obsession — six pieces on the daily craft of running the company once it's actually running.",
    cover_image: null,
    status: "published",
    created_at: "2026-04-08T10:00:00Z",
  },
]

const inCollection = (
  collectionId: string,
  ...slugs: string[]
): Array<{ collection_id: string; resource_id: string; rank: number; note: string | null }> =>
  slugs.map((s, i) => ({
    collection_id: collectionId,
    resource_id: s,
    rank: i,
    note: null,
  }))

export const COLLECTION_ITEMS = [
  ...inCollection(
    "pre-launch-canon",
    "how-to-get-startup-ideas",
    "do-things-that-dont-scale",
    "guide-to-startups-part-4",
    "how-to-start-a-startup",
    "collison-stripe-early-days",
    "startup-playbook",
    "1997-shareholder-letter"
  ),
  ...inCollection(
    "founder-mode-reading-list",
    "founder-mode",
    "dont-fuck-up-the-culture",
    "peacetime-ceo-wartime-ceo",
    "a-good-place-to-work",
    "the-struggle",
    "jobs-on-focus"
  ),
  ...inCollection(
    "when-youre-stuck-on-ideas",
    "how-to-get-startup-ideas",
    "do-things-that-dont-scale",
    "productivity",
    "advice",
    "specific-knowledge"
  ),
  ...inCollection(
    "operators-notebook",
    "how-to-hire-the-best-people",
    "bezos-customer-obsession",
    "2016-shareholder-letter",
    "makers-schedule-managers-schedule",
    "musk-first-principles",
    "how-to-be-successful"
  ),
]

// Daily highlights — backfilled for the next 60 days from a shuffled list of key highlights.

const keyHighlightIds = HIGHLIGHTS.filter((h) => h.is_key).map((h) => h.id)
const todayDate = (offset: number) => {
  const d = new Date("2026-05-21T00:00:00Z")
  d.setUTCDate(d.getUTCDate() + offset)
  return d.toISOString().slice(0, 10)
}

export const DAILY_HIGHLIGHTS = Array.from({ length: 60 }, (_, i) => ({
  date: todayDate(i),
  highlight_id: keyHighlightIds[i % keyHighlightIds.length],
  picked_by: "auto" as const,
}))

// Helper: get full ResourceDetail by slug

export function findResourceDetailBySlug(
  slug: string
): ResourceDetail | undefined {
  const resource = RESOURCES.find((r) => r.slug === slug)
  if (!resource) return undefined
  const creator = CREATORS.find((c) => c.id === resource.creator_id)!
  const source = SOURCES.find((s) => s.id === resource.source_id)!
  const topicIds = RESOURCE_TOPICS.filter((rt) => rt.resource_id === slug).map(
    (rt) => rt.topic_id
  )
  const topics = TOPICS.filter((t) => topicIds.includes(t.id))
  const highlights = HIGHLIGHTS.filter((h) => h.resource_id === slug).sort(
    (a, b) => a.rank - b.rank
  )
  const inCollections = COLLECTION_ITEMS.filter(
    (ci) => ci.resource_id === slug
  ).map((ci) => COLLECTIONS.find((c) => c.id === ci.collection_id)!)
  return {
    ...resource,
    creator,
    source,
    topics,
    highlights,
    collections: inCollections,
  }
}

export function buildCollectionWithItems(
  slug: string
): CollectionWithItems | undefined {
  const collection = COLLECTIONS.find((c) => c.slug === slug)
  if (!collection) return undefined
  const items = COLLECTION_ITEMS.filter((ci) => ci.collection_id === collection.id)
    .sort((a, b) => a.rank - b.rank)
    .map((ci) => {
      const detail = findResourceDetailBySlug(ci.resource_id)!
      return {
        resource: {
          ...detail,
          highlights: undefined as never,
          collections: undefined as never,
        } as never,
        rank: ci.rank,
        note: ci.note,
      }
    })
    .filter((item) => item.resource)
  return { ...collection, items }
}

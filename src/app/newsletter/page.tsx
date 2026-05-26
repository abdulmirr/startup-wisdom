import { PageShell } from "@/components/page-shell"
import { SubscribeForm } from "@/components/subscribe-form"

export const metadata = {
  title: "Newsletter",
  description:
    "Get one timeless founder essay, talk, or interview in your inbox every week day.",
}

export default function NewsletterPage() {
  return (
    <PageShell
      eyebrow="Newsletter"
      title="One remarkable resource. Every day."
      description="Get a single founder essay, talk, or interview — plus its key highlights — sent straight to your inbox."
      align="center"
    >
      <SubscribeForm
        id="newsletter-page-email"
        medium="landing"
        className="mx-auto max-w-md"
      />
      <ul className="mx-auto mt-14 grid max-w-2xl gap-6 text-left sm:grid-cols-3">
        <li>
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-brand">
            Hand-picked
          </p>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
            One resource per day, chosen for what still teaches years later.
          </p>
        </li>
        <li>
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-brand">
            Plus highlights
          </p>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
            The lines worth remembering, pulled out so you don&apos;t have to.
          </p>
        </li>
        <li>
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-brand">
            Week days only
          </p>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
            Five issues a week. No filler, no weekends, unsubscribe anytime.
          </p>
        </li>
      </ul>
    </PageShell>
  )
}

import { PageShell } from "@/components/page-shell"

export const metadata = { title: "About" }

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="A library, not a feed."
      description="The internet has plenty of feeds. This is a library — curated, slow-moving, designed to be revisited."
    >
      <div className="max-w-2xl space-y-6 text-base leading-relaxed text-ink-muted sm:text-lg">
        <p>
          Every entry in the archive was written, recorded, or said by someone
          who actually built something — Paul Graham, Marc Andreessen, Sam
          Altman, Patrick Collison, Brian Chesky, Jeff Bezos, Ben Horowitz,
          Naval Ravikant, and the founders interviewed on Startup Archive.
        </p>
        <p>
          Each resource is read end-to-end and distilled into a single key
          highlight plus eight to twelve supporting ones. The original source is
          always one click away.
        </p>
        <p>
          The archive is hand-curated, not firehose-scraped. ~100 pieces of
          canonical founder writing, chosen because they hold up.
        </p>
        <p className="border-t border-line pt-6 text-sm text-ink-soft">
          Built by{" "}
          <a
            href="https://x.com/builtbyabdul"
            className="font-medium text-brand underline-offset-4 hover:underline"
          >
            @builtbyabdul
          </a>
          . Credit to the original authors — links lead back to the source on
          every page.
        </p>
      </div>
    </PageShell>
  )
}

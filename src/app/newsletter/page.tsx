import { ComingSoon, PageShell } from "@/components/page-shell"

export const metadata = { title: "Newsletter" }

export default function NewsletterPage() {
  return (
    <PageShell
      eyebrow="Newsletter"
      title="One remarkable resource. Every day."
      description="Get a single founder essay, talk, or interview — plus its key highlights — sent straight to your inbox."
    >
      <ComingSoon milestone="M15" />
    </PageShell>
  )
}

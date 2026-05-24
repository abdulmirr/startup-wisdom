import { ComingSoon, PageShell } from "@/components/page-shell"

export const metadata = { title: "Ask" }

export default function AskPage() {
  return (
    <PageShell
      eyebrow="Ask the archive"
      title="What do the greats say about &hellip;?"
      description="A chat interface backed by the entire archive. Ask a founder question, get a synthesized answer with citations from the actual sources."
    >
      <ComingSoon
        milestone="M18"
        hint="The capstone feature — added last, after the rest of the site is polished."
      />
    </PageShell>
  )
}

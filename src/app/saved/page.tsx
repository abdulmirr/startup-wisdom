import { PageShell } from "@/components/page-shell"

import { SavedView } from "./SavedView"

export const metadata = { title: "Saved" }

export default function SavedPage() {
  return (
    <PageShell
      eyebrow="Saved"
      title="Your saves."
      description="Resources and highlights you bookmarked. Stored on this device — no account needed."
    >
      <SavedView />
    </PageShell>
  )
}

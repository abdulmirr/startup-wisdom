import { redirect } from "next/navigation"

export const metadata = { title: "Collections" }

export default function CollectionsPage() {
  redirect("/#collections")
}

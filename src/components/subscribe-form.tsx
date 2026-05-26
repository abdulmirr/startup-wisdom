"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

type Medium = "hero" | "callout" | "exit_intent" | "landing"

interface SubscribeFormProps {
  id: string
  medium: Medium
  className?: string
  surface?: "muted" | "raised"
}

const SUCCESS_MESSAGE =
  "You're in! Check your inbox — your first issue is on the way."

export function SubscribeForm({
  id,
  medium,
  className,
  surface = "muted",
}: SubscribeFormProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === "submitting" || status === "success") return
    setStatus("submitting")
    setError(null)
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, medium }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(data?.error ?? "Something went wrong. Please try again.")
      }
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  if (status === "success") {
    return (
      <p
        role="status"
        className={cn(
          "rounded-lg px-4 py-3 text-center text-[0.9375rem] leading-relaxed text-ink",
          surface === "muted" ? "bg-surface-2" : "bg-surface-3",
          className
        )}
      >
        {SUCCESS_MESSAGE}
      </p>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={onSubmit}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-lg p-1.5",
          surface === "muted" ? "bg-surface-2" : "bg-surface-3"
        )}
      >
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          type="email"
          name="email"
          placeholder="name@email.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
          className="flex-1 bg-transparent px-3 py-1.5 text-[0.9375rem] text-ink placeholder:text-ink-soft focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-md bg-brand px-4 py-2 text-[0.9375rem] font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "submitting" ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {error && (
        <p
          role="alert"
          className="mt-2 px-1 text-left text-[0.8125rem] text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  )
}

interface SubscribeCalloutProps {
  id: string
  className?: string
}

export function SubscribeCallout({ id, className }: SubscribeCalloutProps) {
  return (
    <section
      className={cn(
        "border-t border-line py-14 text-center sm:py-16",
        className
      )}
    >
      <h2 className="mx-auto max-w-xl font-serif text-[1.625rem] font-semibold leading-[1.15] tracking-tight text-ink sm:text-[2rem]">
        Discover the greatest founder wisdom on the internet.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted sm:text-base">
        Subscribe to get one timeless startup resource in your inbox every week
        day.
      </p>
      <SubscribeForm
        id={id}
        medium="callout"
        className="mx-auto mt-7 max-w-md"
      />
    </section>
  )
}

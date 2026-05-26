"use client"

import { useEffect, useState } from "react"

import { SubscribeForm } from "@/components/subscribe-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const STORAGE_KEY = "exit-intent-modal:shown"

function alreadyShown(): boolean {
  if (typeof window === "undefined") return true
  return window.sessionStorage.getItem(STORAGE_KEY) === "1"
}

function markShown() {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(STORAGE_KEY, "1")
}

export function ExitIntentModal() {
  const [open, setOpen] = useState(false)
  const [armed, setArmed] = useState(false)

  // Arm after a short delay so we don't fire on instant cursor movements
  // right after page load (e.g. the user lands and immediately switches tabs).
  useEffect(() => {
    if (alreadyShown()) return
    // Only desktop has a real "exit intent" via mouseleave to the top.
    if (window.matchMedia("(hover: none)").matches) return
    const t = window.setTimeout(() => setArmed(true), 4000)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!armed) return
    function onLeave(e: MouseEvent) {
      if (e.clientY > 0) return
      if (e.relatedTarget) return
      setOpen(true)
      markShown()
      setArmed(false)
    }
    document.documentElement.addEventListener("mouseleave", onLeave)
    return () =>
      document.documentElement.removeEventListener("mouseleave", onLeave)
  }, [armed])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg sm:p-8">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="font-serif text-[1.5rem] leading-[1.15] tracking-tight text-ink sm:text-[1.875rem]">
            Discover the greatest founder wisdom on the internet.
          </DialogTitle>
          <DialogDescription className="mx-auto mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-ink-muted">
            Subscribe to get one timeless startup resource in your inbox every
            week day.
          </DialogDescription>
        </DialogHeader>
        <SubscribeForm
          id="exit-intent-email"
          medium="exit_intent"
          surface="raised"
          className="mt-2"
        />
      </DialogContent>
    </Dialog>
  )
}

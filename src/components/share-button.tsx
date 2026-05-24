"use client"

import { useState } from "react"
import { Check, Link2, Share2 } from "lucide-react"
import { toast } from "sonner"

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2H21.5l-7.5 8.567L22.96 22h-6.83l-5.347-6.99L4.7 22H1.44l8.022-9.166L1.04 2h6.998l4.832 6.39L18.244 2Zm-1.196 18h1.886L7.04 4H5.063l11.985 16Z" />
    </svg>
  )
}

import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  quote: string
  attribution: string
  permalinkPath: string
  className?: string
  variant?: "default" | "compact" | "xs"
}

export function ShareButton({
  quote,
  attribution,
  permalinkPath,
  className,
  variant = "default",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  function makeUrl() {
    if (typeof window === "undefined") return permalinkPath
    return new URL(permalinkPath, window.location.origin).toString()
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(makeUrl())
      setCopied(true)
      toast.success("Link copied")
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Couldn't copy")
    }
  }

  async function copyQuote() {
    const text = `"${quote}"\n\n${attribution}\n${makeUrl()}`
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Quote copied")
    } catch {
      toast.error("Couldn't copy")
    }
  }

  function tweet() {
    const tweetText = `"${truncate(quote, 200)}"\n\n${attribution}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&url=${encodeURIComponent(makeUrl())}`
    window.open(url, "_blank", "noopener,width=600,height=600")
  }

  const triggerSize =
    variant === "xs" ? "xs" : variant === "compact" ? "sm" : "default"
  const iconSize = variant === "xs" ? "size-3" : "size-3.5"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({
            variant: "outline",
            size: triggerSize,
          }),
          "gap-1.5",
          className
        )}
      >
        {copied ? (
          <Check className={iconSize} />
        ) : (
          <Share2 className={iconSize} />
        )}
        Share
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={tweet}>
          <XLogo className="mr-2 size-4" />
          Post on X
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={copyQuote}>
          <Check className="mr-2 size-4 opacity-0" />
          Copy quote
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={copyLink}>
          <Link2 className="mr-2 size-4" />
          Copy link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s
  return s.slice(0, n - 1).trimEnd() + "…"
}

"use client"

import { Bookmark, BookmarkCheck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useBookmarks } from "@/lib/bookmarks"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  type: "resource" | "highlight"
  id: string
  className?: string
  size?: "sm" | "md"
}

export function BookmarkButton({
  type,
  id,
  className,
  size = "md",
}: BookmarkButtonProps) {
  const {
    isResourceSaved,
    isHighlightSaved,
    toggleResource,
    toggleHighlight,
  } = useBookmarks()
  const saved =
    type === "resource" ? isResourceSaved(id) : isHighlightSaved(id)

  function handleClick() {
    if (type === "resource") toggleResource(id)
    else toggleHighlight(id)
    toast(saved ? "Removed from saved" : "Saved", { duration: 1500 })
  }

  const Icon = saved ? BookmarkCheck : Bookmark

  return (
    <Button
      variant={saved ? "secondary" : "outline"}
      size={size === "sm" ? "sm" : "default"}
      onClick={handleClick}
      aria-label={saved ? "Remove bookmark" : "Save"}
      className={cn("gap-1.5", className)}
    >
      <Icon className={cn(size === "sm" ? "size-3.5" : "size-4")} />
      {saved ? "Saved" : "Save"}
    </Button>
  )
}

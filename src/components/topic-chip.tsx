import Link from "next/link"

import { cn } from "@/lib/utils"
import type { Topic } from "@/lib/types"

interface TopicChipProps {
  topic: Topic
  className?: string
}

export function TopicChip({ topic, className }: TopicChipProps) {
  return (
    <Link
      href={`/topics/${topic.slug}`}
      className={cn(
        "inline-flex items-center rounded-sm border border-line bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-muted transition-colors hover:border-brand hover:bg-brand hover:text-brand-ink",
        className
      )}
    >
      {topic.name}
    </Link>
  )
}

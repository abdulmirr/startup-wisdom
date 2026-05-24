"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  LayoutGrid,
  List,
  RotateCcw,
  Shuffle,
  SlidersHorizontal,
} from "lucide-react"
import {
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Creator, ResourceMedium, Topic } from "@/lib/types"
import { mediumLabel } from "@/lib/format"
import { SHUFFLE_EVENT } from "./resource-grid"

const MEDIA: ResourceMedium[] = ["essay", "video", "podcast", "lecture", "letter"]
const READING_TIMES = ["any", "short", "medium", "long"] as const
const SORTS = ["added_desc", "published_desc"] as const

const readingTimeLabels: Record<(typeof READING_TIMES)[number], string> = {
  any: "Any length",
  short: "≤ 5 min",
  medium: "≤ 15 min",
  long: "Long reads",
}

const sortLabels: Record<(typeof SORTS)[number], string> = {
  added_desc: "Newly added",
  published_desc: "Newest published",
}

interface FilterBarProps {
  creators: Creator[]
  topics: Topic[]
}

const CHIP_CLASS =
  "h-8 rounded-full border-line bg-surface-2 px-3 text-xs font-medium text-ink-muted shadow-none hover:bg-surface-3 hover:text-ink data-[state=open]:bg-surface-3 data-[state=open]:text-ink"
const CHIP_ACTIVE_CLASS = "border-line-strong text-ink"

export function FilterBar({ creators, topics }: FilterBarProps) {
  const searchParams = useSearchParams()

  const [creator, setCreator] = useQueryState("creator", parseAsString)
  const [topic, setTopic] = useQueryState("topic", parseAsString)
  const [medium, setMedium] = useQueryState(
    "medium",
    parseAsStringEnum([...MEDIA])
  )
  const [readingTime, setReadingTime] = useQueryState(
    "reading_time",
    parseAsStringEnum([...READING_TIMES]).withDefault("any")
  )
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringEnum([...SORTS]).withDefault("added_desc")
  )

  const active =
    Boolean(creator) ||
    Boolean(topic) ||
    Boolean(medium) ||
    readingTime !== "any" ||
    sort !== "added_desc"

  const [open, setOpen] = useState(() => {
    const rt = searchParams.get("reading_time")
    const s = searchParams.get("sort")
    return (
      searchParams.get("creator") !== null ||
      searchParams.get("topic") !== null ||
      searchParams.get("medium") !== null ||
      (rt !== null && rt !== "any") ||
      (s !== null && s !== "added_desc")
    )
  })

  function clearAll() {
    setCreator(null)
    setTopic(null)
    setMedium(null)
    setReadingTime("any")
    setSort("added_desc")
  }

  function shuffle() {
    // Client-side reshuffle of the currently visible grid. No URL change,
    // no server round-trip — feels instant.
    window.dispatchEvent(new Event(SHUFFLE_EVENT))
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="filter-chip-row"
            className="gap-2"
          >
            <SlidersHorizontal className="size-3.5" />
            Filters
          </Button>
          {active && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={clearAll}
              aria-label="Reset filters"
              title="Reset filters"
              className="text-ink-muted"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={shuffle}
            aria-label="Shuffle"
            title="Shuffle"
            className="text-ink-muted"
          >
            <Shuffle className="size-3.5" />
          </Button>
          <ViewToggle />
        </div>
      </div>

      {open && (
        <div
          id="filter-chip-row"
          className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3"
        >
          <Select
            value={creator ?? "all"}
            onValueChange={(v) => setCreator(v === "all" ? null : v)}
          >
            <SelectTrigger
              size="sm"
              className={cn(CHIP_CLASS, creator && CHIP_ACTIVE_CLASS)}
            >
              <SelectValue placeholder="Creator">
                {creator
                  ? creators.find((c) => c.slug === creator)?.name ?? "Creator"
                  : "Creator"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All creators</SelectItem>
              {creators.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={topic ?? "all"}
            onValueChange={(v) => setTopic(v === "all" ? null : v)}
          >
            <SelectTrigger
              size="sm"
              className={cn(CHIP_CLASS, topic && CHIP_ACTIVE_CLASS)}
            >
              <SelectValue placeholder="Topic">
                {topic
                  ? topics.find((t) => t.slug === topic)?.name ?? "Topic"
                  : "Topic"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All topics</SelectItem>
              {topics.map((t) => (
                <SelectItem key={t.id} value={t.slug}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={medium ?? "all"}
            onValueChange={(v) =>
              setMedium(v === "all" ? null : (v as ResourceMedium))
            }
          >
            <SelectTrigger
              size="sm"
              className={cn(CHIP_CLASS, medium && CHIP_ACTIVE_CLASS)}
            >
              <SelectValue placeholder="Medium">
                {medium ? mediumLabel(medium) : "Medium"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All media</SelectItem>
              {MEDIA.map((m) => (
                <SelectItem key={m} value={m}>
                  {mediumLabel(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={readingTime}
            onValueChange={(v) =>
              setReadingTime(v as (typeof READING_TIMES)[number])
            }
          >
            <SelectTrigger
              size="sm"
              className={cn(
                CHIP_CLASS,
                readingTime !== "any" && CHIP_ACTIVE_CLASS
              )}
            >
              <SelectValue>
                {readingTime === "any" ? "Time" : readingTimeLabels[readingTime]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {READING_TIMES.map((rt) => (
                <SelectItem key={rt} value={rt}>
                  {readingTimeLabels[rt]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(v) => setSort(v as (typeof SORTS)[number])}
          >
            <SelectTrigger
              size="sm"
              className={cn(
                CHIP_CLASS,
                sort !== "added_desc" && CHIP_ACTIVE_CLASS
              )}
            >
              <SelectValue>{sortLabels[sort]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {sortLabels[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

function ViewToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get("view") === "list" ? "list" : "grid"

  function setView(next: "grid" | "list") {
    const qs = new URLSearchParams(searchParams.toString())
    if (next === "grid") qs.delete("view")
    else qs.set("view", "list")
    const q = qs.toString()
    router.replace(q ? `?${q}` : "?", { scroll: false })
  }

  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-line bg-surface-2 p-0.5">
      <button
        type="button"
        onClick={() => setView("list")}
        aria-pressed={view === "list"}
        aria-label="List view"
        title="List view"
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-[5px] text-ink-muted transition-colors hover:text-ink",
          view === "list" && "bg-surface-3 text-ink"
        )}
      >
        <List className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setView("grid")}
        aria-pressed={view === "grid"}
        aria-label="Grid view"
        title="Grid view"
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-[5px] text-ink-muted transition-colors hover:text-ink",
          view === "grid" && "bg-surface-3 text-ink"
        )}
      >
        <LayoutGrid className="size-3.5" />
      </button>
    </div>
  )
}

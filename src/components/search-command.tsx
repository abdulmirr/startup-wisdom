"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  BookText,
  Search,
  Tag,
  User,
  type LucideIcon,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import type { SearchResult } from "@/app/api/search/route"

const ICONS: Record<SearchResult["kind"], LucideIcon> = {
  resource: BookText,
  creator: User,
  topic: Tag,
}

const GROUP_LABEL: Record<SearchResult["kind"], string> = {
  resource: "Resources",
  creator: "Creators",
  topic: "Topics",
}

export function SearchCommand() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === "/" && !open) {
        if (
          e.target instanceof HTMLElement &&
          (e.target.tagName === "INPUT" ||
            e.target.tagName === "TEXTAREA" ||
            e.target.isContentEditable)
        ) {
          return
        }
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  useEffect(() => {
    let cancelled = false
    if (!query.trim()) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const json = (await res.json()) as { results: SearchResult[] }
        if (!cancelled) setResults(json.results)
      } catch {
        if (!cancelled) setResults([])
      }
    }, 80)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query])

  function go(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  const groups: Array<{
    kind: SearchResult["kind"]
    items: SearchResult[]
  }> = (["resource", "creator", "topic"] as const)
    .map((kind) => ({
      kind,
      items: results.filter((r) => r.kind === kind),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-64 items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-md border border-line bg-surface-2 pl-3 pr-1.5 text-sm text-ink-soft shadow-xs transition-all hover:border-line-strong hover:bg-surface-3 md:inline-flex"
        aria-label="Search"
      >
        <Search className="size-4 shrink-0 text-ink-soft" />
        <span className="flex-1 truncate text-left">Search the archive…</span>
        <kbd className="shrink-0 rounded border border-line bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-muted">
          ⌘K
        </kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink md:hidden"
        aria-label="Search"
      >
        <Search className="size-4" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Search archive">
        <CommandInput
          placeholder="Search resources, creators, topics…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {query.trim()
              ? "Nothing found."
              : "Type to search the archive."}
          </CommandEmpty>
          {groups.map((g) => (
            <CommandGroup key={g.kind} heading={GROUP_LABEL[g.kind]}>
              {g.items.map((r) => {
                const Icon = ICONS[r.kind]
                return (
                  <CommandItem
                    key={r.href}
                    value={`${r.title} ${r.subtitle ?? ""}`}
                    onSelect={() => go(r.href)}
                  >
                    <Icon className="mr-1 size-4 text-ink-soft" />
                    <div className="flex flex-col">
                      <span>{r.title}</span>
                      {r.subtitle && (
                        <span className="text-xs text-ink-soft">
                          {r.subtitle}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}

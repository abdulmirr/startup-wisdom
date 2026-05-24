"use client"

import { useCallback, useSyncExternalStore } from "react"

const KEY = "archive:bookmarks:v1"
const EVENT = "archive:bookmarks-change"

export interface Bookmarks {
  resources: string[]
  highlights: string[]
}

const EMPTY: Bookmarks = { resources: [], highlights: [] }

function safeRead(): Bookmarks {
  if (typeof window === "undefined") return EMPTY
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<Bookmarks>
    return {
      resources: Array.isArray(parsed.resources) ? parsed.resources : [],
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
    }
  } catch {
    return EMPTY
  }
}

function safeWrite(bookmarks: Bookmarks) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(bookmarks))
    window.dispatchEvent(new CustomEvent(EVENT))
  } catch {
    // localStorage unavailable — silently degrade
  }
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {}
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb()
  }
  const onCustom = () => cb()
  window.addEventListener("storage", onStorage)
  window.addEventListener(EVENT, onCustom)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(EVENT, onCustom)
  }
}

function getSnapshot(): string {
  if (typeof window === "undefined") return ""
  return window.localStorage.getItem(KEY) ?? ""
}

function getServerSnapshot(): string {
  return ""
}

export function useBookmarks() {
  // useSyncExternalStore subscribes to a stable string snapshot; we parse it.
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const bookmarks: Bookmarks = snapshot
    ? (() => {
        try {
          const parsed = JSON.parse(snapshot) as Partial<Bookmarks>
          return {
            resources: Array.isArray(parsed.resources) ? parsed.resources : [],
            highlights: Array.isArray(parsed.highlights)
              ? parsed.highlights
              : [],
          }
        } catch {
          return EMPTY
        }
      })()
    : EMPTY

  const toggleResource = useCallback((id: string) => {
    const current = safeRead()
    const next = current.resources.includes(id)
      ? {
          ...current,
          resources: current.resources.filter((x) => x !== id),
        }
      : { ...current, resources: [...current.resources, id] }
    safeWrite(next)
  }, [])

  const toggleHighlight = useCallback((id: string) => {
    const current = safeRead()
    const next = current.highlights.includes(id)
      ? {
          ...current,
          highlights: current.highlights.filter((x) => x !== id),
        }
      : { ...current, highlights: [...current.highlights, id] }
    safeWrite(next)
  }, [])

  const isResourceSaved = useCallback(
    (id: string) => bookmarks.resources.includes(id),
    [bookmarks.resources]
  )

  const isHighlightSaved = useCallback(
    (id: string) => bookmarks.highlights.includes(id),
    [bookmarks.highlights]
  )

  return {
    bookmarks,
    toggleResource,
    toggleHighlight,
    isResourceSaved,
    isHighlightSaved,
  }
}

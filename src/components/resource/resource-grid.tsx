"use client"

import { useEffect, useState } from "react"

import type { ResourceWithRelations } from "@/lib/types"

import { ResourceCard } from "./resource-card"

interface ResourceGridProps {
  resources: ResourceWithRelations[]
}

export const SHUFFLE_EVENT = "resources:shuffle"

function fisherYates<T>(list: readonly T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function ResourceGrid({ resources }: ResourceGridProps) {
  const [displayed, setDisplayed] = useState(resources)

  // Server-provided list can change when filters update — keep in sync.
  useEffect(() => {
    setDisplayed(resources)
  }, [resources])

  useEffect(() => {
    function onShuffle() {
      setDisplayed((current) => fisherYates(current))
    }
    window.addEventListener(SHUFFLE_EVENT, onShuffle)
    return () => window.removeEventListener(SHUFFLE_EVENT, onShuffle)
  }, [])

  if (displayed.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface-2 px-6 py-16 text-center">
        <p className="font-serif text-xl font-semibold text-ink">
          Nothing matches those filters.
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Try clearing some filters or removing the search term.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {displayed.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  )
}

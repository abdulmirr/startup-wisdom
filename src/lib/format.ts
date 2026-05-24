import type { ResourceMedium } from "./types"

export function formatDuration(seconds: number | null): string | null {
  if (seconds == null) return null
  if (seconds < 60) return `${seconds}s`
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  const remMin = mins % 60
  return remMin ? `${hours}h ${remMin}m` : `${hours}h`
}

export function formatReadingTime(
  durationSeconds: number | null,
  wordCount: number | null
): string | null {
  if (durationSeconds != null) return formatDuration(durationSeconds)
  if (wordCount != null) {
    const mins = Math.max(1, Math.round(wordCount / 225))
    return `${mins} min read`
  }
  return null
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

export function formatPublishedDate(iso: string | null): string | null {
  if (!iso) return null
  const [yearStr, monthStr] = iso.split("-")
  const month = parseInt(monthStr, 10)
  if (!month || !MONTHS[month - 1]) return yearStr
  return `${MONTHS[month - 1]} ${yearStr}`
}

export function formatTimestamp(seconds: number | null): string | null {
  if (seconds == null) return null
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function mediumLabel(medium: ResourceMedium): string {
  switch (medium) {
    case "essay":
      return "Essay"
    case "video":
      return "Video"
    case "podcast":
      return "Podcast"
    case "lecture":
      return "Lecture"
    case "letter":
      return "Letter"
  }
}

/**
 * Verb to use on "open original" CTAs ("Watch on YouTube", "Listen on …").
 * Falls back to "Read" for text mediums.
 */
export function mediumVerb(medium: ResourceMedium): string {
  switch (medium) {
    case "video":
      return "Watch"
    case "podcast":
      return "Listen"
    case "lecture":
      return "Watch"
    case "essay":
    case "letter":
      return "Read"
  }
}


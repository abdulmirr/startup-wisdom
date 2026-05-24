import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ThumbnailPosition } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function thumbnailPositionClass(
  position: ThumbnailPosition | null | undefined
): string | undefined {
  switch (position) {
    case "top":
      return "object-top"
    case "bottom":
      return "object-bottom"
    case "left":
      return "object-left"
    case "right":
      return "object-right"
    default:
      return undefined
  }
}

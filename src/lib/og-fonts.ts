import { readFile } from "node:fs/promises"
import { join } from "node:path"

let cached: {
  fonts: Array<{
    name: string
    data: ArrayBuffer
    style: "normal"
    weight: 400 | 500
  }>
} | null = null

async function readTtf(relPath: string): Promise<ArrayBuffer> {
  const buf = await readFile(join(process.cwd(), relPath))
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength
  ) as ArrayBuffer
}

export async function loadOgFonts() {
  if (cached) return cached
  const [regular, medium] = await Promise.all([
    readTtf("assets/fonts/IBMPlexSerif-Regular.ttf"),
    readTtf("assets/fonts/IBMPlexSerif-Medium.ttf"),
  ])
  cached = {
    fonts: [
      { name: "Serif", data: regular, style: "normal", weight: 400 },
      { name: "Serif", data: medium, style: "normal", weight: 500 },
    ],
  }
  return cached
}

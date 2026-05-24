import PQueue from "p-queue"

const queue = new PQueue({ concurrency: 2, interval: 1000, intervalCap: 4 })

interface FetchOpts {
  retries?: number
  backoffMs?: number
  headers?: Record<string, string>
}

export async function fetchHtml(
  url: string,
  opts: FetchOpts = {}
): Promise<string> {
  const { retries = 3, backoffMs = 800, headers } = opts
  return queue.add(
    async () => {
      let attempt = 0
      let lastErr: unknown
      while (attempt <= retries) {
        try {
          const res = await fetch(url, {
            method: "GET",
            redirect: "follow",
            headers: {
              "User-Agent":
                "archive-scraper/0.1 (+https://archive.example) AppleWebKit/537.36",
              Accept: "text/html,application/xhtml+xml",
              ...headers,
            },
          })
          if (res.ok) {
            return await res.text()
          }
          if (res.status === 429 || res.status >= 500) {
            lastErr = new Error(`HTTP ${res.status}`)
          } else {
            throw new Error(`HTTP ${res.status} for ${url}`)
          }
        } catch (err) {
          lastErr = err
        }
        attempt++
        await new Promise((r) =>
          setTimeout(r, backoffMs * Math.pow(2, attempt - 1))
        )
      }
      throw lastErr instanceof Error
        ? lastErr
        : new Error(`Failed to fetch ${url}`)
    }
  ) as Promise<string>
}

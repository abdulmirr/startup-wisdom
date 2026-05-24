"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { SearchCommand } from "@/components/search-command"
import { ThemeToggle } from "@/components/theme-toggle"

const links = [
  { href: "/database", label: "Database" },
  { href: "/collections", label: "Collections" },
  { href: "/highlights", label: "Highlights" },
  { href: "/newsletter", label: "Newsletter" },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-surface-1/95 supports-backdrop-filter:bg-surface-1/80 supports-backdrop-filter:backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          aria-label="Startup Wisdom — home"
          className="group flex items-center"
        >
          <span
            role="img"
            aria-label="Startup Wisdom"
            className="block aspect-[2158/376] h-5 bg-brand transition-opacity group-hover:opacity-80 [mask-image:url('/Startup%20Wisdom.png')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] dark:bg-ink sm:h-[1.625rem]"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-1 text-sm transition-colors",
                  active
                    ? "font-medium text-ink"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                {link.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-brand"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <SearchCommand />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

import { cn } from "@/lib/utils"

interface SubscribeFormProps {
  id: string
  className?: string
  surface?: "muted" | "raised"
}

export function SubscribeForm({
  id,
  className,
  surface = "muted",
}: SubscribeFormProps) {
  return (
    <form
      action="/newsletter"
      className={cn(
        "flex w-full items-center gap-1.5 rounded-lg p-1.5",
        surface === "muted" ? "bg-surface-2" : "bg-surface-3",
        className
      )}
    >
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input
        id={id}
        type="email"
        name="email"
        placeholder="name@email.com"
        autoComplete="off"
        required
        className="flex-1 bg-transparent px-3 py-1.5 text-[0.9375rem] text-ink placeholder:text-ink-soft focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md bg-brand px-4 py-2 text-[0.9375rem] font-medium text-brand-ink transition-opacity hover:opacity-90"
      >
        Subscribe
      </button>
    </form>
  )
}

interface SubscribeCalloutProps {
  id: string
  className?: string
}

export function SubscribeCallout({ id, className }: SubscribeCalloutProps) {
  return (
    <section
      className={cn(
        "border-t border-line py-14 text-center sm:py-16",
        className
      )}
    >
      <h2 className="mx-auto max-w-xl font-serif text-[1.625rem] font-semibold leading-[1.15] tracking-tight text-ink sm:text-[2rem]">
        Discover the greatest founder wisdom on the internet.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted sm:text-base">
        Subscribe to get one timeless startup resource in your inbox every week
        day.
      </p>
      <SubscribeForm id={id} className="mx-auto mt-7 max-w-md" />
    </section>
  )
}

import Link from "next/link";

/**
 * Where to go next. Hairline rows, two across.
 *
 * The service pages already ended on a block exactly like this — two
 * adjacent pillars, name at the inline start, ratio at the end. The
 * three About pages ended on nothing at all, which is the same
 * dead-end the section heads were built to fix one level up: a reader
 * who finishes the team page has no way to reach the crew films
 * except the menu.
 *
 * So it is one component now rather than the pillar page's private
 * pattern copied twice more. The `meta` slot is whatever that route's
 * own notation is — a ratio for a format, a count for a page.
 */
export interface NextUpProps {
  items: { href: string; label: string; meta?: string }[];
}

export function NextUp({ items }: NextUpProps) {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group u-rise flex items-baseline justify-between gap-6 border-t border-hairline pt-5 transition-colors duration-500 hover:border-fraise"
        >
          <span className="u-display text-subtitle font-semibold">
            {item.label}
          </span>
          {item.meta && (
            <span
              lang="en"
              dir="ltr"
              className="u-caps shrink-0 font-mono text-label text-bone-faint transition-colors duration-300 group-hover:text-bone"
            >
              {item.meta}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

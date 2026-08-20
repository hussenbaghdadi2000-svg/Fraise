import Link from "next/link";
import { COPY } from "@/content/copy";
import { routePath } from "@/lib/routes";
import type { Locale, Pillar } from "@/types/content";

/**
 * The filter rail. A SERVER Component — it ships no JavaScript.
 *
 * Every filter is a <Link>, not a click handler, because the filtered
 * view is already URL state: /work/?service=reels is shareable, it
 * survives a refresh, the back button works, and a crawler can follow
 * it. Holding the same thing in React state would cost client JS to
 * rebuild something the URL already expresses.
 *
 * The trade is a server round-trip per click, roughly 150–300ms. On a
 * page whose cards are video, that is invisible.
 *
 * The active filter is the ONE place a colour accent is allowed in a
 * control — it is interactive state, which is exactly what the accent
 * is reserved for.
 */
export interface FilterRailProps {
  locale: Locale;
  /** undefined = "All". */
  active?: Pillar;
  pillars: readonly Pillar[];
  counts: Record<Pillar, number>;
  total: number;
}

export function FilterRail({
  locale,
  active,
  pillars,
  counts,
  total,
}: FilterRailProps) {
  const copy = COPY[locale];
  const base = routePath({ kind: "work" }, locale);

  return (
    <nav className="flex flex-wrap items-baseline gap-x-6 gap-y-3 sm:gap-x-9">
      <FilterLink href={base} label={copy.work.all} count={total} on={!active} />
      {pillars.map((pillar) => (
        <FilterLink
          key={pillar}
          /* No `?show=` carried over: changing the filter changes the
             list, so a count from the previous list is meaningless. */
          href={`${base}?service=${pillar}`}
          label={copy.home.pillar[pillar]}
          count={counts[pillar]}
          on={active === pillar}
        />
      ))}
    </nav>
  );
}

function FilterLink({
  href,
  label,
  count,
  on,
}: {
  href: string;
  label: string;
  count: number;
  on: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={on ? "page" : undefined}
      className={`u-caps flex items-baseline gap-2 border-b pb-1.5 font-mono text-label transition-colors duration-300 ${
        on
          ? "border-fraise text-bone"
          : "border-transparent text-bone-dim hover:border-hairline hover:text-bone"
      }`}
    >
      <span>{label}</span>
      <span lang="en" dir="ltr" className="text-bone-faint">
        {count}
      </span>
    </Link>
  );
}

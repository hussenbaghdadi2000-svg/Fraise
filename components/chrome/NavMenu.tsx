import Link from "next/link";

/**
 * A navigation dropdown. A Server Component, built on `<details>` —
 * open/close, keyboard operation and expanded-state announcement all
 * come from the browser for 0 kB.
 *
 * It opens on CLICK, not hover. Hover menus do not exist on touch, and
 * a laptop with a touchscreen gets both. Click is one behaviour for
 * every input.
 *
 * THE ACCENT IS ON HOVER, NOT AT REST. The reference for these menus
 * showed a red chevron on every row; `--color-fraise` is reserved for
 * interactive state. Five red marks sitting at rest would be the
 * interface asserting colour it has not earned, which is the one rule
 * the whole direction is built on. The chevron is faint until you point
 * at it, and then it is red.
 */
export interface NavMenuItem {
  label: string;
  href: string;
  /** Optional trailing note — the ratio, on the services menu. */
  meta?: string;
}

export interface NavMenuProps {
  label: string;
  title: string;
  items: NavMenuItem[];
  /** Matches the sizing of its sibling nav links. */
  className: string;
}

export function NavMenu({ label, title, items, className }: NavMenuProps) {

  return (
    <details className="group/menu relative">
      <summary className={`${className} cursor-pointer list-none`}>
        {label}
      </summary>

      <div className="absolute end-0 top-7 z-30 w-[min(21rem,calc(100vw-3rem))] border border-hairline bg-ink">
        {/* The section label, in the editorial numbering the brand uses. */}
        <p className="u-caps flex items-baseline justify-between gap-4 border-b border-hairline px-5 py-3 font-mono text-label text-bone-faint">
          <span>{title}</span>
          <span lang="en" dir="ltr">
            {String(items.length).padStart(2, "0")}
          </span>
        </p>

        <ul>
          {items.map((item, i) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group/row flex items-center gap-4 border-b border-hairline px-5 py-3.5 transition-colors duration-300 last:border-b-0 hover:bg-ink-raised"
              >
                <span
                  lang="en"
                  dir="ltr"
                  className="u-caps shrink-0 font-mono text-label text-bone-faint"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="flex-1 text-caption text-bone-dim transition-colors duration-300 group-hover/row:text-bone">
                  {item.label}
                </span>

                {/* On the services menu this is the ratio — the
                    taxonomy, taught the same way the homepage strip
                    teaches it. */}
                {item.meta && (
                  <span
                    lang="en"
                    dir="ltr"
                    className="u-caps shrink-0 font-mono text-label text-bone-faint"
                  >
                    {item.meta}
                  </span>
                )}

                {/* Mirrors in RTL — a directional glyph, unlike media. */}
                <span
                  aria-hidden
                  className="u-mirror shrink-0 text-bone-faint transition-colors duration-300 group-hover/row:text-fraise"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M5 2.5L9.5 7L5 11.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

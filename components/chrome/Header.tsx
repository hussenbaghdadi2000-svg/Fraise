import Link from "next/link";
import { LocaleSwitcher } from "@/components/chrome/LocaleSwitcher";
import { NavMenu } from "@/components/chrome/NavMenu";
import { COPY } from "@/content/copy";
import { routePath, type Route } from "@/lib/routes";
import type { Locale, Pillar } from "@/types/content";

/**
 * A Server Component with no scroll behaviour — deliberately. It sits
 * over dark media on every route, so it never needs to change
 * appearance to stay legible, and a scroll-state header would be a
 * Client Component listening to scroll for a decorative change on a
 * page with 4 kB of JS budget left.
 *
 * THE MOBILE MENU IS `<details>`, NOT REACT. At 390px the wordmark plus
 * four links plus the locale switcher is roughly 450px of content — it
 * wrapped, and the nav landed on top of the wordmark's second line.
 *
 * `<details>/<summary>` is a native disclosure widget: it opens and
 * closes with no JavaScript, it is keyboard operable, screen readers
 * announce its expanded state, and it still works if scripts fail. A
 * React menu would cost state, an effect, an outside-click handler, an
 * Escape handler and a focus trap — all to reimplement what the browser
 * already ships.
 *
 * The wordmark is Latin in both locales and never mirrored — a brand
 * name is not translated text.
 */
export interface HeaderProps {
  locale: Locale;
  route: Route;
  /**
   * The homepage floats the header over the hero. Every other route has
   * no hero to float over, so it sits in flow above a hairline instead.
   */
  overlay?: boolean;
}

const PILLARS: readonly Pillar[] = ["tvc", "recipes", "reels", "stills", "menu"];

export function Header({ locale, route, overlay = false }: HeaderProps) {
  const nav = COPY[locale].home.nav;

  /* Every nav item resolves to a real page. The only fragments left
     point INTO the studio page, and they are absolute, so they work
     from any route rather than only from the page that owns them. */
  const studio = routePath({ kind: "studio" }, locale);
  const copy = COPY[locale];

  const linkClass =
    "u-caps font-mono text-label text-bone/75 transition-colors duration-300 hover:text-bone";

  const links = (
    <>
      <Link href={routePath({ kind: "work" }, locale)} className={linkClass}>
        {nav.work}
      </Link>

      <NavMenu
        label={nav.services}
        title={copy.home.sections.capabilities}
        className={linkClass}
        items={PILLARS.map((pillar) => ({
          label: copy.home.pillar[pillar],
          href: routePath({ kind: "pillar", pillar }, locale),
        }))}
      />

      {/* Three real pages. They started as anchors into one page, on
          the grounds that three thin pages compete with each other —
          but each now carries enough to stand alone: six crew with
          bios, five behind-the-scenes films, the studio's own story.
          Thin was the objection, and thin is no longer true. */}
      <NavMenu
        label={nav.about}
        title={nav.about}
        className={linkClass}
        items={[
          {
            label: copy.home.aboutMenu.team,
            href: routePath({ kind: "team" }, locale),
          },
          {
            label: copy.home.aboutMenu.backstage,
            href: routePath({ kind: "bts" }, locale),
          },
          { label: copy.home.aboutMenu.story, href: studio },
        ]}
      />

      <a href={studio + "#awards"} className={linkClass}>
        {nav.awards}
      </a>
      <Link href={routePath({ kind: "contact" }, locale)} className={linkClass}>
        {nav.contact}
      </Link>
      <LocaleSwitcher
        locale={locale}
        route={route}
        className="u-caps font-mono text-label text-bone/55 transition-colors duration-300 hover:text-bone"
      />
    </>
  );

  return (
    <header
      className={`z-20 flex items-start justify-between gap-6 px-gutter py-gutter sm:items-baseline sm:px-gutter-lg ${
        overlay
          ? "absolute inset-x-0 top-0"
          : "relative border-b border-hairline"
      }`}
    >
      {/* The studio's own mark, replacing the mono wordmark it used to
          set in type.

          ⚠️ WIDTH AND HEIGHT ARE ON THE TAG. The file is 520x234, and
          without the intrinsic size declared the header collapses and
          re-expands as the image decodes — a layout shift on the one
          element that sits above every page on the site.

          A plain <img>, not next/image: that component costs 4.3 kB
          brotli for features this project does not use, and the budget
          has 0.1 kB of headroom. See components/media/Poster.tsx. */}
      <Link
        href={routePath({ kind: "home" }, locale)}
        aria-label="Fraise Studio"
        className="shrink-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
        <img
          src="/logo-white.webp"
          alt="Fraise Studio"
          width={520}
          height={234}
          /* Eager and high priority: it is above the fold on every
             route, and it is the brand. */
          fetchPriority="high"
          /* The mark carries a strawberry, an Arabic wordmark and a
             Latin one — at 20px none of the three resolved. */
          className="h-7 w-auto sm:h-8"
        />
      </Link>

      {/* Desktop — everything inline. */}
      <nav className="hidden items-baseline gap-5 sm:flex sm:gap-8">
        {links}
      </nav>

      {/* Mobile — the same links inside a native disclosure.

          ⚠️ THE PANEL IS `fixed`, NOT `absolute`, AND FULL WIDTH.

          As an absolutely-positioned 160px box it was laid out inside
          this header — and on every route with `overlay`, this header
          lives inside a hero section carrying `overflow-hidden` for the
          media crop. The panel was therefore CLIPPED by the hero: on a
          phone the menu opened as a stub with its items cut off and the
          film's slate showing through beside it.

          `fixed` takes it out of that containing block entirely, so no
          ancestor's overflow can reach it, and `inset-x-0` gives it the
          screen rather than 160px. `pt-20` clears the header bar; the
          summary is `z-40` so CLOSE stays above the panel it opens. */}
      <details className="group sm:hidden">
        <summary className="u-caps relative z-40 cursor-pointer list-none font-mono text-label text-bone">
          <span className="group-open:hidden">{nav.menu}</span>
          <span className="hidden group-open:inline">{nav.close}</span>
        </summary>
        <nav className="fixed inset-x-0 top-0 z-30 flex flex-col items-end gap-5 border-b border-hairline bg-ink px-gutter pt-20 pb-beat">
          {links}
        </nav>
      </details>
    </header>
  );
}

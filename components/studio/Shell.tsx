import { NavLink } from "@/components/studio/NavLink";
import { setStudioLocale, signOut } from "@/lib/studio/actions";
import { COLLECTIONS } from "@/lib/studio/collections";
import { STUDIO_COPY } from "@/lib/studio/copy";
import { LOCALE_NAME, OTHER_LOCALE } from "@/lib/i18n";
import type { Locale } from "@/types/content";

/**
 * The dashboard's chrome. A Server Component.
 *
 * It borrows the site's tokens rather than inventing a second palette —
 * same ink, same hairlines, same mono label voice, `border-radius: 0`
 * everywhere and not a single shadow. Not for consistency's sake: this
 * is where the studio's content is judged, so a poster has to sit on
 * the same black it will sit on when published. A grey admin theme
 * would make every warm frame look wrong and every cold one look right.
 */
export interface ShellProps {
  locale: Locale;
  children: React.ReactNode;
}

export function Shell({ locale, children }: ShellProps) {
  const copy = STUDIO_COPY[locale];
  const other = OTHER_LOCALE[locale];

  return (
    <div className="md:grid md:min-h-dvh md:grid-cols-[15rem_1fr]">
      {/* The rail. `border-e` and `ps-*` throughout — a single `pl-*`
          here would put the divider on the wrong side in Arabic. */}
      <header className="flex flex-col gap-beat border-b border-hairline px-gutter py-6 md:sticky md:top-0 md:h-dvh md:border-b-0 md:border-e md:px-6">
        <div className="flex flex-col gap-1">
          <p
            lang="en"
            dir="ltr"
            className="u-caps font-mono text-label text-bone-faint"
          >
            {copy.subtitle}
          </p>
          <p className="text-subtitle font-semibold">{copy.brand}</p>
          {/* Says out loud what this thing is. The dashboard writes to
              the working copy and 404s in production — someone opening
              it for the first time should not have to infer that. */}
          <p className="u-caps mt-1 w-fit border border-hairline px-2 py-1 font-mono text-label text-bone-faint">
            {copy.local}
          </p>
        </div>

        <nav className="flex flex-col gap-1">
          <NavLink href="/studio" label={copy.overview} exact />
          {COLLECTIONS.map((collection) => (
            <NavLink
              key={collection.name}
              href={`/studio/${collection.name}`}
              label={collection.label[locale]}
            />
          ))}
        </nav>

        <div className="flex flex-col gap-3 md:mt-auto">
          {/*
            The language switch. A form with a Server Action rather than
            a link: it sets a cookie, and a GET that mutates state is
            the kind of thing a prefetcher fires by accident.
          */}
          <form action={setStudioLocale}>
            <input type="hidden" name="locale" value={other} />
            <button
              type="submit"
              lang={other}
              className="border-b border-transparent pb-0.5 text-caption text-bone-dim transition-colors duration-200 hover:border-fraise hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fraise"
            >
              {LOCALE_NAME[other]}
            </button>
          </form>

          <form action={signOut}>
            <button
              type="submit"
              className="u-caps border-b border-transparent pb-0.5 font-mono text-label text-bone-faint transition-colors duration-200 hover:border-fraise hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fraise"
            >
              {copy.signOut}
            </button>
          </form>

          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="u-caps border-b border-transparent pb-0.5 font-mono text-label text-bone-faint transition-colors duration-200 hover:border-fraise hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fraise"
          >
            {copy.openSite} ↗
          </a>

          <p className="max-w-[34ch] text-caption leading-relaxed text-bone-faint">
            {copy.commitNote}
          </p>
        </div>
      </header>

      <main className="min-w-0 px-gutter py-bar sm:px-gutter-lg">{children}</main>
    </div>
  );
}

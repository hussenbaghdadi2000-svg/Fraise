import { COPY } from "@/content/copy";
import type { Locale } from "@/types/content";

/**
 * A Server Component.
 *
 * Contact details are Latin and numeric, so each one carries its own
 * dir="ltr". A phone number left to the bidi algorithm inside an RTL
 * paragraph can render its groups in the wrong order — the digits stay
 * correct individually while the number as a whole becomes wrong, which
 * is the worst kind of bug because it looks fine.
 */
export interface FooterProps {
  locale: Locale;
  /**
   * The footer carries the call to action on every route EXCEPT the
   * homepage, which closes on a full band of its own. Two versions of
   * the same sentence within one screen of each other reads as a
   * template repeating itself, not as insistence.
   */
  cta?: boolean;
}

const EMAIL = "hello@fraise.studio";
const PHONE = "+962 7 9372 4731";
const INSTAGRAM = "fraisestudio";

export function Footer({ locale, cta = true }: FooterProps) {
  const copy = COPY[locale];
  const year = 2026;

  return (
    <footer
      id="contact"
      className="flex flex-col gap-beat border-t border-hairline px-gutter py-beat sm:px-gutter-lg"
    >
      {cta && (
        <div className="flex flex-col gap-6">
          <p className="u-display max-w-display text-subtitle font-semibold">
            {copy.home.ctaLine}
          </p>
          <a
            href={`mailto:${EMAIL}`}
            lang="en"
            dir="ltr"
            className="u-caps w-fit border-b border-hairline pb-1 font-mono text-label text-bone transition-colors duration-300 hover:border-fraise"
          >
            {copy.home.ctaAction}
          </a>
        </div>
      )}

      <div className="flex flex-wrap gap-x-10 gap-y-3 font-mono text-label text-bone-dim">
        <a href={`mailto:${EMAIL}`} lang="en" dir="ltr" className="hover:text-bone">
          {EMAIL}
        </a>
        <a
          href={`https://wa.me/962793724731`}
          lang="en"
          dir="ltr"
          className="hover:text-bone"
        >
          {PHONE}
        </a>
        <a
          href={`https://instagram.com/${INSTAGRAM}`}
          lang="en"
          dir="ltr"
          className="hover:text-bone"
        >
          @{INSTAGRAM}
        </a>
      </div>

      <p className="font-mono text-label text-bone-faint">
        <span lang="en" dir="ltr">
          © {year} Fraise Studio
        </span>{" "}
        · {copy.home.rights}
      </p>
    </footer>
  );
}

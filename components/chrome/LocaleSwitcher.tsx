import Link from "next/link";
import { LOCALE_NAME, OTHER_LOCALE } from "@/lib/i18n";
import { routePath, type Route } from "@/lib/routes";
import type { Locale } from "@/types/content";

/**
 * The language switch. A SERVER Component — it ships no JavaScript.
 *
 * It takes the ROUTE, not an href. Because slugs are per-locale
 * (decision D1), the other language's URL cannot be derived from the
 * current path — /إنشاء-مقاطع-ريلز/ and /en/reels/ share no characters.
 * Handing it the page identity is what lets it resolve the correct
 * target, and it resolves it through the same `routePath` that feeds
 * `alternates.languages`, so the two cannot disagree.
 */
export interface LocaleSwitcherProps {
  locale: Locale;
  route: Route;
  className?: string;
}

export function LocaleSwitcher({ locale, route, className }: LocaleSwitcherProps) {
  const other = OTHER_LOCALE[locale];

  return (
    <Link
      href={routePath(route, other)}
      /* `lang` makes the browser render each language's own name in that
         language's font. `hrefLang` tells a crawler what is on the other
         end before it follows the link. */
      lang={other}
      hrefLang={other}
      className={className}
    >
      {LOCALE_NAME[other]}
    </Link>
  );
}

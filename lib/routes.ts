import { DEFAULT_LOCALE, LOCALES, type Locale, type Pillar } from "@/types/content";

/**
 * The single place a public URL is constructed.
 *
 * Nothing anywhere else may write an href by hand. That is not style
 * policing — the same value has to feed three consumers that must never
 * disagree: the <a href>, the LocaleSwitcher, and `alternates.languages`
 * in generateMetadata. If they drift, Google is told one thing and the
 * user is sent somewhere else.
 */

/** VERIFIED: fraise.studio/ 301s to www.fraise.studio/. The www is canonical. */
export const SITE_URL = "https://www.fraise.studio";

/**
 * Slugs differ per locale — decision D1.
 *
 * The Arabic values are the LIVE WordPress URLs, copied exactly. That is
 * the whole point: a slug that does not change needs no 301 and risks no
 * ranking. `reels` is the one that matters most and it is verified.
 */
export const PILLAR_SLUG: Record<Pillar, Record<Locale, string>> = {
  /* ALL TEN SLUGS ARE THE LIVE SITE'S OWN — verified in both locales.
     Where a pillar absorbs several old service pages, the strongest one
     keeps its URL and the rest 301 to it. Nothing moves that does not
     have to; see content/redirects.ts. */
  reels: { ar: "إنشاء-مقاطع-ريلز", en: "reels-video-shooting" },
  tvc: { ar: "tv-commercials", en: "tv-commercial-production" },
  recipes: { ar: "recipe-videography", en: "recipes" },
  stills: { ar: "food-photography-service", en: "food-photography" },
  menu: { ar: "food-decorations", en: "food-styling" },
};

/**
 * B2 — ANSWERED BY EVIDENCE, not by preference.
 *
 * The live site uses `/our-work/` in BOTH locales. The earlier
 * recommendation was `/work/` on the grounds that it is shorter, which
 * was a preference dressed as a reason. Decision D1 already settled the
 * principle: the cheapest migration is the one where URLs do not move.
 * Keeping `our-work` costs two fewer redirects and zero ranking risk.
 *
 * If the studio prefers `/work/`, it is this line, the FOLDER NAME
 * `app/[locale]/our-work/`, and two entries in content/redirects.ts.
 *
 * ⚠️ This is the one slug that cannot live here alone. A static route's
 * folder name IS its URL — the router reads the filesystem, not this
 * constant — so the two must be changed together. Every other slug on
 * the site is data, because the pillars go through a [pillar] segment.
 */
export const WORK_SLUG: Record<Locale, string> = {
  ar: "our-work",
  en: "our-work",
};

/**
 * A page identity, independent of language.
 *
 * Because slugs are per-locale, a URL cannot be translated by string
 * surgery on the current path — /إنشاء-مقاطع-ريلز/ shares no characters
 * with /en/reels/. The switcher has to know WHICH PAGE it is on, not
 * which path. That is what this union is for.
 */
/**
 * The studio page. Shared slug across locales, unlike the pillars.
 *
 * The live site splits this across three URLs — `/about-us/`,
 * `/our-team/` and an Arabic `/حكاية-استوديو-فريز/` — and only the
 * English one has a Latin slug. One page absorbs all three, so one of
 * them has to be the survivor. `about-us` keeps the English URL exactly
 * and costs the Arabic story page a single 301, which is the cheaper
 * side of the trade: it is a low-traffic page and the alternative is a
 * dynamic route for one static page.
 *
 * ⚠️ Like WORK_SLUG, this also lives in the FOLDER NAME
 * `app/[locale]/about-us/`. Change both together.
 */
export const STUDIO_SLUG: Record<Locale, string> = {
  ar: "about-us",
  en: "about-us",
};

/**
 * Contact. Same slug in both locales on the live site, so it survives
 * exactly — no redirect at all.
 *
 * ⚠️ Also lives in the FOLDER NAME app/[locale]/contact-us/.
 */
export const CONTACT_SLUG: Record<Locale, string> = {
  ar: "contact-us",
  en: "contact-us",
};

/**
 * The team page. `/our-team/` is a LIVE URL in both locales, so making
 * it a real page instead of a redirect target removes two redirects and
 * keeps whatever ranking it has.
 *
 * ⚠️ Also the FOLDER NAME app/[locale]/our-team/.
 */
export const TEAM_SLUG: Record<Locale, string> = {
  ar: "our-team",
  en: "our-team",
};

/**
 * Behind the scenes. The only slug on the site with no predecessor —
 * the live site had it as an anchor (`/our-team/#backstage`), never a
 * page. Nothing 301s here; it is new surface.
 *
 * ⚠️ Also the FOLDER NAME app/[locale]/behind-the-scenes/.
 */
export const BTS_SLUG: Record<Locale, string> = {
  ar: "behind-the-scenes",
  en: "behind-the-scenes",
};

export type Route =
  | { kind: "home" }
  | { kind: "work" }
  | { kind: "studio" }
  | { kind: "team" }
  | { kind: "bts" }
  | { kind: "contact" }
  | { kind: "pillar"; pillar: Pillar }
  /**
   * A single piece of work, NESTED UNDER `/our-work/`.
   *
   * ⚠️ It is nested rather than sitting at the root on purpose. The
   * root already hosts `[pillar]`, and while a static segment beats a
   * dynamic one in the App Router, two dynamic segments at the same
   * level would be an ambiguity with no rule to settle it. Nesting
   * removes the collision instead of relying on precedence.
   *
   * One Latin slug in both locales — the parent segment still
   * translates, so the Arabic URL is /our-work/al-sayad/ and the
   * English /en/our-work/al-sayad/.
   */
  | { kind: "project"; slug: string };

function segmentsFor(route: Route, locale: Locale): string[] {
  switch (route.kind) {
    case "home":
      return [];
    case "work":
      return [WORK_SLUG[locale]];
    case "studio":
      return [STUDIO_SLUG[locale]];
    case "team":
      return [TEAM_SLUG[locale]];
    case "bts":
      return [BTS_SLUG[locale]];
    case "contact":
      return [CONTACT_SLUG[locale]];
    case "pillar":
      return [PILLAR_SLUG[route.pillar][locale]];
    case "project":
      return [WORK_SLUG[locale], route.slug];
  }
}

/**
 * The public path for a route in a locale.
 *
 * Two rules are encoded here and nowhere else:
 *   - the default locale (Arabic) carries NO prefix — it lives at the
 *     root, which is where it already lives today;
 *   - every path ends in a trailing slash, because the live site does
 *     and `trailingSlash: true` is set. Emitting /en without the slash
 *     would make every internal link cost a 308 before it resolves.
 */
export function routePath(route: Route, locale: Locale): string {
  const segments = segmentsFor(route, locale);
  const parts = locale === DEFAULT_LOCALE ? segments : [locale, ...segments];
  return parts.length === 0 ? "/" : `/${parts.join("/")}/`;
}

/**
 * The reverse lookup: which pillar owns this slug, in this locale.
 *
 * Deliberately locale-STRICT. `/en/إنشاء-مقاطع-ريلز/` must 404 rather
 * than serve the English page under an Arabic URL — one page reachable
 * at two addresses is the duplicate-content problem the whole routing
 * design exists to avoid.
 *
 * The value arrives percent-DECODED from the router, so it is compared
 * against the raw Arabic string, never the encoded form.
 */
export function pillarFromSlug(slug: string, locale: Locale): Pillar | undefined {
  const entries = Object.entries(PILLAR_SLUG) as [Pillar, Record<Locale, string>][];
  return entries.find(([, slugs]) => slugs[locale] === slug)?.[0];
}

/**
 * The share card's absolute URL.
 *
 * ⚠️ Next builds this one itself by default, from the FILESYSTEM route
 * — which emits `https://…/ar/our-work/al-sayad/opengraph-image`. The
 * `/ar/` prefix is exactly what the proxy exists to hide: an incoming
 * `/ar/*` 308s to the canonical root path, so every scraper that reads
 * an og:image would take a redirect before getting a pixel, and the
 * non-canonical form would be the one pasted around the web.
 *
 * Same rule as every other href on this site: it comes from here.
 */
export function ogUrl(route: Route, locale: Locale): string {
  return `${routeUrl(route, locale)}opengraph-image`;
}

/** Absolute URL — for canonicals, hreflang, OG tags and the sitemap. */
export function routeUrl(route: Route, locale: Locale): string {
  return `${SITE_URL}${routePath(route, locale)}`;
}

/**
 * Every locale's absolute URL for one page, shaped for
 * `alternates.languages`. The LocaleSwitcher reads the same function,
 * so the link a user clicks and the URL Google is given are the same
 * value by construction rather than by discipline.
 */
export function routeAlternates(route: Route): Record<Locale, string> {
  return Object.fromEntries(
    LOCALES.map((locale) => [locale, routeUrl(route, locale)]),
  ) as Record<Locale, string>;
}

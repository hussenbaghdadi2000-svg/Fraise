/**
 * THE 301 MAP — both locales, complete.
 *
 * Every entry is a URL that exists and is indexed on the live WordPress
 * site TODAY. The Arabic set was crawled; the English set was supplied
 * by the developer from the live navigation, because `/en/` serves a
 * bot-protection interstitial to anything that is not a browser.
 *
 * WHAT DOES NOT APPEAR HERE, ON PURPOSE. Ten of the site's URLs do not
 * move at all — the two homepages, both `/our-work/` pages, and the
 * five pillars in each locale keep the exact addresses they have now.
 * That is decision D1 doing its job: the cheapest migration is the one
 * where the valuable URLs never change, and a redirect you did not need
 * is still a hop in front of a page.
 *
 * THE NINE→FIVE CONSOLIDATION happens twice, once per locale, and the
 * two locales do NOT share slugs:
 *
 *   ar  إنشاء-مقاطع-ريلز · tv-commercials · recipe-videography
 *       food-photography-service · food-decorations
 *   en  reels-video-shooting · tv-commercial-production · recipes
 *       food-photography · food-styling
 *
 * Several old pages land on the same pillar — three stills pages become
 * one. Google consolidates their signals into the target. What would
 * throw the ranking away is 301ing them to the homepage, which reads as
 * "this content is gone".
 *
 * ⚠️ THE CLIENT PAGES ARE A DOWNGRADE, and a deliberate one. The live
 * site has ~16 per-client detail pages (`/client/kfc/`,
 * `/en/client/zaity-oil/` …) and this site has none — client pages are
 * outside the MVP. They 301 to the portfolio, which is the nearest
 * honest destination. **If Search Console shows those pages earning
 * real traffic, they are a Phase 2 route, not a redirect.**
 */
export interface LegacyRedirect {
  from: string;
  to: string;
  note: string;
}

export const LEGACY_REDIRECTS: LegacyRedirect[] = [
  /* ═══ ARABIC — nine services → five pillars ═══════════════ */
  {
    from: "/tv-commercials/",
    to: "/tv-commercials/",
    note: "tvc — unchanged. Listed so a slug edit cannot silently lose it",
  },
  {
    from: "/إنتاج-الأفلام-القصيرة/",
    to: "/tv-commercials/",
    note: "short films → tvc",
  },
  {
    from: "/recipe-videography/",
    to: "/recipe-videography/",
    note: "recipes — unchanged",
  },
  {
    from: "/إنتاج-وتصوير-فيديو-احترافي-للطعام-وال/",
    to: "/recipe-videography/",
    note: "food & beverage video → recipes. Slug truncated mid-word by WordPress; copied verbatim",
  },
  {
    from: "/إنشاء-مقاطع-ريلز/",
    to: "/إنشاء-مقاطع-ريلز/",
    note: "reels — unchanged. The strongest organic page on the site",
  },
  {
    from: "/food-photography-service/",
    to: "/food-photography-service/",
    note: "stills — unchanged, and canonical of the three",
  },
  {
    from: "/product-photography/",
    to: "/food-photography-service/",
    note: "product photography → stills",
  },
  {
    from: "/commercial-photography/",
    to: "/food-photography-service/",
    note: "commercial photography → stills",
  },
  {
    from: "/food-decorations/",
    to: "/food-decorations/",
    note: "menu — unchanged",
  },

  /* ═══ ENGLISH — nine services → five pillars ══════════════ */
  {
    from: "/en/reels-video-shooting/",
    to: "/en/reels-video-shooting/",
    note: "reels — unchanged",
  },
  {
    from: "/en/tv-commercial-production/",
    to: "/en/tv-commercial-production/",
    note: "tvc — unchanged",
  },
  {
    from: "/en/short-film-production/",
    to: "/en/tv-commercial-production/",
    note: "short films → tvc",
  },
  {
    from: "/en/recipes/",
    to: "/en/recipes/",
    note: "recipes — unchanged",
  },
  {
    from: "/en/food-beverage-video-production/",
    to: "/en/recipes/",
    note: "food & beverage video → recipes",
  },
  {
    from: "/en/food-photography/",
    to: "/en/food-photography/",
    note: "stills — unchanged, and canonical of the three",
  },
  {
    from: "/en/commercial-photography/",
    to: "/en/food-photography/",
    note: "commercial photography → stills",
  },
  {
    from: "/en/product-photography/",
    to: "/en/food-photography/",
    note: "product photography → stills",
  },
  {
    from: "/en/food-styling/",
    to: "/en/food-styling/",
    note: "menu — unchanged",
  },

  /* ═══ EVERYTHING ELSE ════════════════════════════════════ */
  {
    from: "/our-work/",
    to: "/our-work/",
    note: "the portfolio — unchanged. B2 settled by evidence: the live site already uses this",
  },
  {
    from: "/en/our-work/",
    to: "/en/our-work/",
    note: "unchanged. The #videos and #photos anchors are fragments and never reach the server",
  },
  {
    from: "/client/:slug*",
    to: "/our-work/",
    note: "~8 Arabic client pages → the portfolio. NO equivalent route in MVP — revisit if they carry traffic",
  },
  {
    from: "/en/client/:slug*",
    to: "/en/our-work/",
    note: "~8 English client pages → the portfolio. Same caveat",
  },
  {
    from: "/clients/",
    to: "/about-us/",
    note: "the client wall lives on the homepage",
  },
  {
    from: "/en/clients/",
    to: "/en/about-us/",
    note: "same",
  },
  {
    from: "/en/about-us/",
    to: "/en/about-us/",
    note: "the studio page — unchanged. The English URL survives exactly",
  },
  {
    from: "/about-us/",
    to: "/about-us/",
    note: "unchanged",
  },
  {
    from: "/حكاية-استوديو-فريز/",
    to: "/about-us/",
    note: "the Arabic studio story. The only page whose URL had to move: one static route cannot carry two slugs, and the English side was the more valuable of the two to keep",
  },
  {
    from: "/our-team/",
    to: "/our-team/",
    note: "the crew — unchanged. It became a real page again rather than a redirect target, which is two fewer hops on a live URL",
  },
  {
    from: "/en/our-team/",
    to: "/en/our-team/",
    note: "unchanged",
  },
  {
    from: "/contact-us/",
    to: "/contact-us/",
    note: "contact — unchanged. The live URL survives exactly",
  },
  {
    from: "/en/contact-us/",
    to: "/en/contact-us/",
    note: "unchanged",
  },
];

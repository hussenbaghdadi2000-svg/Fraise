import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/routes";

/**
 * The live site's robots.txt is WordPress's default: it blocks
 * /wp-admin/ and declares no sitemap. Both facts stop being true here.
 *
 * `/style/` is the design-system reference page. It carries a noindex
 * of its own, but a crawler still has to fetch a page to read that —
 * this saves it the trip.
 *
 * `/studio/` is the content dashboard. It already 404s outside
 * development, so nothing is reachable to index — this is the third
 * lock on a door that is not there, and it costs one line. The reason
 * to say it anyway: the route exists in the repo, and a robots.txt that
 * names it is how the next person learns it is not meant to be public.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/style/", "/en/style/", "/studio/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

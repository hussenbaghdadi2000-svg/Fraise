import type { MetadataRoute } from "next";
import { getProjects } from "@/content/projects";
import { routeAlternates, routeUrl, type Route } from "@/lib/routes";
import { DEFAULT_LOCALE, type Pillar } from "@/types/content";

/**
 * The live WordPress site has **no sitemap at all** — its robots.txt
 * declares none and /sitemap.xml 404s. Every URL Google knows about it
 * was found by crawling. This is the first one the studio has had.
 *
 * Note it is generated from `lib/routes.ts`, the same function that
 * builds every href and every canonical on the site. A sitemap that
 * drifts from the pages is worse than none: it tells a crawler to spend
 * its budget on URLs that redirect or 404.
 *
 * `/work?service=` is deliberately ABSENT. Those views are canonicalised
 * to bare /work/, so listing them would ask Google to index five pages
 * that all point somewhere else.
 */

const PILLARS: Pillar[] = ["tvc", "recipes", "reels", "stills", "menu"];

/* ⚠️ A FUNCTION NOW, NOT A CONST. The project list comes from the
   database, and a module-scope array cannot await. */
async function routes(): Promise<{ route: Route; priority: number }[]> {
  return [
    { route: { kind: "home" }, priority: 1 },
    { route: { kind: "work" }, priority: 0.9 },
    { route: { kind: "studio" }, priority: 0.7 },
    { route: { kind: "team" }, priority: 0.7 },
    { route: { kind: "bts" }, priority: 0.7 },
    { route: { kind: "contact" }, priority: 0.7 },
    /* Reels first: it is the strongest organic page on the live site. */
    ...PILLARS.map((pillar) => ({
      route: { kind: "pillar", pillar } as Route,
      priority: pillar === "reels" ? 0.9 : 0.8,
    })),
    /* Every piece of work, read from the database. A project the studio
       adds is in the sitemap as soon as this route regenerates — which
       is why the write path calls revalidatePath("/sitemap.xml").
       Below the pillars: a pillar page is what someone searches for, a
       project is what they land on next. */
    ...(await getProjects()).map((project) => ({
      route: { kind: "project", slug: project.slug } as Route,
      priority: 0.6,
    })),
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return (await routes()).map(({ route, priority }) => ({
    /* The Arabic URL is the canonical one — Arabic sits at the root. */
    url: routeUrl(route, DEFAULT_LOCALE),
    changeFrequency: "monthly",
    priority,
    alternates: { languages: routeAlternates(route) },
  }));
}

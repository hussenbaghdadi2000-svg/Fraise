import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/chrome/Footer";
import { Header } from "@/components/chrome/Header";
import { Poster } from "@/components/media/Poster";
import { Preview } from "@/components/media/Preview";
import { Slate } from "@/components/primitives/Slate";
import { ServiceJsonLd } from "@/components/seo/JsonLd";
import { ShowcaseCard } from "@/components/work/ShowcaseCard";
import { COPY } from "@/content/copy";
import { PILLAR_CONTENT, PROCESS } from "@/content/pillars";
import { PILLAR_MEDIA, getProjects } from "@/content/projects";
import { GRID_COLUMNS, GRID_SIZES } from "@/lib/grid";
import { assertLocale } from "@/lib/i18n";
import { INSET } from "@/components/ui/Container";
import { Measure } from "@/components/ui/Measure";
import { NextUp } from "@/components/ui/NextUp";
import { SectionHead } from "@/components/ui/SectionHead";
import {
  PILLAR_SLUG,
  ogUrl,
  pillarFromSlug,
  routeAlternates,
  routePath,
  routeUrl,
} from "@/lib/routes";
import {
  LOCALES,
  PILLAR_KIND,
  PILLAR_RATIO,
  RATIO_CLASS,
  type Locale,
  type Pillar,
} from "@/types/content";

/**
 * ONE FILE, TEN PAGES — five pillars × two locales.
 *
 * The five pillar pages are structurally identical and differ only in
 * data, so writing them by hand would mean repeating every design
 * decision five times and re-repeating it on every change.
 *
 * These are the pages people actually search for. Nobody types "Fraise
 * Studio"; they type "food video production" or "إنشاء مقاطع ريلز". The
 * homepage cannot rank for those because it is about everything — a
 * pillar page can, because it is about one thing.
 *
 * It is also where the nine→five consolidation lands: the old site's
 * nine service pages 301 here, and their search terms survive as the
 * `tags` text rather than as nine menu items.
 */

const PILLARS: Pillar[] = ["tvc", "recipes", "reels", "stills", "menu"];

/**
 * The Latin name that sits above the heading — the slate convention,
 * and the same device the homepage and the work index use. Latin in
 * both locales, like every production credit on the site.
 */
const PILLAR_LATIN: Record<Pillar, string> = {
  tvc: "TVC & CINEMATOGRAPHY",
  recipes: "RECIPE FILMS",
  reels: "REELS",
  stills: "STILLS",
  menu: "MENU PLATE DESIGN",
};

/**
 * `[pillar]` sits at the same level as the static `work` and `style`
 * routes. Static segments win over dynamic ones in the App Router, so
 * `/work/` keeps resolving to the Work page and never reaches here.
 */
export const dynamicParams = false;

/* NOTE: in a NESTED generateStaticParams the parent params arrive as a
   plain object, not a Promise — unlike the `params` prop on the page
   itself, which is always a Promise in Next 16. */
export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!LOCALES.includes(locale as Locale)) return [];
  /* Per-locale slugs, so /en/ never generates an Arabic URL. */
  return PILLARS.map((pillar) => ({
    pillar: PILLAR_SLUG[pillar][locale as Locale],
  }));
}

/** Resolves the URL segment to a pillar, or 404s. Strict about locale. */
async function resolve(params: PageProps<"/[locale]/[pillar]">["params"]) {
  const { locale: raw, pillar: slug } = await params;
  const locale = assertLocale(raw);
  const pillar = pillarFromSlug(decodeURIComponent(slug), locale);
  if (!pillar) notFound();
  return { locale, pillar };
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/[pillar]">): Promise<Metadata> {
  const { locale, pillar } = await resolve(params);
  const content = PILLAR_CONTENT[pillar];
  const route = { kind: "pillar", pillar } as const;

  return {
    title: `${content.h1[locale]} — Fraise Studio`,
    description: content.line[locale],
    openGraph: { images: [ogUrl(route, locale)] },
    alternates: {
      canonical: routeUrl(route, locale),
      languages: routeAlternates(route),
    },
  };
}

export default async function PillarPage({
  params,
}: PageProps<"/[locale]/[pillar]">) {
  const { locale, pillar } = await resolve(params);
  const content = PILLAR_CONTENT[pillar];
  const copy = COPY[locale];
  const ratio = PILLAR_RATIO[pillar];
  const isWideRatio = ratio === "2.39:1" || ratio === "16:9";
  const route = { kind: "pillar", pillar } as const;

  /* Every piece here shares this pillar, therefore this ratio — which
     is why there is no cadence to derive any more. One grid, one ratio,
     every row squares up. `lib/cadence.ts` existed to arrange MIXED
     ratios into a rhythm; on a page that is one format by definition it
     was solving a problem this page does not have. */
  const work = (await getProjects()).filter(
    (project) => project.pillar === pillar,
  );

  /* Two neighbours, wrapping the list. Internal link equity, and a
     genuine cross-sell: a client who needs reels usually needs stills. */
  const index = PILLARS.indexOf(pillar);
  const adjacent = [
    PILLARS[(index + 1) % PILLARS.length],
    PILLARS[(index + 2) % PILLARS.length],
  ];

  return (
    <>
      <ServiceJsonLd
        locale={locale}
        route={route}
        name={content.h1[locale]}
        description={content.line[locale]}
        tags={content.tags[locale]}
      />

      {/* 01 — HERO in the pillar's OWN ratio. The frame announces the
          format before a single word is read.

          THE RATIO DECIDES THE LAYOUT, not the other way round. A 2.39:1
          film at 100vw is 600px tall and magnificent; a 9:16 film at
          100vw is 2560px tall — two and a half screens of one frame,
          with the page's actual content pushed off the bottom. So wide
          pillars go full-bleed and tall ones are height-capped and
          centred on the ink, which is also what makes a vertical read
          as vertical instead of as "enormous". */}
      <section className="relative w-full overflow-hidden bg-ink">
        <Header locale={locale} route={route} overlay />

        {isWideRatio ? (
          <div className="u-scrim u-scrim-top relative">
            <Preview src={`/media/${PILLAR_MEDIA[pillar]}.mp4`} auto>
              <Poster
                src={`/media/${PILLAR_MEDIA[pillar]}.jpg`}
                alt={content.h1[locale]}
                ratio={ratio}
                sizes="100vw"
                preload
              />
            </Preview>
            <div
              className={`absolute inset-x-0 bottom-0 z-10 ${INSET} pb-7 sm:pb-beat`}
            >
              <Slate
                client="Fraise Studio"
                kind={PILLAR_KIND[pillar]}
                year={2023}
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center px-gutter pt-bar pb-4 sm:px-gutter-lg sm:pt-movement">
            <div
              className={`u-scrim relative h-[58svh] sm:h-[64vh] ${RATIO_CLASS[ratio]}`}
            >
              <Preview
                src={`/media/${PILLAR_MEDIA[pillar]}.mp4`}
                auto
                className="h-full w-full"
              >
                <Poster
                  src={`/media/${PILLAR_MEDIA[pillar]}.jpg`}
                  alt={content.h1[locale]}
                  ratio={ratio}
                  sizes="(min-width: 640px) 40vw, 90vw"
                  preload
                  fill
                />
              </Preview>
              <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                <Slate
                  client="Fraise Studio"
                  kind={PILLAR_KIND[pillar]}
                  year={2023}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      <main className="flex flex-col">
        {/* 02 — H1, the line, and the absorbed service terms.

            The head is the SAME component the homepage and the work
            index use: a page heading is an h1, a section heading is an
            h2, and the treatment is deliberately identical.

            The h1 was `text-display`. On a page with no positioning
            statement that looked defensible, but it made the service
            name the largest type on the site — larger than the
            statement the whole studio is built on. */}
        <section className={`${INSET} pt-bar pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              as="h1"
              latin={PILLAR_LATIN[pillar]}
              number={String(work.length)}
              title={content.h1[locale]}
            />

            <div className="flex flex-col gap-beat">
              <p className="u-rise max-w-lead text-lead text-bone-dim">
                {content.line[locale]}
              </p>

              {/* CAPABILITY TAGS. The old nine service pages, absorbed.
                  Text, not navigation: nine more menu items would
                  rebuild the problem the consolidation exists to solve,
                  while nine keyword-bearing phrases keep what those
                  pages ranked for. */}
              <ul className="u-rise flex flex-wrap gap-x-8 gap-y-3 border-t border-hairline pt-5">
                {content.tags[locale].map((tag) => (
                  <li
                    key={tag}
                    className="u-caps font-mono text-label text-bone-dim"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </Measure>
        </section>

        {/* 03 — WORK, filtered to this pillar. One grid, because one
            pillar is one ratio. */}
        {work.length > 0 && (
          <section className={`${INSET} pb-movement`}>
            <Measure className="gap-bar">
              <SectionHead
                number="01"
                latin="SELECTED WORK"
                title={copy.home.sections.work}
                link={{
                  href: routePath({ kind: "work" }, locale),
                  label: copy.home.viewAll,
                }}
              />
              <div className={`grid gap-x-8 gap-y-beat ${GRID_COLUMNS[pillar]}`}>
                {work.map((project, i) => (
                  <ShowcaseCard
                    key={project.id}
                    project={project}
                    locale={locale}
                    index={i}
                    playLabel={copy.home.playFilm}
                    sizes={GRID_SIZES[pillar]}
                  />
                ))}
              </div>
            </Measure>
          </section>
        )}

        {/* 04 — PROCESS. Production-credibility content, and the
            clearest studio-not-freelancer signal on the site: a
            freelancer does not publish a process. */}
        <section className={`${INSET} pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              number="02"
              latin="PROCESS"
              title={copy.home.sections.studio}
            />
            <ol className="grid gap-beat sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS[locale].map((entry, i) => (
                <li key={entry.step} className="u-rise flex flex-col gap-3">
                  {/* NOT text-fraise. The accent had leaked to a number
                      sitting at rest, which is the one thing the
                      direction forbids it — the recording dot in the
                      homepage hero is the only exception on the site. */}
                  <span
                    lang="en"
                    dir="ltr"
                    className="u-caps font-mono text-label text-bone-faint"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="u-display text-lead font-semibold">
                    {entry.step}
                  </p>
                  <p className="text-caption leading-relaxed text-bone-dim">
                    {entry.body}
                  </p>
                </li>
              ))}
            </ol>
          </Measure>
        </section>

        {/* 05 — ADJACENT PILLARS. */}
        <section className={`${INSET} pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              number="03"
              latin="CAPABILITIES"
              title={copy.home.sections.capabilities}
            />
            <NextUp
              items={adjacent.map((next) => ({
                href: routePath({ kind: "pillar", pillar: next }, locale),
                label: copy.home.pillar[next],
              }))}
            />
          </Measure>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/chrome/Footer";
import { Header } from "@/components/chrome/Header";
import { Poster } from "@/components/media/Poster";
import { Preview } from "@/components/media/Preview";
import { Slate } from "@/components/primitives/Slate";
import { ShowcaseCard } from "@/components/work/ShowcaseCard";
import { COPY } from "@/content/copy";
import { getProjects } from "@/content/projects";
import { GRID_COLUMNS, GRID_SIZES } from "@/lib/grid";
import { assertLocale } from "@/lib/i18n";
import { routeAlternates, routePath, routeUrl, ogUrl } from "@/lib/routes";
import { INSET } from "@/components/ui/Container";
import { Measure } from "@/components/ui/Measure";
import { NextUp } from "@/components/ui/NextUp";
import { SectionHead } from "@/components/ui/SectionHead";
import {
  LOCALES,
  PILLAR_KIND,
  PILLAR_RATIO,
  RATIO_CLASS,
  type Locale,
} from "@/types/content";

/**
 * ONE PIECE OF WORK. 58 pages — 29 projects × two locales.
 *
 * This is the page the whole site was missing. Every card on the
 * homepage, the work index and the five service pages used to land on a
 * PILLAR page — so clicking a specific film took you to a list that
 * included it, which is the opposite of what a click means. The
 * studio's note was blunt about it: the card should encourage people to
 * click INTO the project.
 *
 * ⚠️ NESTED UNDER `/our-work/`, not at the root. The root already hosts
 * `[pillar]`; two dynamic segments at one level is an ambiguity with no
 * rule to settle it. See the `project` case in lib/routes.ts.
 *
 * ⚠️ NO FULL FILM PLAYS HERE YET, and that is a data gap rather than a
 * missing feature. `Project.vimeoId` is wired end to end — the watch
 * link renders the moment it is set — but no project film in this repo
 * has a published Vimeo id. Inventing them would ship dead links from
 * every page on the site.
 */

/**
 * ⚠️ TRUE, AND IT WAS FALSE UNTIL THE DATABASE LANDED.
 *
 * generateStaticParams runs at BUILD time. Once the studio can add a
 * project from the deployed dashboard, a slug can exist that no build
 * has ever seen — and with `false` the router would 404 it until
 * someone redeployed, which defeats the entire point of the database.
 * With `true` the page is rendered on first request and cached.
 *
 * Nothing is lost by the change: an unknown slug still 404s, because
 * `resolve()` below looks it up and calls notFound(). The guard moved
 * from the router to the page, where it can consult the data.
 */
export const dynamicParams = true;

/* ⚠️ In a NESTED generateStaticParams the parent params arrive as a
   plain object, NOT a Promise — unlike the `params` prop on the page
   itself, which is always a Promise in Next 16. Typing this as a
   Promise fails the build's route validator with an opaque error. */
export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!LOCALES.includes(locale as Locale)) return [];
  /* The slug is Latin in both locales — only the PARENT segment
     translates — so the same list is correct for each. */
  return (await getProjects()).map((project) => ({ project: project.slug }));
}

async function resolve(
  params: PageProps<"/[locale]/our-work/[project]">["params"],
) {
  const { locale: raw, project: slug } = await params;
  const locale = assertLocale(raw);
  const project = (await getProjects()).find(
    (candidate) => candidate.slug === decodeURIComponent(slug),
  );
  if (!project) notFound();
  return { locale, project };
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/our-work/[project]">): Promise<Metadata> {
  const { locale, project } = await resolve(params);
  const copy = COPY[locale];
  const route = { kind: "project", slug: project.slug } as const;

  /* Built from the row rather than authored per piece: 29 hand-written
     descriptions would go stale the first time a title is corrected,
     and every value here is already confirmed data. */
  const description = `${project.title[locale]} — ${copy.home.pillar[project.pillar]}, ${project.client}, ${project.year}. Fraise Studio, ${copy.contact.city}.`;

  return {
    title: `${project.title[locale]} — ${project.client} — Fraise Studio`,
    description,
    openGraph: { images: [ogUrl(route, locale)] },
    alternates: {
      canonical: routeUrl(route, locale),
      languages: routeAlternates(route),
    },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/[locale]/our-work/[project]">) {
  const { locale, project } = await resolve(params);
  const copy = COPY[locale];
  /* resolve() already read the catalogue; React's cache() makes this
     the same query rather than a second one. */
  const projects = await getProjects();
  const ratio = PILLAR_RATIO[project.pillar];
  const isWide = ratio === "2.39:1" || ratio === "16:9";
  const route = { kind: "project", slug: project.slug } as const;

  /* Three more in the same format. Same rule as the work index: one
     grid, one ratio, so every row squares up. */
  const siblings = projects.filter(
    (candidate) =>
      candidate.pillar === project.pillar && candidate.id !== project.id,
  ).slice(0, 3);

  return (
    <>
      {/* THE RATIO DECIDES THE LAYOUT, the same rule the pillar heroes
          use: a 2.39:1 at 100vw is magnificent and a 9:16 at 100vw is
          2560px tall, which is two and a half screens of one frame. */}
      <section className="relative w-full overflow-hidden bg-ink">
        <Header locale={locale} route={route} overlay />

        {isWide ? (
          <div className="u-scrim u-scrim-top relative">
            <Preview src={project.preview} auto>
              <Poster
                src={project.poster}
                alt={project.title[locale]}
                ratio={ratio}
                sizes="100vw"
                preload
              />
            </Preview>
            <div
              className={`absolute inset-x-0 bottom-0 z-10 ${INSET} pb-7 sm:pb-beat`}
            >
              <Slate
                client={project.client}
                kind={PILLAR_KIND[project.pillar]}
                year={project.year}
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center px-gutter pt-bar pb-4 sm:px-gutter-lg sm:pt-movement">
            <div
              className={`u-scrim relative h-[58svh] sm:h-[64vh] ${RATIO_CLASS[ratio]}`}
            >
              <Preview src={project.preview} auto className="h-full w-full">
                <Poster
                  src={project.poster}
                  alt={project.title[locale]}
                  ratio={ratio}
                  sizes="(min-width: 640px) 40vw, 90vw"
                  preload
                  fill
                />
              </Preview>
              <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                <Slate
                  client={project.client}
                  kind={PILLAR_KIND[project.pillar]}
                  year={project.year}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      <main className="flex flex-col">
        <section className={`${INSET} pt-bar pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              as="h1"
              latin={PILLAR_KIND[project.pillar]}
              number={String(project.year)}
              title={project.title[locale]}
              link={{
                href: routePath({ kind: "work" }, locale),
                label: copy.work.backToWork,
              }}
            />

            <div className="flex flex-col gap-beat">
              {/* The production credit, as a definition list rather than
                  a sentence — this is notation, and the slate already
                  taught the reader to read it that way. */}
              <dl className="grid gap-x-8 gap-y-beat sm:grid-cols-3">
                {/* ⚠️ Every label is authored per locale. Two of these
                    were hardcoded English on the first build, which put
                    "Format" and "Year" beside two Arabic labels on the
                    Arabic page. The VALUES stay Latin where they are
                    notation — a ratio and a year are read the same way
                    in both languages, like the slate. */}
                {[
                  { label: copy.work.clientLabel, value: project.client, latin: true },
                  {
                    label: copy.work.serviceLabel,
                    value: copy.home.pillar[project.pillar],
                    latin: false,
                  },
                  {
                    label: copy.work.yearLabel,
                    value: String(project.year),
                    latin: true,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="u-rise flex flex-col gap-2 border-t border-hairline pt-5"
                  >
                    <dt className="u-caps font-mono text-label text-bone-faint">
                      {row.label}
                    </dt>
                    <dd className="u-display text-subtitle font-semibold">
                      {row.latin ? (
                        <span lang="en" dir="ltr">
                          {row.value}
                        </span>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* ⚠️ The watch link renders ONLY when the studio has a
                  published film. It is an <a>, not a <Link>: the
                  destination is Vimeo, and asking the router to prefetch
                  a route it does not own buys nothing. Same reasoning as
                  components/work/BtsCard.tsx. */}
              {project.vimeoId ? (
                <a
                  href={`https://vimeo.com/${project.vimeoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="u-caps w-fit border-b border-current/30 pb-1 font-mono text-label transition-colors duration-300 hover:border-fraise"
                >
                  {copy.work.watchFilm}
                </a>
              ) : (
                <p className="u-rise max-w-body text-caption text-bone-faint">
                  {copy.work.filmSoon}
                </p>
              )}
            </div>
          </Measure>
        </section>

        {siblings.length > 0 && (
          <section className={`${INSET} pb-movement`}>
            <Measure className="gap-bar">
              <SectionHead
                number="01"
                latin="MORE"
                title={copy.work.moreIn}
                link={{
                  href: routePath({ kind: "pillar", pillar: project.pillar }, locale),
                  label: copy.home.pillar[project.pillar],
                }}
              />
              <div
                className={`grid gap-x-8 gap-y-beat ${GRID_COLUMNS[project.pillar]}`}
              >
                {siblings.map((sibling, i) => (
                  <ShowcaseCard
                    key={sibling.id}
                    project={sibling}
                    locale={locale}
                    index={i}
                    playLabel={copy.home.playFilm}
                    sizes={GRID_SIZES[project.pillar]}
                  />
                ))}
              </div>
            </Measure>
          </section>
        )}

        <section className={`${INSET} pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              number="02"
              latin="NEXT"
              title={copy.home.ctaLine}
            />
            <NextUp
              items={[
                {
                  href: routePath({ kind: "work" }, locale),
                  label: copy.work.backToWork,
                  meta: String(projects.length),
                },
                {
                  href: routePath({ kind: "contact" }, locale),
                  label: copy.home.ctaAction,
                },
              ]}
            />
          </Measure>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/chrome/Footer";
import { Header } from "@/components/chrome/Header";
import { FilterRail } from "@/components/work/FilterRail";
import { ShowcaseCard } from "@/components/work/ShowcaseCard";
import { COPY } from "@/content/copy";
import { getProjects } from "@/content/projects";
import { GRID_COLS, GRID_COLUMNS, GRID_SIZES } from "@/lib/grid";
import { assertLocale } from "@/lib/i18n";
import { routeAlternates, routeUrl, type Route, ogUrl } from "@/lib/routes";
import type { Pillar } from "@/types/content";
import { INSET } from "@/components/ui/Container";
import { Measure } from "@/components/ui/Measure";
import { SectionHead } from "@/components/ui/SectionHead";

const ROUTE: Route = { kind: "work" };

const PILLARS = ["tvc", "recipes", "reels", "stills", "menu"] as const;

/**
 * ⚠️ THE PAGE REVEALS ROWS, NOT ITEMS.
 *
 * The obvious version — slice the first nine pieces, then group them —
 * produced bands holding ONE card under a full-width rule and its own
 * header, because the nine landed unevenly across five formats. A band
 * of one is worse than no band.
 *
 * Revealing a ROW per format instead means every band is always either
 * complete or absent. One click takes this archive of 21 from 17 to all
 * of them, which is also the honest amount of paging 21 pieces need.
 */
const START_ROWS = 1;
const MAX_ROWS = 6;

function isPillar(value: string | undefined): value is Pillar {
  return PILLARS.includes(value as Pillar);
}

/**
 * The canonical is ALWAYS the unfiltered /work/, never the filtered
 * view.
 *
 * `?service=reels` is a genuinely useful URL for a human — shareable,
 * refresh-safe, back-button-safe. It is a bad URL for an index: five
 * near-duplicate pages of the same content would compete with each
 * other AND with the five pillar pages, which are the real indexable
 * filtered views. So the filter is public to people and invisible to
 * crawlers.
 */
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/our-work">): Promise<Metadata> {
  const locale = assertLocale((await params).locale);
  return {
    title: `${COPY[locale].work.title} — Fraise Studio`,
    description: COPY[locale].work.description,
    openGraph: { images: [ogUrl(ROUTE, locale)] },
    alternates: {
      canonical: routeUrl(ROUTE, locale),
      languages: routeAlternates(ROUTE),
    },
  };
}

export default async function WorkPage({
  params,
  searchParams,
}: PageProps<"/[locale]/our-work">) {
  const locale = assertLocale((await params).locale);
  const query = await searchParams;
  const copy = COPY[locale];

  const service = typeof query.service === "string" ? query.service : undefined;
  const active = isPillar(service) ? service : undefined;

  /* Load-more is URL state too — a link that raises a number, not a
     button that mutates client state. Clamped so a hand-edited ?rows=
     cannot make the server render an unbounded page. */
  const requested = Number(
    typeof query.rows === "string" ? query.rows : START_ROWS,
  );
  const rows =
    Number.isFinite(requested) && requested > 0
      ? Math.min(Math.floor(requested), MAX_ROWS)
      : START_ROWS;

  const projects = await getProjects();

  const filtered = active
    ? projects.filter((project) => project.pillar === active)
    : projects;

  const counts = Object.fromEntries(
    PILLARS.map((pillar) => [
      pillar,
      projects.filter((project) => project.pillar === pillar).length,
    ]),
  ) as Record<Pillar, number>;

  /**
   * ⚠️ GROUPED BY FORMAT, which replaces the derived editorial cadence.
   *
   * `lib/cadence.ts` + `WorkGrid` arranged a filtered list into an
   * A→B→C→D rhythm of mixed-ratio rows. Two things killed it. It opened
   * on a full-bleed 2.39:1 frame — 602px tall at 1440, the loudest thing
   * on a page whose loudest thing is meant to be the food; and putting
   * a 4:5 next to a 16:9 in one row leaves a hole no alignment closes,
   * because one is 2.2x taller than the other.
   *
   * Grouping solves both by being the more honest structure: every grid
   * holds ONE ratio so every row squares up, and a work index organised
   * by what a thing IS beats one organised by a rhythm the reader
   * cannot see. It is the same shape as the homepage showcase, which
   * pairs its rows by pillar for exactly this reason.
   */
  const groups = PILLARS.map((pillar) => {
    const all = filtered.filter((project) => project.pillar === pillar);
    return { pillar, all, projects: all.slice(0, GRID_COLS[pillar] * rows) };
  }).filter((group) => group.projects.length > 0);

  const shown = groups.reduce((n, group) => n + group.projects.length, 0);
  const remaining = filtered.length - shown;

  const moreHref = `${active ? `?service=${active}&` : "?"}rows=${rows + 1}`;

  return (
    <>
      <Header locale={locale} route={ROUTE} />

      <main className={`${INSET} pt-bar pb-movement`}>
        <Measure className="gap-bar">
          {/* The page heading is an h1 and a section heading is an h2;
              the treatment is identical, which is the point. The number
              is the archive size, not a section index. */}
          <SectionHead
            as="h1"
            latin="WORK"
            number={String(projects.length)}
            title={copy.work.title}
          />

          <div className="flex flex-col gap-beat">
            <p className="u-rise max-w-lead text-lead text-bone-dim">
              {copy.work.intro}
            </p>

            <FilterRail
              locale={locale}
              active={active}
              pillars={PILLARS}
              counts={counts}
              total={projects.length}
            />
          </div>

          {groups.length > 0 ? (
            groups.map((group) => (
              <section key={group.pillar} className="flex flex-col gap-beat">
                {/* A quieter head than SectionHead — this is a band
                    inside a section, not a section. The ratio is on it
                    because the ratio is the reason the band exists. */}
                <div className="u-rise flex items-baseline justify-between gap-6 border-t border-hairline pt-5">
                  <p className="u-caps font-mono text-label text-bone">
                    {copy.home.pillar[group.pillar]}
                  </p>
                  <p
                    lang="en"
                    dir="ltr"
                    className="u-caps font-mono text-label text-bone-faint"
                  >
                    {group.all.length}
                  </p>
                </div>

                <div
                  className={`grid gap-x-8 gap-y-beat ${GRID_COLUMNS[group.pillar]}`}
                >
                  {group.projects.map((project, i) => (
                    <ShowcaseCard
                      key={project.id}
                      project={project}
                      locale={locale}
                      index={i}
                      playLabel={copy.home.playFilm}
                      sizes={GRID_SIZES[group.pillar]}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <p className="text-bone-dim">{copy.work.empty}</p>
          )}

          <div className="flex items-baseline justify-between gap-6 border-t border-hairline pt-5">
            <p className="u-caps font-mono text-label text-bone-faint">
              <span lang="en" dir="ltr">
                {shown}/{filtered.length}
              </span>{" "}
              {copy.work.count}
            </p>

            {remaining > 0 && (
              <Link
                href={moreHref}
                scroll={false}
                className="u-caps border-b border-hairline pb-1.5 font-mono text-label text-bone transition-colors duration-300 hover:border-fraise"
              >
                {copy.work.loadMore}
              </Link>
            )}
          </div>
        </Measure>
      </main>

      <Footer locale={locale} />
    </>
  );
}

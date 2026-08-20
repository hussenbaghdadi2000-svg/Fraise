import type { Metadata } from "next";
import { Footer } from "@/components/chrome/Footer";
import { Header } from "@/components/chrome/Header";
import { Poster } from "@/components/media/Poster";
import { Preview } from "@/components/media/Preview";
import { Slate } from "@/components/primitives/Slate";
import { BtsCard } from "@/components/work/BtsCard";
import { BTS_LINE, getBtsFilms } from "@/content/bts";
import { COPY } from "@/content/copy";
import { STUDIO } from "@/content/studio";
import { assertLocale } from "@/lib/i18n";
import { routeAlternates, routePath, routeUrl, type Route, ogUrl } from "@/lib/routes";
import { INSET } from "@/components/ui/Container";
import { Measure } from "@/components/ui/Measure";
import { NextUp } from "@/components/ui/NextUp";
import { SectionHead } from "@/components/ui/SectionHead";

/**
 * Behind the scenes.
 *
 * The only route on this site with no predecessor: the live WordPress
 * site had this content as an anchor (`/our-team/#backstage`), never as
 * a page. So nothing 301s here — it is new surface, and it has to earn
 * its indexing on content rather than inherit it.
 *
 * It earns it easily. This is the section that does the actual proving:
 * a freelancer does not have a floor to photograph, a crew to film, or
 * five behind-the-scenes films to publish.
 */

const ROUTE: Route = { kind: "bts" };

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/behind-the-scenes">): Promise<Metadata> {
  const locale = assertLocale((await params).locale);
  const studio = STUDIO[locale];
  return {
    title: `${studio.btsTitle} — Fraise Studio`,
    description: BTS_LINE[locale],
    openGraph: { images: [ogUrl(ROUTE, locale)] },
    alternates: {
      canonical: routeUrl(ROUTE, locale),
      languages: routeAlternates(ROUTE),
    },
  };
}

export default async function BehindTheScenesPage({
  params,
}: PageProps<"/[locale]/behind-the-scenes">) {
  const locale = assertLocale((await params).locale);
  const studio = STUDIO[locale];
  const copy = COPY[locale];
  const films = await getBtsFilms();

  return (
    <>
      <section className="u-scrim u-scrim-top relative w-full overflow-hidden">
        <Preview src="/media/bts-wide.mp4" auto>
          <Poster
            src="/media/bts-wide.jpg"
            alt={studio.btsTitle}
            ratio="2.39:1"
            sizes="100vw"
            preload
          />
        </Preview>

        <Header locale={locale} route={ROUTE} overlay />

        <div
          className={`absolute inset-x-0 bottom-0 z-10 ${INSET} pb-7 sm:pb-beat`}
        >
          <Slate client="Sunwhite" kind="BTS" year={2022} />
        </div>
      </section>

      <main className="flex flex-col">
        <section className={`${INSET} pt-bar pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              as="h1"
              latin="BEHIND THE SCENES"
              number={String(films.length).padStart(2, "0")}
              title={studio.btsTitle}
            />

            <div className="flex flex-col gap-beat">
              <p className="u-rise max-w-lead text-lead text-bone-dim">
                {BTS_LINE[locale]}
              </p>
              <p className="u-rise max-w-body border-t border-hairline pt-beat text-caption leading-relaxed text-bone-dim">
                {studio.btsLine}
              </p>
            </div>
          </Measure>
        </section>

        {/* Each card opens the finished film where it already lives —
            Vimeo for four of them, YouTube for the fifth. Two across:
            a behind-the-scenes frame is dense and needs the width. */}
        <section className={`${INSET} pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              number="01"
              latin="THE FILMS"
              title={copy.home.sections.work}
            />
            <div className="grid gap-8 sm:grid-cols-2 sm:gap-beat">
              {films.map((film) => (
                <BtsCard
                  key={film.id}
                  film={film}
                  locale={locale}
                  /* Two up inside the 68rem measure, not two up across
                     the viewport — 528px, not 720px. */
                  sizes="(min-width: 640px) 36vw, 92vw"
                />
              ))}
            </div>
          </Measure>
        </section>

        <section className={`${INSET} pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              number="02"
              latin="MORE"
              title={copy.home.nav.about}
            />
            <NextUp
              items={[
                {
                  href: routePath({ kind: "studio" }, locale),
                  label: copy.home.aboutMenu.story,
                },
                {
                  href: routePath({ kind: "team" }, locale),
                  label: copy.home.aboutMenu.team,
                  meta: "06",
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

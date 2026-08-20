import type { Metadata } from "next";
import { Footer } from "@/components/chrome/Footer";
import { Header } from "@/components/chrome/Header";
import { Poster } from "@/components/media/Poster";
import { Preview } from "@/components/media/Preview";
import { Slate } from "@/components/primitives/Slate";
import { ClientRail } from "@/components/sections/ClientRail";
import { getAwardNames, getClientLogos } from "@/content/projects";
import { COPY } from "@/content/copy";
import { STUDIO } from "@/content/studio";
import { assertLocale } from "@/lib/i18n";
import { routeAlternates, routePath, routeUrl, type Route, ogUrl } from "@/lib/routes";
import { INSET } from "@/components/ui/Container";
import { Measure } from "@/components/ui/Measure";
import { NextUp } from "@/components/ui/NextUp";
import { SectionHead } from "@/components/ui/SectionHead";

/**
 * The studio story.
 *
 * Every word and every number on this page is the studio's own, taken
 * from its preview site. That matters most for the four figures: until
 * now this page carried three INVENTED ones with a warning attached,
 * and they were the single biggest "must not ship" item in the handoff.
 * They are gone.
 */

const ROUTE: Route = { kind: "studio" };

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about-us">): Promise<Metadata> {
  const locale = assertLocale((await params).locale);
  const studio = STUDIO[locale];
  return {
    title: `${studio.h1} — Fraise Studio`,
    description: studio.lead,
    openGraph: { images: [ogUrl(ROUTE, locale)] },
    alternates: {
      canonical: routeUrl(ROUTE, locale),
      languages: routeAlternates(ROUTE),
    },
  };
}

export default async function StudioPage({
  params,
}: PageProps<"/[locale]/about-us">) {
  const locale = assertLocale((await params).locale);
  const studio = STUDIO[locale];
  const copy = COPY[locale];
  /* One await each. React's cache() dedupes these across the render,
     so asking here and in a sibling section is still one query. */
  const clientLogos = await getClientLogos();
  const awards = await getAwardNames();

  return (
    <>
      {/* 01 — the page opens on food, not on a paragraph about food. */}
      <section className="u-scrim u-scrim-top relative w-full overflow-hidden">
        <Preview src="/media/reel-hero.mp4" auto>
          <Poster
            src="/media/reel-hero.jpg"
            alt={studio.h1}
            ratio="2.39:1"
            sizes="100vw"
            preload
          />
        </Preview>

        <Header locale={locale} route={ROUTE} overlay />

        <div
          className={`absolute inset-x-0 bottom-0 z-10 ${INSET} pb-7 sm:pb-beat`}
        >
          <Slate
            client="Fraise Studio"
            kind="Story"
            year={2023}
          />
        </div>
      </section>

      <main className="flex flex-col">
        {/* 02 — THE STORY.

            The h1 used to sit ON the hero over a scrim, competing with
            the film for the same 200px. It reads better as the first
            thing under it, in the same head every other page uses —
            the frame's job is to be the frame, not a title card. */}
        <section className={`${INSET} pt-bar pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              as="h1"
              latin="THE STUDIO"
              number="01"
              title={studio.h1}
            />

            <div className="flex flex-col gap-beat">
              <p className="u-rise max-w-lead text-lead text-bone-dim">
                {studio.lead}
              </p>

              <div className="u-rise flex flex-col gap-8 border-t border-hairline pt-beat">
                <p className="u-display max-w-display text-subtitle font-semibold">
                  {studio.beginningTitle}
                </p>
                {studio.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="max-w-body leading-relaxed text-bone-dim"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </Measure>
        </section>

        {/* 03 — THE FIGURES. The studio's own, at last. */}
        <section className={`${INSET} pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              number="02"
              latin="WHY FRAISE"
              title={studio.figuresTitle}
            />
            <dl className="grid gap-x-8 gap-y-beat sm:grid-cols-2 lg:grid-cols-4">
              {studio.figures.map((figure) => (
                <div
                  key={figure.label}
                  className="u-rise flex flex-col gap-3 border-t border-hairline pt-5"
                >
                  <dt className="u-display text-title font-semibold">
                    <span lang="en" dir="ltr">
                      {figure.value}
                    </span>
                  </dt>
                  <dd className="text-caption text-bone-dim">{figure.label}</dd>
                </div>
              ))}
            </dl>
          </Measure>
        </section>

        {/* 04 — WHAT WE MAKE. Numbered rows on hairlines, the same
            editorial device as the capability list on the homepage. */}
        <section className={`${INSET} pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              number="03"
              latin="WHAT WE MAKE"
              title={studio.reasonsTitle}
            />
            <ol className="flex flex-col">
              {studio.reasons.map((reason, i) => (
                <li
                  key={reason.title}
                  className="u-rise grid gap-3 border-t border-hairline py-7 sm:grid-cols-12 sm:gap-8"
                >
                  {/* NOT text-fraise. The accent had leaked to a number
                      sitting at rest — the recording dot in the
                      homepage hero is the only one on the site. */}
                  <span
                    lang="en"
                    dir="ltr"
                    className="u-caps font-mono text-label text-bone-faint sm:col-span-1"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="u-display text-lead font-semibold sm:col-span-4">
                    {reason.title}
                  </p>
                  <p className="max-w-body text-caption leading-relaxed text-bone-dim sm:col-span-7">
                    {reason.body}
                  </p>
                </li>
              ))}
            </ol>
          </Measure>
        </section>

        {/* 05 — MARKETS AND CLIENTS. Marks only; the 22-name roster
            that used to sit under the rail was removed on the studio's
            instruction, here and on the homepage.

            The ten clients with no logo file are therefore invisible on
            both pages — but NOT gone from the site: `CLIENTS` still
            feeds `knowsAbout` in components/seo/JsonLd.tsx, so all 22
            ship as structured data for search. */}
        <section className={`${INSET} pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              number="04"
              latin="MARKETS & CLIENTS"
              title={studio.marketsTitle}
            />

            <div className="flex flex-col gap-beat">
              <p className="u-rise u-display max-w-lead text-subtitle font-semibold">
                {studio.markets}
              </p>

              <ClientRail
                logos={clientLogos}
                label={copy.home.sections.clients}
              />

            </div>
          </Measure>
        </section>

        {/* 06 — AWARDS, as text. As logo images on the live site they
            are invisible to search and to anyone skimming. */}
        <section className={`${INSET} pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              number="05"
              latin="RECOGNITION"
              title={studio.awardsTitle}
            />
            <div className="flex flex-col gap-beat">
              <ol className="flex flex-col">
                {awards.map((award, i) => (
                  <li
                    key={award}
                    className="u-rise flex items-baseline gap-6 border-t border-hairline py-6 sm:gap-10"
                  >
                    <span
                      lang="en"
                      dir="ltr"
                      className="u-caps shrink-0 font-mono text-label text-bone-faint"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p
                      lang="en"
                      dir="ltr"
                      className="u-display text-subtitle font-semibold"
                    >
                      {award}
                    </p>
                  </li>
                ))}
              </ol>
              <p className="u-rise max-w-body text-caption text-bone-faint">
                {studio.awardsNote}
              </p>
            </div>
          </Measure>
        </section>

        {/* 07 — the rest of the cluster. This page used to end here,
            which left the crew and the crew films reachable only from
            the menu. */}
        <section className={`${INSET} pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              number="06"
              latin="MORE"
              title={copy.home.nav.about}
            />
            <NextUp
              items={[
                {
                  href: routePath({ kind: "team" }, locale),
                  label: copy.home.aboutMenu.team,
                  meta: "06",
                },
                {
                  href: routePath({ kind: "bts" }, locale),
                  label: copy.home.aboutMenu.backstage,
                  meta: "05",
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

import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/chrome/Footer";
import { Header } from "@/components/chrome/Header";
import { Poster } from "@/components/media/Poster";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { Preview } from "@/components/media/Preview";
import { Slate } from "@/components/primitives/Slate";
import { ShowcaseCard } from "@/components/work/ShowcaseCard";
import { ClientRail } from "@/components/sections/ClientRail";
import { COPY } from "@/content/copy";
import { STUDIO } from "@/content/studio";
import {
  getAwardNames,
  getClientLogos,
  getHero,
  PILLAR_MEDIA,
  getShowcase,
} from "@/content/projects";
import { assertLocale } from "@/lib/i18n";
import { routeAlternates, routePath, routeUrl, type Route, ogUrl } from "@/lib/routes";
import { INSET } from "@/components/ui/Container";
import { Measure } from "@/components/ui/Measure";
import { SectionHead } from "@/components/ui/SectionHead";
import {
  PILLAR_KIND,
  PILLAR_RATIO,
  RATIO_CLASS,
  type Pillar,
} from "@/types/content";

const ROUTE: Route = { kind: "home" };

const PILLARS: Pillar[] = ["tvc", "recipes", "reels", "stills", "menu"];



/** Media is full-bleed; text sits in a margin. That is the rule rather
    than the exception, so the inset is something you opt into. */

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = assertLocale((await params).locale);
  return {
    openGraph: { images: [ogUrl(ROUTE, locale)] },
    alternates: {
      canonical: routeUrl(ROUTE, locale),
      languages: routeAlternates(ROUTE),
    },
  };
}

/**
 * An inline action. A rule under a word, not a button.
 *
 * The accent is on the BORDER and only on hover/focus, which is the
 * whole permitted range for `--color-fraise`: interactive state. A
 * filled accent button would be the interface shouting over the food.
 */
function Action({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="u-caps w-fit border-b border-current/30 pb-1 font-mono text-label transition-colors duration-300 hover:border-fraise"
    >
      {label}
    </Link>
  );
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = assertLocale((await params).locale);
  const home = COPY[locale].home;
  const workPath = routePath({ kind: "work" }, locale);
  const studioPath = routePath({ kind: "studio" }, locale);
  const contactPath = routePath({ kind: "contact" }, locale);

  /* The homepage reads four collections. React's cache() makes the
     repeated reads inside this render a single query each. */
  const hero = await getHero();
  const showcase = await getShowcase();
  const clientLogos = await getClientLogos();
  const awards = await getAwardNames();

  return (
    <>
      <OrganizationJsonLd locale={locale} />

      {/* ── 01 HERO ─────────────────────────────────────────────
          Rebuilt to the studio's OWN LIVE SITE: the statement centred
          on the film, a line under it, and a filled call to action.

          ⚠️ TWO LOCKED RULES REVERSED, on instruction, both one-line
          reverts:

            1. "One h1 per page and it is SMALL — the work is the hero,
               not the title." The h1 was an 11px mono line in the
               corner. It is now the display statement, centred.
            2. "`--color-fraise` is interactive state only, never a
               background." The CTA is a filled accent button.

          What did NOT change: the film still runs full-bleed behind it
          and the scrim is what makes the type legible over a moving
          image, not a colour panel. */}
      <section className="u-scrim u-scrim-top relative flex h-[88svh] w-full flex-col overflow-hidden sm:h-[92vh]">
        {/* The file carries an AUDIO track and starts muted — autoplay
            is only permitted while muted, so the button is the only way
            sound can ever begin, which is the only acceptable way. */}
        <Preview
          src="/media/reel-hero-sound.mp4"
          auto
          className="h-full w-full"
          controls={home.heroControls ?? COPY[locale].home.heroControls}
        >
          <Poster
            src={hero.poster}
            alt={hero.title[locale]}
            ratio={PILLAR_RATIO[hero.pillar]}
            sizes="100vw"
            preload
            fill
          />
        </Preview>

        {/* ⚠️ A FLAT WASH, because the edge scrims do not reach here.
            `u-scrim` fades to zero at 62% from the bottom and
            `u-scrim-top` covers only the first 30% — the middle band is
            bare video, which was fine while the type lived in the
            corners and is not fine now that it is centred. Measured on
            the real frame: the subline over the pale cheese was close
            to invisible.

            Flat, not a third gradient stacked on two others. */}
        <div className="absolute inset-0 bg-ink/45" aria-hidden />

        <Header locale={locale} route={ROUTE} overlay />

        {/* The centred block. `pointer-events-none` on the wrapper with
            it restored on the controls: this layer covers the whole
            film, and without that the video's own play/pause surface
            would be unreachable everywhere except the two buttons. */}
        <div
          className={`pointer-events-none absolute inset-0 z-1 ${INSET} flex flex-col items-center justify-center gap-7 text-center`}
        >
          <h1 className="u-enter u-display mx-auto max-w-display text-display font-semibold text-balance">
            {home.positioning}
          </h1>

          <p className="u-enter u-enter-2 mx-auto max-w-lead text-lead text-bone/85">
            {home.tagline}
          </p>

          <div className="u-enter u-enter-3 pointer-events-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-2">
            {/* The filled accent button — the reversal above. */}
            <Link
              href={contactPath}
              className="u-caps rounded-md bg-fraise px-6 py-3 font-mono text-label font-medium text-bone transition-opacity duration-300 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bone"
            >
              {home.ctaAction}
            </Link>
            <Action href={workPath} label={home.seeWork} />
          </div>
        </div>

        {/* The slate stays. It is the site's production notation and it
            sits in the corner, clear of the centred block — dropping it
            would make this the one hero on the site with no credit. */}
        <div
          className={`absolute inset-x-0 bottom-0 z-1 ${INSET} flex items-end pb-bar sm:pb-beat`}
        >
          <span className="u-enter flex items-center gap-2.5">
            <span className="size-1.5 rounded-full bg-fraise" aria-hidden />
            <Slate
              client={hero.client}
              kind={PILLAR_KIND[hero.pillar]}
              year={hero.year}
            />
          </span>
        </div>
      </section>

      <main className="flex flex-col">
        {/* 02 was a standalone positioning band: the same statement,
            the same tagline and the same two actions that now sit on
            the hero. Repeating them one screen apart read as a template,
            so the block is gone and the work starts immediately. */}

        {/* ── 03 SELECTED WORK ────────────────────────────────
            CONTAINED, and the reversal of the full-bleed editorial
            cadence that `WorkGrid` used to drive. That component and
            `lib/cadence.ts` are gone — /our-work/ and the five service
            pages now use these same cards.

            The cadence opened with one 2.39:1 frame at the full 1440 —
            602px tall, the loudest thing on a page whose loudest thing
            is meant to be the food. The studio's own reference lays this
            section out as a calm two-up inside a narrow measure with the
            caption under each frame, and it is right: a homepage
            showcase is something you READ across, and the work page is
            something you scan down. Different jobs, different grids.

            Each card still keeps its own ratio — the taxonomy is the one
            thing that does not bend — so `items-end` gives the row a
            shared baseline instead of a ragged one.

            pt-bar, not pt-movement: this follows the loudest block on
            the page and the work should arrive close behind it. */}
        <section className={`flex flex-col gap-bar pt-bar ${INSET}`}>
          <Measure className="gap-bar">
            <SectionHead
              number="01"
              latin="SELECTED WORK"
              title={home.sections.work}
              link={{ href: workPath, label: home.viewAll }}
            />

            <div className="flex flex-col gap-beat">
              {showcase.map((row, r) => (
                <div
                  key={row.pillar}
                  className="grid gap-x-8 gap-y-beat sm:grid-cols-3"
                >
                  {row.projects.map((project, i) => (
                    <ShowcaseCard
                      key={project.id}
                      project={project}
                      locale={locale}
                      index={r * 3 + i}
                      playLabel={home.playFilm}
                      /* Must track the column count above, or the
                         browser fetches a 1440px encode for a 341px
                         slot. 68rem measure, three columns, 2rem
                         gutters. */
                      sizes="(min-width: 640px) 24vw, 92vw"
                    />
                  ))}
                </div>
              ))}
            </div>
          </Measure>
        </section>

        {/* ── 04 CAPABILITIES ─────────────────────────────────
            Was a wrapped strip of five thumbnails sharing a fixed
            height. It taught the taxonomy, but it looked like a filter
            bar, and it was the one block on the page that belonged to no
            family — every other section is a contained measure, a
            hairline head and rows.

            So it is rows now, the same device as the awards in 05 and
            the reasons on /about-us/. The frame still carries the ratio
            and every frame in the column still shares ONE height, so
            width is decided purely by the format: a 2.39:1 runs 230px
            wide and a 9:16 runs 54px. Set side by side down a column
            that difference is the entire argument, and it is louder as
            a list than it was as a strip, because the eye reads the
            widths against a shared inline edge instead of against
            whatever happened to wrap next to them. */}
        <section
          id="capabilities"
          className={`${INSET} flex flex-col gap-bar pt-movement`}
        >
          <Measure className="gap-bar">
            <SectionHead
              number="02"
              latin="CAPABILITIES"
              title={home.sections.capabilities}
            />

            <ol className="flex flex-col">
              {PILLARS.map((pillar, i) => {
                const ratio = PILLAR_RATIO[pillar];
                return (
                  <li key={pillar}>
                    {/* The whole row is the link, so the target is the
                        row and not a word inside it — the same reason
                        the work card is one link. */}
                    <Link
                      href={routePath({ kind: "pillar", pillar }, locale)}
                      /* ⚠️ STACKED below sm, a 12-column grid above it.
                         Three things pinned to the two edges of one row
                         was fine at 1440 and wrong at both ends: at
                         2560 the name and the frame ended up 1500px
                         apart, and at 320 the frame is `shrink-0` and
                         the ratio is fixed, so the name was squeezed
                         to whatever was left — which was almost
                         nothing. Stacking gives the name the full
                         width on a phone; proportional columns keep
                         the reading order on everything else. */
                      className="group u-rise flex flex-col gap-4 border-t border-hairline py-5 transition-colors duration-500 hover:border-fraise focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fraise sm:grid sm:grid-cols-12 sm:items-center sm:gap-8 sm:py-7"
                    >
                      <div className="flex min-w-0 items-baseline gap-5 sm:col-span-8 sm:gap-10">
                        <span
                          lang="en"
                          dir="ltr"
                          className="u-caps font-mono text-label text-bone-faint"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {/* ⚠️ NO `overflow-wrap: anywhere` HERE, EVER.
                            It was added to let this row shrink at 320px
                            and it "worked" — by breaking the name to
                            ONE CHARACTER PER LINE. In Arabic that is
                            not just ugly: the script is connected, so
                            breaking mid-word shatters a word into
                            isolated letterforms. The overflow audit
                            passed the whole time, because the text
                            collapsed instead of overflowing. Stacking
                            the row is the actual fix. */}
                        <p className="u-display min-w-0 text-subtitle font-semibold transition-colors duration-500 group-hover:text-bone-dim">
                          {home.pillar[pillar]}
                        </p>
                      </div>

                      {/* The ratio used to sit here, in the middle of
                          the row. Removed with the other six: the Stage 1
                          brief asks for a project name on every video and
                          "minimal text throughout", and names the aspect
                          ratio only as an ASSET SPEC. The frame beside
                          this row still shows the shape, which is the
                          part a visitor can actually read.

                          The name column takes the freed span, so the row
                          is still three anchors wide at 2560. */}

                      {/* One shared height for all five; the ratio picks
                          the width. shrink-0 matters — without it flex
                          would compress the wide frames toward the
                          narrow ones and erase the comparison. */}
                      <div className="h-16 shrink-0 sm:col-span-4 sm:h-24 sm:justify-self-end">
                        <div className={`h-full ${RATIO_CLASS[ratio]}`}>
                          <Preview
                            src={`/media/${PILLAR_MEDIA[pillar]}.mp4`}
                            className="h-full w-full"
                          >
                            <Poster
                              src={`/media/${PILLAR_MEDIA[pillar]}.jpg`}
                              alt={home.pillar[pillar]}
                              ratio={ratio}
                              sizes="240px"
                              fill
                            />
                          </Preview>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>

            <p className="u-rise max-w-body text-caption text-bone-dim">
              {home.capabilitiesNote}
            </p>
          </Measure>
        </section>

        {/* ── 05 RECOGNITION ──────────────────────────────────
            Awards and clients were two separate sections, and the awards
            lost: a Cannes Silver Lion was set at 11px under a client
            list. It is the strongest credibility the studio has.

            Merging them also fixes a real redundancy — the logo wall in
            02 and a client list here were the same claim twice. Logos
            near the top do recognition, which is what an 80ms glance
            can do; the names down here are searchable text next to the
            juries that back them up. */}
        <section className={`${INSET} flex flex-col pt-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              number="03"
              latin="RECOGNITION"
              title={home.sections.awards}
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
              <p className="u-rise max-w-body text-caption text-bone-dim">
                {home.awardsNote}
              </p>
            </div>

          {/* The client names, set in type. A greyscale logo grid is what
              a vendor shows; names set as typography read as a client
              list — and they are searchable text, not images. */}
          <div className="u-rise flex flex-col gap-6">
            <p className="u-caps font-mono text-label text-bone-faint">
              {home.sections.clients}
            </p>

            {/* ⚠️ MARKS ONLY. There was a 22-name roster set in type
                under this rail; the studio asked for it gone, twice.

                The cost is recorded because it is not visible: TEN
                clients have no logo file — Knorr, Durra, Al Sayad,
                Baker, AlWatanyeh, Altahooneh, Jordina, JoSweet,
                Skyworth, Tohfa — and they now appear nowhere on this
                page. `CLIENT_CARDS` in content/projects.ts still holds
                all 22, so restoring them is a `.map()`, not a
                re-recovery. */}
            <ClientRail logos={clientLogos} label={home.sections.clients} />

            <p className="font-mono text-label text-bone-faint">
              {home.clientsNote}
            </p>
            </div>
          </Measure>
        </section>

        {/* ── 06 THE STUDIO ───────────────────────────────────
            The studio-not-freelancer proof, and a real section rather
            than a footer link. The frame carries the crew jacket, which
            argues it better than the copy does. */}
        <section
          id="studio"
          className={`${INSET} flex flex-col pt-movement`}
        >
          <Measure className="gap-bar">
            <SectionHead
              number="04"
              latin="THE STUDIO"
              title={home.sections.studio}
              link={{ href: studioPath, label: home.moreStudio }}
            />
            <div className="grid gap-beat sm:grid-cols-12 sm:gap-beat">
            <div className="u-rise flex flex-col gap-beat sm:col-span-7">
              <p className="max-w-lead text-lead text-bone">{home.studioBody}</p>
              {/* text-title, not text-display. Four figures at display
                  size made this the loudest block on a page whose loudest
                  thing is supposed to be the food. */}
              <dl className="flex flex-wrap gap-x-14 gap-y-8">
                {STUDIO[locale].figures.map((figure) => (
                  <div key={figure.label} className="flex flex-col gap-2">
                    <dt className="u-display text-title font-semibold">
                      <span lang="en" dir="ltr">
                        {figure.value}
                      </span>
                    </dt>
                    <dd className="u-caps font-mono text-label text-bone-faint">
                      {figure.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="u-rise sm:col-span-4 sm:col-start-9">
              <Preview src="/media/studio-bts.mp4">
                <Poster
                  src="/media/studio-bts.jpg"
                  alt={home.sections.studio}
                  ratio="4:5"
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </Preview>
            </div>
            </div>
          </Measure>
        </section>
      </main>

      {/* ── 07 THE CLOSE ────────────────────────────────────────
          Was a second white band answering the first. Both are gone —
          the close now earns its weight from a hairline, a full
          movement of space above it, and being the last thing said.

          The studio's own reference puts a saturated red panel here.
          That is the one thing the direction rules out: `--color-fraise`
          is interactive state, never a ground. The accent stays on the
          rule under the action, where a pointer can earn it. */}
      <section className={`${INSET} pt-movement pb-movement`}>
        <Measure className="gap-8">
          <div className="h-px w-full bg-hairline" />
          <p className="u-rise u-display max-w-display text-title font-semibold">
            {home.ctaLine}
          </p>
          <div className="u-rise">
            <Action href={contactPath} label={home.ctaAction} />
          </div>
        </Measure>
      </section>

      {/* cta={false}: the close above IS the call to action. The footer
          repeating it one screen later would read as a template. */}
      <Footer locale={locale} cta={false} />
    </>
  );
}

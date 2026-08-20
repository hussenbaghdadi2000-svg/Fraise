import type { Metadata } from "next";
import { Footer } from "@/components/chrome/Footer";
import { Header } from "@/components/chrome/Header";
import { Poster } from "@/components/media/Poster";
import { Preview } from "@/components/media/Preview";
import { Slate } from "@/components/primitives/Slate";
import { COPY } from "@/content/copy";
import { TEAM_HEADING, getTeam } from "@/content/team";
import { assertLocale } from "@/lib/i18n";
import { routeAlternates, routePath, routeUrl, type Route, ogUrl } from "@/lib/routes";
import { INSET } from "@/components/ui/Container";
import { Measure } from "@/components/ui/Measure";
import { NextUp } from "@/components/ui/NextUp";
import { SectionHead } from "@/components/ui/SectionHead";

/**
 * The crew.
 *
 * `/our-team/` is a LIVE URL on the WordPress site in both locales. It
 * was a redirect target for one commit; making it a real page again
 * removes two redirects and keeps whatever ranking it holds.
 *
 * THE HEADING COUNTS DISCIPLINES, NOT HEADS. The analysis flagged the
 * live roster as arguing against the positioning — six people, three
 * sharing a surname, on the page whose job is proving "not one person
 * with a camera". The studio's own preview solved it better than
 * removing the people would have: it leads with "six disciplines, one
 * visual eye" and gives every name a role above the bio. Both are kept.
 */

const ROUTE: Route = { kind: "team" };

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/our-team">): Promise<Metadata> {
  const locale = assertLocale((await params).locale);
  const heading = TEAM_HEADING[locale];
  return {
    title: `${heading.title} — Fraise Studio`,
    description: heading.line,
    openGraph: { images: [ogUrl(ROUTE, locale)] },
    alternates: {
      canonical: routeUrl(ROUTE, locale),
      languages: routeAlternates(ROUTE),
    },
  };
}

export default async function TeamPage({
  params,
}: PageProps<"/[locale]/our-team">) {
  const locale = assertLocale((await params).locale);
  const heading = TEAM_HEADING[locale];
  const copy = COPY[locale];
  const crew = await getTeam();

  return (
    <>
      <section className="u-scrim u-scrim-top relative w-full overflow-hidden">
        <Preview src="/media/bts-jordina.mp4" auto>
          <Poster
            src="/media/bts-jordina.jpg"
            alt={heading.title}
            /* A 16:9 source in a 2.39:1 box — object-cover takes the
               middle band, which is where the crew is standing. */
            ratio="2.39:1"
            sizes="100vw"
            preload
          />
        </Preview>

        <Header locale={locale} route={ROUTE} overlay />

        <div
          className={`absolute inset-x-0 bottom-0 z-10 ${INSET} pb-7 sm:pb-beat`}
        >
          <Slate client="Jordina" kind="BTS" year={2022} />
        </div>
      </section>

      <main className="flex flex-col">
        {/* The heading was an 11px mono label with a `text-display`
            sentence under it — a caption pretending to be a title,
            above the largest type on the site. It is the same head
            every other page uses now, and the count is the number of
            disciplines, which is the argument this page exists to
            make. */}
        <section className={`${INSET} pt-bar pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              as="h1"
              latin="THE CREW"
              number={String(crew.length).padStart(2, "0")}
              title={heading.title}
            />
            <p className="u-rise max-w-lead text-lead text-bone-dim">
              {heading.line}
            </p>
          </Measure>
        </section>

        <section className={`${INSET} pb-movement`}>
          <Measure>
            {/* ⚠️ THIS CARD IS A DELIBERATE REVERSAL OF THREE LOCKED
                RULES, made on the studio's instruction from its own
                reference. All three are one-line reverts.

                  1. `border-radius: 0. Always.` — the avatar is a
                     circle and the card is rounded.
                  2. `--color-fraise` is interactive state only — the
                     role sits in the accent at rest.
                  3. Cards are hairlines and whitespace, never a raised
                     surface — this one has a ground.

                The reference is a LIGHT page. That part is not carried
                over, because the studio asked two changes ago to take
                the white out of the site, and a white card here would
                undo that on the one page it is loudest. `bg-ink-raised`
                is the same lift the loading skeleton already uses. */}
            <ul className="grid gap-x-8 gap-y-movement pt-bar sm:grid-cols-2 lg:grid-cols-3">
              {crew.map((member, i) => (
                <li
                  key={member.id}
                  className="group u-rise relative flex flex-col items-center gap-4 rounded-3xl border border-hairline bg-ink-raised px-6 pt-16 pb-8 text-center transition-colors duration-500 hover:border-fraise"
                >
                  {/* The avatar overhangs the card's top edge.

                      `inset-x-0` + `justify-center` rather than
                      `start-1/2` + a translate: `translate-x` is a
                      PHYSICAL property and would push the circle the
                      wrong way in Arabic. Centring with flex has no
                      direction. */}
                  <div className="absolute inset-x-0 -top-14 flex justify-center">
                    <div className="u-portrait size-28 overflow-hidden rounded-full border border-hairline">
                      <Poster
                        src={`/media/team-${member.id}.jpg`}
                        alt={member.name[locale]}
                        ratio="1:1"
                        sizes="112px"
                      />
                    </div>
                  </div>

                  {/* Both names.

                      ⚠️ THE PAGE'S OWN LANGUAGE GOES FIRST IN THE DOM,
                      not English. In an RTL paragraph the first inline
                      child is laid out at the RIGHT, so putting the
                      Latin name first rendered it on the right and the
                      Arabic on the left — the mirror image of the
                      reference. Locale-first is also the honest
                      reading order: the primary name, then the other.

                      min-h reserves two lines. "Ahmad Al Sbaihat" wraps
                      and "Omar Aqraa" does not, and without it the role
                      under a wrapped name sat 27px below its
                      neighbours. 2.56em is two lines at this token's
                      1.28 line-height, in the element's own font-size,
                      so it does not drift with the Arabic root bump. */}
                  <p className="u-display flex min-h-[2.56em] items-center text-subtitle font-semibold">
                    <span>
                      <span lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
                        {member.name[locale]}
                      </span>
                      {" — "}
                      <span
                        lang={locale === "ar" ? "en" : "ar"}
                        dir={locale === "ar" ? "ltr" : "rtl"}
                      >
                        {locale === "ar" ? member.name.en : member.name.ar}
                      </span>
                    </span>
                  </p>

                  <p
                    lang="en"
                    dir="ltr"
                    className="u-caps min-h-[3em] font-mono text-label text-fraise"
                  >
                    {member.role}
                  </p>

                  <p className="max-w-body text-caption leading-relaxed text-bone-dim">
                    {member.bio[locale]}
                  </p>

                  {/* The index, kept from the previous card — it is the
                      only thing tying this block back to the numbered
                      grammar the rest of the site runs on.

                      `mt-auto` puts it at the FOOT of the card rather
                      than directly under a bio whose length varies by
                      three lines. The grid already stretches every card
                      in a row to one height; this is what makes that
                      height do something. */}
                  <span
                    lang="en"
                    dir="ltr"
                    aria-hidden
                    className="u-caps mt-auto pt-2 font-mono text-label text-bone-faint"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </li>
              ))}
            </ul>
          </Measure>
        </section>

        <section className={`${INSET} pb-movement`}>
          <Measure className="gap-bar">
            <SectionHead
              number="01"
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

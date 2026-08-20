import type { Metadata } from "next";
import { Preview } from "@/components/media/Preview";
import { Poster } from "@/components/media/Poster";
import { Slate } from "@/components/primitives/Slate";
import { PILLAR_MEDIA } from "@/content/projects";
import { COPY } from "@/content/copy";
import { assertLocale } from "@/lib/i18n";
import { PILLAR_RATIO } from "@/types/content";
import type { Pillar } from "@/types/content";

/* A development reference, not part of the site. It must never be
   indexed and it is deliberately absent from lib/routes.ts — nothing
   links to it. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * TEMPORARY reference page for Steps 1–2.
 *
 * This is not the homepage. It exists so the design system is visible
 * and reviewable before we build anything on top of it. It gets
 * replaced when we build the real homepage in Step 5.
 *
 * Note there is no "use client" anywhere in this file or its imports —
 * this whole page ships zero JavaScript of our own.
 */

/** Token names and hex values are identifiers, not copy. They do not
    translate; only the note beside them does. */
const PALETTE = [
  { name: "ink", hex: "#0B0B0C" },
  { name: "ink-raised", hex: "#131315" },
  { name: "bone", hex: "#F2EFE9" },
  { name: "bone-dim", hex: "#A8A49C" },
  { name: "bone-faint", hex: "#6E6A64" },
  { name: "fraise", hex: "#C8402F" },
] as const;

/** Slate content is Latin in both locales by design, so these labels
    are not part of the copy dictionary. */
const PILLARS: { pillar: Pillar; label: string; client: string; year: number }[] =
  [
    { pillar: "tvc", label: "TVC", client: "Jordina", year: 2023 },
    { pillar: "recipes", label: "Recipes", client: "Zaity", year: 2024 },
    { pillar: "reels", label: "Reels", client: "KFC", year: 2024 },
    { pillar: "stills", label: "Stills", client: "Thuraya", year: 2023 },
    { pillar: "menu", label: "Menu", client: "JoSweet", year: 2023 },
  ];

const FRAME_WIDTH: Record<Pillar, string> = {
  tvc: "w-[300px]",
  recipes: "w-[210px]",
  reels: "w-[120px]",
  stills: "w-[150px]",
  menu: "w-[170px]",
};

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 border-t border-hairline pt-beat">
      <div className="flex flex-col gap-3">
        <p className="u-caps flex gap-4 font-mono text-label text-bone-faint">
          <span className="text-fraise">{number}</span>
          <span>{title}</span>
        </p>
      </div>
      {children}
    </section>
  );
}

export default async function StyleReferencePage({
  params,
}: PageProps<"/[locale]">) {
  const locale = assertLocale((await params).locale);
  const copy = COPY[locale];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-beat px-gutter py-bar sm:px-gutter-lg">
      <header className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between gap-6">
          <p className="u-caps font-mono text-label text-bone-faint">
            {copy.eyebrow}
          </p>
          <span className="u-caps font-mono text-label text-bone-faint">
            reference
          </span>
        </div>
        <h1 className="u-display max-w-display text-title font-semibold">
          {copy.title}
        </h1>
        <p className="max-w-body text-bone-dim">{copy.intro}</p>
      </header>

      <Section number="01" title={copy.sections.colour}>
        <div className="grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-3">
          {PALETTE.map((c) => (
            <div key={c.name} className="flex flex-col gap-3 bg-ink p-4">
              <div
                className="h-14 border border-hairline"
                style={{ background: c.hex }}
              />
              <div className="flex flex-col gap-1">
                <span
                  lang="en"
                  dir="ltr"
                  className="u-caps block font-mono text-label text-bone-dim"
                >
                  {c.name}
                </span>
                <span className="font-mono text-label text-bone-faint">
                  <span lang="en" dir="ltr">
                    {c.hex}
                  </span>{" "}
                  · {copy.paletteNote[c.name]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section number="02" title={copy.sections.typography}>
        <div className="flex flex-col gap-7">
          <p className="u-display text-display font-semibold">
            {copy.displaySample}
          </p>
          <p className="max-w-body text-bone-dim">{copy.bodySample}</p>
          <Slate client="Jordina" kind="TVC" year={2023} />
        </div>
      </Section>

      <Section number="03" title={copy.sections.arabic}>
        <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
          {/* Both blocks declare their own lang and dir, so this
              comparison reads identically whichever locale you are in. */}
          <div className="flex flex-col gap-3 bg-ink p-6" lang="en" dir="ltr">
            <p className="u-caps font-mono text-label text-bone-faint">
              English · LTR
            </p>
            <p className="text-lead">
              We make the image that makes the product seen and remembered.
            </p>
          </div>
          <div className="flex flex-col gap-3 bg-ink p-6" lang="ar" dir="rtl">
            <p className="u-caps font-mono text-label text-bone-faint">
              العربية · RTL
            </p>
            <p className="text-lead">
              نصنع الصورة التي تجعل المنتج يُرى ويُتذكّر
            </p>
          </div>
        </div>
        <p className="max-w-body text-caption text-bone-dim">{copy.arabicNote}</p>
      </Section>

      <Section number="04" title={copy.sections.ratio}>
        <div className="flex flex-wrap items-end gap-6">
          {PILLARS.map((p) => {
            const ratio = PILLAR_RATIO[p.pillar];
            return (
              <div key={p.pillar} className="flex flex-col gap-3">
                <div className={FRAME_WIDTH[p.pillar]}>
                  {/* Preview is a Client Component. Poster and Slate
                      inside it are Server Components, handed over as
                      children — so the card markup never crosses into
                      the client bundle. */}
                  <Preview src={`/media/${PILLAR_MEDIA[p.pillar]}.mp4`}>
                    <Poster
                      src={`/media/${PILLAR_MEDIA[p.pillar]}.jpg`}
                      alt={`${p.client} — ${p.label}`}
                      ratio={ratio}
                      sizes="(min-width: 640px) 300px, 50vw"
                    />
                  </Preview>
                </div>
                <Slate
                  client={p.client}
                  kind={p.label}
                  year={p.year}
                />
              </div>
            );
          })}
        </div>
        <p className="max-w-body text-caption text-bone-dim">{copy.ratioNote}</p>
        <p className="max-w-body text-caption text-bone-dim">{copy.hoverNote}</p>
      </Section>

      <Section number="05" title={copy.sections.state}>
        <div className="flex flex-col gap-4">
          <p className="max-w-body text-caption text-bone-dim">
            {copy.stateNote.before}{" "}
            <kbd lang="en" dir="ltr" className="font-mono text-bone">
              {copy.stateNote.key}
            </kbd>{" "}
            {copy.stateNote.after}
          </p>
          <a
            href="#"
            className="u-caps w-fit border-b border-hairline pb-1 font-mono text-label text-bone transition-colors duration-300 hover:border-fraise"
          >
            {copy.focusLabel}
          </a>
        </div>
      </Section>
    </main>
  );
}

import Link from "next/link";
import { Poster } from "@/components/media/Poster";
import { Preview } from "@/components/media/Preview";
import { routePath } from "@/lib/routes";
import { PILLAR_KIND, PILLAR_RATIO } from "@/types/content";
import type { Locale, Project } from "@/types/content";

/**
 * The homepage's work card. A Server Component.
 *
 * DIFFERENT FROM `WorkCard`, on purpose, and the difference is the
 * studio's own call: on `/our-work/` the label sits ON the media over a
 * scrim, because that page is a dense grid where a caption under every
 * frame would double its height. Here the caption sits BELOW the frame,
 * which is how the studio's reference lays out its homepage — the media
 * stays uncovered, and the title gets to be read rather than scrimmed.
 *
 * Each card keeps its OWN ratio. The reference happens to show four
 * 16:9 frames; forcing every piece to 16:9 would throw away the one
 * thing the frame is supposed to tell you before the label does.
 * `items-end` on the grid gives the mismatched heights a shared
 * baseline, so the difference reads as composition.
 */
export interface ShowcaseCardProps {
  project: Project;
  locale: Locale;
  index: number;
  sizes: string;
  /** True only for the single card that is the LCP element. */
  preload?: boolean;
  /** "PLAY FILM" — Latin in both locales, like every other credit. */
  playLabel: string;
}

export function ShowcaseCard({
  project,
  locale,
  index,
  sizes,
  preload,
  playLabel,
}: ShowcaseCardProps) {
  const ratio = PILLAR_RATIO[project.pillar];

  return (
    <Link
      /* ⚠️ THE PROJECT, not its pillar. Every card on this site used
         to land on the pillar page — clicking one film took you to a
         list that contained it, which is the opposite of what a click
         promises. */
      href={routePath({ kind: "project", slug: project.slug }, locale)}
      className="group u-rise @container flex flex-col gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fraise"
    >
      <div className="relative overflow-hidden">
        <Preview src={project.preview}>
          <Poster
            src={project.poster}
            alt={project.title[locale]}
            ratio={ratio}
            sizes={sizes}
            preload={preload}
          />
        </Preview>

        {/* The play affordance, visible AT REST. A hover-only cue tells
            a phone nothing, and every second visitor is on a phone.
            Hover raises it rather than introducing it. */}
        <span
          aria-hidden
          lang="en"
          dir="ltr"
          className="u-caps absolute end-3 bottom-3 z-10 flex items-center gap-1.5 border border-hairline bg-ink/70 px-2.5 py-1 font-mono text-label text-bone-dim transition-colors duration-500 group-hover:border-fraise group-hover:text-bone"
        >
          {playLabel}
          {/* NOT u-mirror. A play triangle is a transport control tied
              to a timeline, not a directional icon — every player on
              every platform points it the same way in Arabic as in
              English, and the direction rule already exempts media. */}
          <span className="inline-block">
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M1 0.5 8 4.5 1 8.5Z" fill="currentColor" />
            </svg>
          </span>
        </span>
      </div>

      {/* The caption row. Title at the inline START, production credit at
          the inline END — both logical, so the whole row mirrors in
          Arabic with no direction-specific code.

          ⚠️ A CONTAINER QUERY, not a breakpoint. This card renders three
          up on the homepage (341px) and four up in the tall bands on
          /our-work/ (248px) at the SAME viewport width, so a `sm:` rule
          cannot tell those apart — and at 248px the credit and the
          format label collided and both wrapped to two lines. The card
          asks how wide IT is, which is the only question with an
          answer here. */}
      <div className="flex flex-col gap-2 @[19rem]:flex-row @[19rem]:items-baseline @[19rem]:justify-between @[19rem]:gap-6">
        <div className="flex flex-col gap-1.5">
          <p
            lang="en"
            dir="ltr"
            className="u-caps font-mono text-label text-bone-faint"
          >
            {PILLAR_KIND[project.pillar]} / {String(index + 1).padStart(2, "0")}
          </p>
          <p className="u-display text-subtitle font-semibold text-bone transition-colors duration-500 group-hover:text-bone-dim">
            {project.title[locale]}
          </p>
        </div>

        <p
          lang="en"
          dir="ltr"
          className="u-caps font-mono text-label text-bone-faint @[19rem]:shrink-0"
        >
          {project.client} · {project.year}
        </p>
      </div>
    </Link>
  );
}

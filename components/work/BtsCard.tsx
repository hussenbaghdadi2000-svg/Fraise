import { Poster } from "@/components/media/Poster";
import { Slate } from "@/components/primitives/Slate";
import type { BtsFilm } from "@/content/bts";
import type { Locale } from "@/types/content";

/**
 * One behind-the-scenes film. A Server Component.
 *
 * It is an `<a>`, not a `<Link>`, and that is correct rather than lazy:
 * the destination is Vimeo or YouTube. `next/link` is for in-app
 * navigation; using it for an external URL buys nothing and asks the
 * router to prefetch a route it does not own.
 *
 * NO `<Preview>` HERE. Everywhere else on the site a poster crossfades
 * into a silent loop, because the loop is the point. Here the poster is
 * a doorway to a real film with sound, and a muted teaser playing
 * underneath a play button would be saying two things at once. The
 * affordance IS the promise.
 */
export interface BtsCardProps {
  film: BtsFilm;
  locale: Locale;
  sizes: string;
}

export function BtsCard({ film, locale, sizes }: BtsCardProps) {
  return (
    <a
      href={film.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group u-rise block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fraise"
    >
      <figure className="flex flex-col gap-3">
        <div className="u-scrim relative overflow-hidden">
          <Poster
            src={`/media/${film.id}.jpg`}
            alt={film.title[locale]}
            ratio="16:9"
            sizes={sizes}
          />

          {/* The play affordance. Centred, ringed, and the ring is the
              only thing that takes the accent — on hover, per the rule
              that colour is interactive state and nothing else. */}
          <span
            aria-hidden
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <span className="flex size-14 items-center justify-center rounded-full border border-bone/40 bg-ink/30 text-bone transition-colors duration-300 group-hover:border-fraise sm:size-16">
              {/* Does NOT mirror. A play triangle is a transport
                  control tied to a timeline, not a directional icon —
                  every player points it the same way in Arabic as in
                  English. This said the opposite and did the opposite;
                  ShowcaseCard was corrected first. */}
              <svg
                width="16"
                height="18"
                viewBox="0 0 16 18"
                fill="currentColor"
                className="ms-0.5"
              >
                <path d="M0 0l16 9-16 9z" />
              </svg>
            </span>
          </span>
        </div>

        <figcaption className="flex flex-col gap-1.5">
          <p className="u-display text-lead font-semibold">
            {film.title[locale]}
          </p>
          <Slate
            client={film.client}
            kind="BTS"
            year={film.year}
          />
        </figcaption>
      </figure>
    </a>
  );
}

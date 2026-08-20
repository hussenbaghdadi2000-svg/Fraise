/**
 * The client marquee. A Server Component, and 0 kB of JavaScript.
 *
 * Auto-scrolling, built on a CSS keyframe over a track that holds the
 * logo set twice and slides exactly -50%. No carousel library, no
 * autoplay timer, no state — see `.u-marquee` in app/globals.css for
 * the direction and reduced-motion branches, both of which matter more
 * than the animation itself.
 *
 * ⚠️ THE PLATE IS THE ONLY WHITE LEFT ON THE SITE, and it is not a
 * relapse. Brand marks arrive in every colour and Zalatimo's is a JPEG
 * — an opaque white rectangle is baked into the file — so a mark on
 * ink is either invisible or a lie about someone else's artwork. The
 * white is bounded to a card, the way a logo sheet prints, instead of
 * being a full-width band that made the room stop being black. The
 * page ground never changes.
 *
 * ⚠️ NO VISIBLE CAPTION. Every plate used to carry the brand name in
 * mono underneath it, which said the same thing twice — the mark, then
 * its name. `alt` still carries the name for screen readers and
 * crawlers, so nothing is lost for machines.
 */
export interface ClientRailProps {
  logos: { name: string; logo: string }[];
  /** Names the scroll region for assistive tech. */
  label: string;
}

export function ClientRail({ logos, label }: ClientRailProps) {
  return (
    <div
      role="region"
      aria-label={label}
      /* Focusable so the keyboard can reach it — and because focus is
         what pauses the marquee. Under reduced motion this same
         container becomes a real scroller, and a scroll container is
         not focusable by default. */
      tabIndex={0}
      className="u-marquee-wrap u-rise focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fraise"
    >
      {/* ⚠️ THE GAP IS ON THE CARD, NOT ON THE TRACK.
          
          With flex `gap`, a track of 2N cards holds 2N-1 gaps, so half
          the track is N cards + N-0.5 gaps — half a gap SHORT of one
          set. Translating -50% therefore lands 12px off every cycle
          and the loop hitches. Measured, not guessed: half-track 1926px
          against a 1938px set.
          
          `me-*` on each card makes every unit card+gap, so 2N units
          halve to exactly N. `me` and not `mr`, so it mirrors. */}
      <div className="u-marquee flex">
        {/* The set twice. The second copy is what the first slides into,
            and it is aria-hidden so assistive tech reads twelve clients
            rather than twenty-four. */}
        {[...logos, ...logos].map((client, i) => {
          const clone = i >= logos.length;
          return (
            <div
              key={`${client.name}-${i}`}
              aria-hidden={clone || undefined}
              /* Square and rounded, per the studio's reference. The
                 radius is a documented reversal of `border-radius: 0.
                 Always.` — the same reversal already made on the crew
                 cards, kept consistent rather than half-applied. */
              className="me-4 flex size-28 shrink-0 items-center justify-center rounded-2xl bg-white p-5 sm:me-6 sm:size-32 sm:p-6"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- see
                  components/media/Poster.tsx: next/image costs 4.3 kB
                  brotli for features this project does not use. */}
              <img
                src={client.logo}
                alt={clone ? "" : client.name}
                loading="lazy"
                decoding="async"
                /* CONTAINED, never cover: marks arrive at wildly
                   different aspect ratios and cover would crop a
                   wordmark. */
                className="max-h-full max-w-full object-contain"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

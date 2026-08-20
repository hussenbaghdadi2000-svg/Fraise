import { RATIO_CLASS, type Ratio } from "@/types/content";

/**
 * A still frame in its pillar's native aspect ratio.
 *
 * A Server Component — it ships no JavaScript.
 *
 * The box declares its ratio BEFORE the image loads, which is the whole
 * CLS strategy: the space is already reserved, so nothing below it moves
 * when the bytes arrive. No border-radius, ever.
 *
 * WHY A PLAIN <img> AND NOT next/image — measured, not assumed:
 *
 *     baseline (step 3)          114.9 kB brotli
 *     + next/image               119.2 kB   (+4.3)
 *     + the whole video system   119.7 kB   (+0.5)
 *
 * next/image costs nine times what the entire hover-preview and decoder
 * system costs, and it left 0.3 kB of a 120 kB budget with the mobile
 * player and hero still unbuilt. What it buys is on-demand resizing and
 * format negotiation — real features, but ones this project does not
 * need: a production studio exports its own encodes at known sizes, the
 * aspect ratios are fixed by the taxonomy, and there is no art direction
 * to switch between.
 *
 * What we keep for free, natively: lazy loading, async decoding,
 * fetchpriority, and srcset when we choose to pass one.
 *
 * If this ever needs to become next/image again, the trade is: find
 * 4.3 kB somewhere else first.
 */
export interface PosterProps {
  src: string;
  /** Real alt text. The <video> layered over it is decorative. */
  alt: string;
  ratio: Ratio;
  /** Pre-exported widths, e.g. "/m/a-640.jpg 640w, /m/a-1280.jpg 1280w". */
  srcSet?: string;
  sizes?: string;
  /**
   * Only for the ONE image that is the LCP element, above the fold.
   * Loads eagerly at high priority instead of lazily.
   */
  preload?: boolean;
  /**
   * Fill the nearest positioned ancestor instead of creating an aspect
   * box. For the hero only, where the height is a viewport fraction and
   * the frame crops rather than letterboxes.
   */
  fill?: boolean;
}

export function Poster({
  src,
  alt,
  ratio,
  srcSet,
  sizes,
  preload = false,
  fill = false,
}: PosterProps) {
  const image = (
    /* eslint-disable-next-line @next/next/no-img-element -- deliberate:
       next/image costs 4.3 kB brotli for features this project does not
       use. See the note above before changing this. */
    <img
      src={src}
      alt={alt}
      srcSet={srcSet}
      sizes={sizes}
      loading={preload ? "eager" : "lazy"}
      fetchPriority={preload ? "high" : undefined}
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );

  if (fill) return image;

  return (
    <div className={`relative ${RATIO_CLASS[ratio]} overflow-hidden bg-ink-raised`}>
      {image}
    </div>
  );
}

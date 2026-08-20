import { RATIO_CLASS } from "@/types/content";
import { INSET } from "@/components/ui/Container";
import { Measure } from "@/components/ui/Measure";

/**
 * The skeleton for /our-work/.
 *
 * This route is server-rendered on demand because it reads
 * `searchParams` — so every filter click and every "load more" costs a
 * round trip. Without this file the page simply held still for a few
 * hundred milliseconds and the click felt ignored. Next wraps the page
 * in a Suspense boundary automatically once `loading.tsx` exists.
 *
 * No spinner. A spinner says "something is happening somewhere"; these
 * boxes say "work is arriving, in these shapes, at these positions" —
 * and because they reuse the real ratio utilities AND the real measure,
 * nothing shifts when the content replaces them. The skeleton IS the
 * layout.
 *
 * ⚠️ Which means it has to track the page's grid. It was still drawing
 * the old full-bleed cadence after the page moved to grouped three-up
 * bands — a skeleton that guarantees the shift it exists to prevent.
 *
 * `u-rise` is deliberately absent: a reveal animation on a placeholder
 * would animate something that is about to be thrown away.
 */

function Box({ ratio }: { ratio: keyof typeof RATIO_CLASS }) {
  return (
    <div
      className={`${RATIO_CLASS[ratio]} w-full animate-pulse bg-ink-raised`}
      aria-hidden
    />
  );
}

/** One format band: a rule, two labels, and a three-up row of frames. */
function Band({
  ratio,
  count,
}: {
  ratio: keyof typeof RATIO_CLASS;
  count: number;
}) {
  return (
    <div className="flex flex-col gap-beat">
      <div className="flex items-baseline justify-between gap-6 border-t border-hairline pt-5">
        <div className="h-3 w-24 animate-pulse bg-ink-raised" aria-hidden />
        <div className="h-3 w-16 animate-pulse bg-ink-raised" aria-hidden />
      </div>

      <div className="grid gap-x-8 gap-y-beat sm:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex flex-col gap-4">
            <Box ratio={ratio} />
            <div className="flex flex-col gap-1.5">
              <div
                className="h-2.5 w-16 animate-pulse bg-ink-raised"
                aria-hidden
              />
              <div
                className="h-4 w-28 animate-pulse bg-ink-raised"
                aria-hidden
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div
      className={`${INSET} pt-bar pb-movement`}
      /* One live announcement for assistive tech, instead of narrating
         a dozen decorative boxes. */
      role="status"
      aria-live="polite"
      aria-label="Loading work"
    >
      <Measure className="gap-bar">
        {/* The head: hairline, mono label, heading. */}
        <div className="flex flex-col gap-5">
          <div className="h-px w-full bg-hairline" />
          <div className="h-3 w-24 animate-pulse bg-ink-raised" aria-hidden />
          <div className="h-8 w-48 animate-pulse bg-ink-raised" aria-hidden />
        </div>

        <div className="flex flex-col gap-beat">
          <div
            className="h-4 w-full max-w-lead animate-pulse bg-ink-raised"
            aria-hidden
          />
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-3 w-20 animate-pulse bg-ink-raised"
                aria-hidden
              />
            ))}
          </div>
        </div>

        <Band ratio="2.39:1" count={3} />
        <Band ratio="16:9" count={3} />
      </Measure>
    </div>
  );
}

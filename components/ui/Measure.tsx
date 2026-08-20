/**
 * The page measure.
 *
 * Every content block sits in the SAME 68rem column. That is the whole
 * reason a hero, a statement, a card grid, a row list, a type list and
 * a split read as one page instead of six: the inline edges line up all
 * the way down, so the eye has one margin to track rather than a new
 * one per block.
 *
 * It is not a substitute for the gutter — `INSET` still handles the
 * page margin at small widths, and this caps the column at large ones.
 * Full-bleed media (the hero, and only the hero) opts out by not being
 * inside it.
 *
 * ⚠️ THE CAP IS FLUID, for the same reason the type scale is. A flat
 * 68rem is right at 1440 and wrong at 2560, where it left a 1088px
 * column marooned in the middle of the screen with 730px of empty
 * black on either side. `clamp(68rem, 60vw, 96rem)` holds 68rem up to
 * about 1815px and then grows to a 96rem ceiling — no breakpoint, no
 * jump, and the paragraph measures stay readable regardless because
 * `max-w-lead` and `max-w-body` are in `ch`, not in container width.
 */
export interface MeasureProps {
  children: React.ReactNode;
  className?: string;
}

export function Measure({ children, className = "" }: MeasureProps) {
  return (
    <div
      className={`mx-auto flex w-full max-w-[clamp(68rem,60vw,96rem)] flex-col ${className}`}
    >
      {children}
    </div>
  );
}

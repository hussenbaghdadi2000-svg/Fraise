import Link from "next/link";

/**
 * The head of a studio screen.
 *
 * Same device as components/ui/SectionHead.tsx on the public site — a
 * hairline, a Latin mono label with a count, the action that leads out
 * of the section, then the heading. Reusing the SHAPE rather than the
 * component: SectionHead carries `.u-rise`, which is a scroll reveal,
 * and a form that fades in as you scroll to it is an animation on a
 * tool. The visual grammar is worth borrowing; the motion is not.
 */
export interface PageHeadProps {
  /** Latin, in both locales — the same convention as the slate. */
  latin: string;
  count: string;
  title: string;
  action?: { href: string; label: string };
  back?: { href: string; label: string };
}

export function PageHead({ latin, count, title, action, back }: PageHeadProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-px w-full bg-hairline" />
      <div className="flex items-baseline justify-between gap-8">
        <p
          lang="en"
          dir="ltr"
          className="u-caps font-mono text-label text-bone-faint"
        >
          {latin} / {count}
        </p>
        {action && (
          <Link
            href={action.href}
            className="u-caps shrink-0 border-b border-transparent pb-0.5 font-mono text-label text-bone-dim transition-colors duration-300 hover:border-fraise hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fraise"
          >
            {action.label}
          </Link>
        )}
      </div>

      {back && (
        <Link
          href={back.href}
          className="w-fit text-caption text-bone-dim transition-colors duration-200 hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fraise"
        >
          {/* The arrow is directional, so it mirrors — logical
              properties do not reach a glyph. In RTL "back" points the
              other way, and an arrow that does not turn round is the
              most obvious RTL bug there is. */}
          <span aria-hidden className="me-2 inline-block rtl:rotate-180">
            ←
          </span>
          {back.label}
        </Link>
      )}

      <h1 className="u-display text-title font-semibold">{title}</h1>
    </div>
  );
}

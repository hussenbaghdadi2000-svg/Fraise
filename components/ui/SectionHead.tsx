import Link from "next/link";

/**
 * A section marker, and the way OUT of the section.
 *
 * The head used to be a number and a title in an 11px mono label — a
 * caption pretending to be a title. It is now a hairline, the Latin
 * section name with its index, an optional route out, and a real
 * heading. The bilingual pairing (`SELECTED WORK / 01` above
 * `أعمال مختارة`) is the studio's own device, and the same convention
 * the slate uses for production credits.
 *
 * The link matters more than it looks: before it existed, every section
 * on the site dead-ended and the first action a reader was offered sat
 * in the footer. Hanging the route on the head puts it where the eye
 * already is, and costs no furniture — it sits on the rule that was
 * there anyway.
 *
 * ⚠️ `as` exists because a PAGE heading is an `h1` and a SECTION heading
 * is an `h2`, and the visual treatment is identical for both. Getting
 * that from a prop is what stops the work page from growing a second
 * head component that happens to look the same.
 */
export interface SectionHeadProps {
  /** Index shown after the Latin name — a section number, or a count. */
  number: string;
  /** The Latin section name. Latin in both locales, like the slate. */
  latin: string;
  title: string;
  link?: { href: string; label: string };
  as?: "h1" | "h2";
}

export function SectionHead({
  number,
  latin,
  title,
  link,
  as: Heading = "h2",
}: SectionHeadProps) {
  return (
    <div className="u-rise flex flex-col gap-5">
      <div className="h-px w-full bg-hairline" />
      <div className="flex items-baseline justify-between gap-8">
        <p
          lang="en"
          dir="ltr"
          className="u-caps font-mono text-label text-bone-faint"
        >
          {latin} / {number}
        </p>
        {link && (
          <Link
            href={link.href}
            className="u-caps shrink-0 border-b border-transparent pb-0.5 font-mono text-label text-bone-dim transition-colors duration-300 hover:border-fraise hover:text-bone"
          >
            {link.label}
          </Link>
        )}
      </div>
      {/* text-title and not text-display: the positioning statement is
          the one display-sized thing on the site, and a second one
          would mean neither is the largest. */}
      <Heading className="u-display text-title font-semibold">{title}</Heading>
    </div>
  );
}

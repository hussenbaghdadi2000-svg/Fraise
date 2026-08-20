import Link from "next/link";
import type { Severity } from "@/lib/studio/form";
import { STUDIO_COPY } from "@/lib/studio/copy";
import type { Locale } from "@/types/content";

/**
 * One thing that is wrong, or might be.
 *
 * ⚠️ A SCOPED EXCEPTION TO THE COLOUR RULE, made deliberately.
 * `--color-fraise` is reserved on the public site for interactive state
 * — focus ring, active filter, hover underline — and never for a
 * border. Here it marks an ERROR, on a 2px inline-start rule and
 * nowhere else.
 *
 * The reasoning: the rule exists so that the only colour a VISITOR sees
 * is the food. Nobody browses the dashboard, and a validation failure
 * you cannot pick out of a list is a broken tool. Warnings stay
 * achromatic, so the accent still means one thing — this one breaks the
 * build or the page, the others are for a human to judge.
 *
 * The site's own surfaces are untouched by this.
 */
export interface NoteProps {
  severity: Severity;
  message: string;
  where?: string;
  href?: string;
  locale: Locale;
}

export function Note({ severity, message, where, href, locale }: NoteProps) {
  const copy = STUDIO_COPY[locale];
  const isError = severity === "error";

  const body = (
    <div
      className={`flex flex-col gap-1.5 border-s-2 bg-ink-raised px-4 py-3 ${
        isError ? "border-fraise" : "border-hairline"
      }`}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className={`u-caps font-mono text-label ${
            isError ? "text-bone" : "text-bone-faint"
          }`}
        >
          {isError ? copy.errorLabel : copy.warnLabel}
        </span>
        {where && (
          /* The location is a path and an id — Latin either way, so it
             is marked as such rather than inheriting the page's RTL and
             rendering its punctuation on the wrong side. */
          <span
            lang="en"
            dir="ltr"
            className="font-mono text-label text-bone-faint"
          >
            {where}
          </span>
        )}
      </div>
      <p className="text-caption leading-relaxed text-bone-dim">{message}</p>
    </div>
  );

  if (!href) return body;

  return (
    <Link
      href={href}
      className="block transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fraise"
    >
      {body}
    </Link>
  );
}

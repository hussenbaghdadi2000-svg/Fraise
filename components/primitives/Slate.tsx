/**
 * The production slate — the metadata block that sits on every frame.
 *
 * A film slate is the industry's own metadata object, which is why
 * this reads as production infrastructure rather than a portfolio
 * caption. Freelancers write captions; productions write slates.
 *
 * ⚠️ IT NO LONGER PRINTS THE ASPECT RATIO. The ratio was displayed
 * here and in six other places on the reasoning that "the ratio is the
 * service taxonomy" — a decision from the pre-dev analysis, not from
 * the client. The Stage 1 brief mentions aspect ratio exactly twice
 * and both times as an ASSET SPEC ("a square or 16:9 poster frame for
 * the thumbnail state"), never as something a visitor reads. What it
 * does ask for is "a clear project name on every video", "Client —
 * Campaign", and "minimal text throughout".
 *
 * `Ratio` still governs the layout, the CLS boxes and the `sizes`
 * attribute. It was always engineering; it is no longer copy.
 *
 * Its content is always Latin or numeric (client names, years), so it
 * is safe to uppercase and letter-space in BOTH locales. The rule against tracking Arabic never applies here — the
 * slate survives RTL untouched.
 *
 * That is why it carries its own lang and dir. Without dir="ltr" a
 * flex row inside an RTL page reverses its children, and the slate
 * would read "2023 TVC JORDINA". Without lang="en" the Arabic
 * gate in globals.css would strip its caps and tracking. A slate is
 * production notation, not prose — it is never mirrored.
 *
 * This is a Server Component. It ships zero JavaScript.
 */
export interface SlateProps {
  client: string;
  kind: string;
  year: number;
}

export function Slate({ client, kind, year }: SlateProps) {
  return (
    <p
      lang="en"
      dir="ltr"
      className="u-caps flex flex-wrap items-baseline gap-x-6 gap-y-1 font-mono text-label text-bone-dim"
    >
      <span className="text-bone">{client}</span>
      <span>{kind}</span>
      <span>{year}</span>
    </p>
  );
}

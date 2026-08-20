import Link from "next/link";
import { Note } from "@/components/studio/Note";
import { PageHead } from "@/components/studio/PageHead";
import { COLLECTIONS } from "@/lib/studio/collections";
import { STUDIO_COPY } from "@/lib/studio/copy";
import { health } from "@/lib/studio/health";
import { requireStudioSession, studioLocale } from "@/lib/studio/session";

/**
 * The overview: how much content there is, and what is wrong with it.
 *
 * ⚠️ `force-dynamic` is the point of this screen, not a performance
 * concession. It reads the working copy and probes eighty files on the
 * disk; a cached render would show you the state of the repo at the
 * moment the dev server started, which for a tool whose entire job is
 * reporting the CURRENT state would be worse than showing nothing.
 */
export const dynamic = "force-dynamic";

export default async function StudioOverview() {
  await requireStudioSession();
  const locale = await studioLocale();
  const copy = STUDIO_COPY[locale];
  const report = await health();

  const total = report.findings.length;

  return (
    <div className="flex flex-col gap-movement">
      <PageHead
        latin="OVERVIEW"
        count={String(COLLECTIONS.length).padStart(2, "0")}
        title={copy.brand}
      />

      {/* Counts. Each one is the way into its collection, so the
          summary is also the navigation — the same instinct as hanging
          the route out of a section on its head. */}
      {/*
        Borders on the ITEMS, not a `gap-px` over a `bg-hairline`
        container. Five cards in a three-column grid leave one cell
        empty, and with the gap trick that empty cell paints the
        hairline colour across a whole card-sized rectangle — a grey
        block on a black page, in the one direction that forbids light
        grounds. Logical `border-e`/`border-b` so the grid closes on the
        correct side in both writing directions.
      */}
      <ul className="grid border-s border-t border-hairline sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((collection) => {
          const count =
            report.counts.find((entry) => entry.name === collection.name)?.rows ??
            0;
          return (
            <li key={collection.name} className="border-b border-e border-hairline">
              <Link
                href={`/studio/${collection.name}`}
                className="flex h-full flex-col gap-2 p-6 transition-colors duration-200 hover:bg-ink-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fraise"
              >
                {/* Latin, so it says so. `.u-caps:lang(ar)` strips
                    uppercase and tracking from anything that inherits
                    Arabic — correct for Arabic copy, wrong for a
                    collection name that is a Latin identifier. */}
                <span
                  lang="en"
                  dir="ltr"
                  className="u-caps font-mono text-label text-bone-faint"
                >
                  {collection.name}
                </span>
                <span className="u-display text-title font-semibold">
                  {count}
                </span>
                <span className="text-caption text-bone-dim">
                  {collection.label[locale]}
                </span>
                {/* The label is Arabic and the path is Latin, so only
                    the PATH gets dir="ltr". Wrapping both would drag
                    the Arabic into a left-to-right run and put its
                    words in the wrong order. */}
                <span className="mt-auto pt-4 font-mono text-label text-bone-faint">
                  {copy.writesTo}{" "}
                  <span lang="en" dir="ltr">
                    {collection.table}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="flex flex-col gap-beat">
        <div className="flex flex-col gap-5">
          <div className="h-px w-full bg-hairline" />
          <div className="flex items-baseline justify-between gap-8">
            <p
              lang="en"
              dir="ltr"
              className="u-caps font-mono text-label text-bone-faint"
            >
              HEALTH / {String(total).padStart(2, "0")}
            </p>
            <p className="font-mono text-label text-bone-dim">
              {report.errors} {copy.problemCount} · {report.warnings}{" "}
              {copy.warningCount}
            </p>
          </div>
          <h2 className="u-display text-title font-semibold">{copy.health}</h2>
        </div>

        {total === 0 ? (
          <p className="border border-hairline bg-ink-raised px-4 py-8 text-center text-body text-bone-faint">
            {copy.allClear}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {/* Errors first. A missing hero and a slightly small
                thumbnail are not the same news, and sorting by
                severity is the difference between a report you act on
                and a list you scroll past. */}
            {[...report.findings]
              .sort((a, b) =>
                a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1,
              )
              .map((finding, index) => (
                <li key={index}>
                  <Note
                    severity={finding.severity}
                    message={finding.message[locale]}
                    where={finding.where}
                    href={finding.href}
                    locale={locale}
                  />
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { moveRow } from "@/lib/studio/actions";
import {
  assetPath,
  displayValue,
  rowTitle,
  type Collection,
  type Row,
} from "@/lib/studio/collections";
import { STUDIO_COPY } from "@/lib/studio/copy";
import type { Locale } from "@/types/content";

/**
 * The list of rows in one collection. A Server Component.
 *
 * A `<ul>` rather than a `<table>`, and that is a considered choice
 * rather than laziness: at 320px a real table either overflows or
 * squeezes its cells to a character a line, and BOTH are documented
 * failures on this project — the second one shipped once, on the
 * homepage capability rows, in Arabic, where breaking mid-word
 * shatters a connected script into isolated letterforms.
 *
 * A list of entries is also the honest markup. These are records you
 * open, not a grid you scan across.
 */
export interface RowTableProps {
  collection: Collection;
  rows: Row[];
  locale: Locale;
}

export function RowTable({ collection, rows, locale }: RowTableProps) {
  const copy = STUDIO_COPY[locale];

  if (rows.length === 0) {
    return (
      <p className="border border-hairline bg-ink-raised px-4 py-8 text-center text-body text-bone-faint">
        {copy.emptyCollection}
      </p>
    );
  }

  const thumb = collection.fields.find(
    (field) => field.kind === "asset" && field.name === collection.thumbField,
  );

  return (
    <ul className="flex flex-col border-t border-hairline">
      {rows.map((row, index) => {
        const id = String(row["id"] ?? "");
        const href = `/studio/${collection.name}/${encodeURIComponent(id)}`;
        const source =
          thumb && thumb.kind === "asset" ? assetPath(thumb, row) : "";

        return (
          <li
            id={id}
            key={id || index}
            className="flex items-center gap-4 border-b border-hairline py-3"
          >
            <Link
              href={href}
              className="flex min-w-0 flex-1 items-center gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fraise"
            >
              {thumb && (
                <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-ink-raised">
                  {source !== "" && (
                    /* eslint-disable-next-line @next/next/no-img-element --
                       same reasoning as components/media/Poster.tsx:
                       next/image costs 4.3 kB brotli for resizing this
                       project does not use. Read the note in that file
                       before changing either. */
                    <img
                      src={source}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </div>
              )}

              <div className="flex min-w-0 flex-col gap-1">
                {/* `truncate` and not a wrap: a long Arabic title in a
                    narrow flex child is the squeeze failure, and one
                    line that ends in an ellipsis is the fix. */}
                <span className="truncate text-body">
                  {rowTitle(collection, row, locale)}
                </span>
                <span
                  lang="en"
                  dir="ltr"
                  className="truncate font-mono text-label text-bone-faint"
                >
                  {id}
                </span>
              </div>

              <div className="ms-auto hidden shrink-0 items-baseline gap-6 md:flex">
                {collection.columns
                  .filter((column) => column !== collection.titleField)
                  .map((column) => (
                    <span
                      key={column}
                      className="font-mono text-label text-bone-dim"
                    >
                      {displayValue(collection, column, row, locale)}
                    </span>
                  ))}
              </div>
            </Link>

            {collection.ordered && (
              /*
                Reordering is a LAYOUT control here, not a list
                nicety: content/projects.ts derives the homepage logo
                rail from clients.json in sequence, so these two
                buttons move a mark on the front page.
              */
              <div className="flex shrink-0 items-center gap-1">
                <MoveButton
                  collection={collection.name}
                  id={id}
                  direction="up"
                  label={copy.up}
                  disabled={index === 0}
                />
                <MoveButton
                  collection={collection.name}
                  id={id}
                  direction="down"
                  label={copy.down}
                  disabled={index === rows.length - 1}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function MoveButton({
  collection,
  id,
  direction,
  label,
  disabled,
}: {
  collection: string;
  id: string;
  direction: "up" | "down";
  label: string;
  disabled: boolean;
}) {
  return (
    <form action={moveRow.bind(null, collection, id, direction)}>
      <button
        type="submit"
        disabled={disabled}
        aria-label={label}
        className="flex size-8 items-center justify-center border border-hairline text-bone-dim transition-colors duration-200 hover:border-fraise hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fraise disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-hairline disabled:hover:text-bone-dim"
      >
        {/* Up and down are not directional in the RTL sense — vertical
            order does not flip with writing direction, so these do NOT
            mirror. Contrast with the back arrow in PageHead. */}
        <span aria-hidden>{direction === "up" ? "↑" : "↓"}</span>
      </button>
    </form>
  );
}

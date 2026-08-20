import { notFound } from "next/navigation";
import { PageHead } from "@/components/studio/PageHead";
import { RowForm } from "@/components/studio/RowForm";
import { removeRow, saveRow } from "@/lib/studio/actions";
import { findCollection, rowTitle } from "@/lib/studio/collections";
import { STUDIO_COPY } from "@/lib/studio/copy";
import { inspectRow } from "@/lib/studio/health";
import { requireStudioSession, studioLocale } from "@/lib/studio/session";
import { indexOf, readRows } from "@/lib/studio/repository";

export const dynamic = "force-dynamic";

/**
 * One row, editable.
 *
 * The assets are probed HERE, on every render, rather than being read
 * from anything cached — which is what makes the measured size printed
 * beside a poster the file that is on the disk right now. Save an
 * upload and the page re-renders with the new dimensions, so the ratio
 * warning either clears or does not, and you find out immediately
 * instead of on the Health page later.
 */
export default async function EditRowPage({
  params,
  searchParams,
}: PageProps<"/studio/[collection]/[id]">) {
  await requireStudioSession();

  const { collection: name, id: rawId } = await params;
  const collection = findCollection(name);
  if (!collection) notFound();

  /* The router hands back a DECODED segment, so an Arabic or
     space-bearing id compares against the stored string directly. Ids
     are kebab-case by the parser's rule, but the decode is what makes
     that a guarantee rather than an assumption. */
  const id = decodeURIComponent(rawId);
  const rows = await readRows(collection);
  const at = indexOf(rows, id);
  if (at === -1) notFound();

  const row = rows[at];
  const locale = await studioLocale();
  const copy = STUDIO_COPY[locale];
  const assets = await inspectRow(collection, row);
  const justCreated = (await searchParams).saved === "1";

  return (
    <div className="flex flex-col gap-beat">
      <PageHead
        latin={collection.name.toUpperCase()}
        count={String(at + 1).padStart(2, "0")}
        title={rowTitle(collection, row, locale)}
        back={{
          href: `/studio/${collection.name}`,
          label: collection.label[locale],
        }}
      />

      <RowForm
        fields={collection.fields}
        row={row}
        assets={assets}
        locale={locale}
        action={saveRow.bind(null, collection.name, id)}
        cancelHref={`/studio/${collection.name}`}
        justCreated={justCreated}
      />

      {/*
        Delete, behind a native disclosure.

        `<details>` rather than a confirm() dialog or a modal, for the
        same reason the site's mobile menu is one: it is a disclosure,
        the platform has a disclosure element, and it arrives with
        keyboard and screen-reader behaviour already correct at 0 kB. A
        React confirmation would need state, a focus trap and an Escape
        handler to draw level with it.

        It sits OUTSIDE the form above, because a form inside a form is
        invalid HTML and the browser silently drops the inner one.
      */}
      <details className="mt-bar max-w-[52rem] border border-hairline">
        <summary className="cursor-pointer px-4 py-3 text-caption text-bone-dim transition-colors duration-200 hover:text-bone">
          {copy.remove}
        </summary>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline px-4 py-4">
          <p className="text-caption text-bone-dim">{copy.confirmRemove}</p>
          <form action={removeRow.bind(null, collection.name, id)}>
            <button
              type="submit"
              className="border border-bone px-4 py-2 text-caption text-bone transition-colors duration-200 hover:border-fraise focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fraise"
            >
              {copy.remove}
            </button>
          </form>
        </div>
        {/* The media is deliberately left on disk — see removeRow. */}
      </details>
    </div>
  );
}

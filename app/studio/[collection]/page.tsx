import { notFound } from "next/navigation";
import { PageHead } from "@/components/studio/PageHead";
import { RowTable } from "@/components/studio/RowTable";
import { findCollection } from "@/lib/studio/collections";
import { STUDIO_COPY } from "@/lib/studio/copy";
import { requireStudioSession, studioLocale } from "@/lib/studio/session";
import { readRows } from "@/lib/studio/repository";

export const dynamic = "force-dynamic";

/**
 * One collection, listed. The same file renders all five.
 */
export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/studio/[collection]">) {
  await requireStudioSession();

  const { collection: name } = await params;
  const collection = findCollection(name);
  /* `[collection]` matches any segment, so an unknown one has to 404
     here — the same job `dynamicParams = false` does for [locale] on
     the public side. */
  if (!collection) notFound();

  const locale = await studioLocale();
  const copy = STUDIO_COPY[locale];
  const rows = await readRows(collection);
  const removed = (await searchParams).removed;

  return (
    <div className="flex flex-col gap-beat">
      <PageHead
        latin={collection.name.toUpperCase()}
        count={String(rows.length).padStart(2, "0")}
        title={collection.label[locale]}
        action={{
          href: `/studio/${collection.name}/new`,
          label: `${copy.create} ${collection.singular[locale]}`,
        }}
      />

      {typeof removed === "string" && (
        <p
          role="status"
          className="border-s-2 border-hairline bg-ink-raised px-4 py-3 text-caption text-bone-dim"
        >
          {copy.removedRow} ·{" "}
          <span lang="en" dir="ltr" className="font-mono">
            {removed}
          </span>
        </p>
      )}

      {/*
        The caveat, kept where it will be read.
        docs/02-handoff.md insists these travel with the data — that
        gallery years are upload dates and not shoot dates, that the
        pillar on those rows was read off the frame. A warning in a
        markdown file is a warning nobody sees while typing.
      */}
      {collection.note && (
        <p className="max-w-[70ch] border-s-2 border-hairline bg-ink-raised px-4 py-3 text-caption leading-relaxed text-bone-dim">
          {collection.note[locale]}
        </p>
      )}

      <RowTable collection={collection} rows={rows} locale={locale} />
    </div>
  );
}

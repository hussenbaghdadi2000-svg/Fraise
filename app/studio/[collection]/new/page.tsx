import { notFound } from "next/navigation";
import { PageHead } from "@/components/studio/PageHead";
import { RowForm } from "@/components/studio/RowForm";
import { saveRow } from "@/lib/studio/actions";
import { findCollection } from "@/lib/studio/collections";
import { STUDIO_COPY } from "@/lib/studio/copy";
import { requireStudioSession, studioLocale } from "@/lib/studio/session";

export const dynamic = "force-dynamic";

/**
 * A new row.
 *
 * ⚠️ `new` IS A STATIC SEGMENT SITTING BESIDE `[id]`, and it wins —
 * Next matches static segments before dynamic ones. Which also means
 * "new" is now a reserved id: a row called `new` would be unreachable
 * for editing. Nothing in this content wants that name, and the
 * alternative (a `/create` route outside the collection) costs a whole
 * extra path shape to avoid a word nobody would use.
 */
export default async function NewRowPage({
  params,
}: PageProps<"/studio/[collection]/new">) {
  await requireStudioSession();

  const { collection: name } = await params;
  const collection = findCollection(name);
  if (!collection) notFound();

  const locale = await studioLocale();
  const copy = STUDIO_COPY[locale];

  return (
    <div className="flex flex-col gap-beat">
      <PageHead
        latin={`${collection.name.toUpperCase()} / NEW`}
        count="01"
        title={`${copy.create} ${collection.singular[locale]}`}
        back={{
          href: `/studio/${collection.name}`,
          label: collection.label[locale],
        }}
      />

      <RowForm
        fields={collection.fields}
        row={null}
        /* Nothing to inspect: the row has no id yet, so no asset has a
           path to be measured at. The form shows the empty state and
           the upload lands once the id is known. */
        assets={[]}
        locale={locale}
        action={saveRow.bind(null, collection.name, null)}
        cancelHref={`/studio/${collection.name}`}
      />
    </div>
  );
}

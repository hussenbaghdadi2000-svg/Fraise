import { revalidatePath } from "next/cache";
import { ContentError } from "@/lib/content-schema";
import { apiError, canWrite, json } from "@/lib/studio/api";
import { findCollection } from "@/lib/studio/collections";
import { deleteRow, indexOf, readRows, updateRow } from "@/lib/studio/repository";

/**
 * GET    /api/:collection/:id   one row, public
 * PATCH  /api/:collection/:id   merge fields, authenticated
 * DELETE /api/:collection/:id   remove it, authenticated
 *
 * ⚠️ PATCH MERGES, IT DOES NOT REPLACE. A client that sends only
 * `{ "vimeoId": "753259934" }` should not wipe the title — and filling
 * in the Vimeo ids is the single most likely use this API will get.
 */

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ collection: string; id: string }> };

async function resolve(context: Context) {
  const { collection: name, id: raw } = await context.params;
  const collection = findCollection(name);
  if (!collection) return { error: apiError(404, `Unknown collection "${name}"`) };

  const id = decodeURIComponent(raw);
  const rows = await readRows(collection);
  const at = indexOf(rows, id);
  if (at === -1) {
    return { error: apiError(404, `No row "${id}" in ${collection.name}`) };
  }
  return { collection, rows, at, id };
}

export async function GET(_request: Request, context: Context) {
  const found = await resolve(context);
  if ("error" in found) return found.error;
  return json(found.rows[found.at]);
}

export async function PATCH(request: Request, context: Context) {
  const found = await resolve(context);
  if ("error" in found) return found.error;
  if (!(await canWrite(request))) return apiError(401, "Unauthorized");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Body is not valid JSON");
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return apiError(400, "Body must be an object of fields to change");
  }

  const { collection, rows, at, id } = found;
  /* The id is the join key content/curation.ts points at and the
     filename its media is named after. Changing it through a PATCH
     would orphan both silently, so it is fixed here as it is in the
     form. */
  const patch = { ...(body as Record<string, unknown>), id };
  const next = { ...rows[at], ...patch };

  try {
    collection.validate(rows.with(at, next));
    await updateRow(collection, id, next);
  } catch (error) {
    if (error instanceof ContentError) return apiError(422, error.message);
    throw error;
  }

  refresh(collection.name);
  return json(next);
}

export async function DELETE(request: Request, context: Context) {
  const found = await resolve(context);
  if ("error" in found) return found.error;
  if (!(await canWrite(request))) return apiError(401, "Unauthorized");

  const { collection, rows, at, id } = found;
  try {
    /* Validating the collection WITHOUT this row is what catches
       deleting the homepage hero: content/curation.ts names it, and
       the parser is the last thing that sees the whole picture. */
    collection.validate(rows.toSpliced(at, 1));
    await deleteRow(collection, id);
  } catch (error) {
    if (error instanceof ContentError) return apiError(422, error.message);
    throw error;
  }

  refresh(collection.name);
  return json({ deleted: id });
}

function refresh(collectionName: string): void {
  revalidatePath(`/studio/${collectionName}`, "layout");
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}

import { revalidatePath } from "next/cache";
import { ContentError } from "@/lib/content-schema";
import { apiError, canWrite, json } from "@/lib/studio/api";
import { COLLECTIONS, findCollection } from "@/lib/studio/collections";
import { indexOf, insertRow, readRows } from "@/lib/studio/repository";

/**
 * GET  /api/:collection    every row, public
 * POST /api/:collection    create one, authenticated
 *
 * The same five collections the dashboard edits, from the same registry
 * and through the same validator. Adding a sixth collection gives it an
 * endpoint for free, which is the point of the registry.
 */

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection: name } = await params;
  const collection = findCollection(name);
  if (!collection) {
    return apiError(
      404,
      `Unknown collection "${name}". Try one of: ${COLLECTIONS.map((c) => c.name).join(", ")}`,
    );
  }

  const rows = await readRows(collection);
  return json({ collection: collection.name, count: rows.length, rows });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection: name } = await params;
  const collection = findCollection(name);
  if (!collection) return apiError(404, `Unknown collection "${name}"`);

  if (!(await canWrite(request))) {
    return apiError(401, "Unauthorized");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Body is not valid JSON");
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return apiError(400, "Body must be a single row object");
  }

  const row = body as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id : "";

  const rows = await readRows(collection);
  if (indexOf(rows, id) !== -1) {
    return apiError(409, `"${id}" already exists`);
  }

  try {
    /* ⚠️ VALIDATE THE COLLECTION AS IT WOULD BE, not the row on its
       own. A duplicate slug is only visible against the others, and
       this is the same call the dashboard makes before it writes. */
    collection.validate([...rows, row]);
    await insertRow(collection, row);
  } catch (error) {
    if (error instanceof ContentError) return apiError(422, error.message);
    throw error;
  }

  refresh(collection.name);
  return json({ created: id }, { status: 201 });
}

/** The public site is statically rendered; a write has to invalidate it. */
function refresh(collectionName: string): void {
  revalidatePath(`/studio/${collectionName}`, "layout");
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}

import { asc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Collection, Row } from "@/lib/studio/collections";

/**
 * The studio's read and write path, against Postgres.
 *
 * This replaced a pair of functions that read and rewrote a JSON file.
 * The shape of the contract did not change and that is deliberate: the
 * dashboard still thinks in whole collections of plain `Row` objects
 * with nested bilingual fields, because that is what the generic form
 * and the generic table are built on. Only the storage moved.
 *
 * ⚠️ THE VALIDATION ORDER IS UNCHANGED AND IS THE POINT.
 * lib/studio/actions.ts still builds the NEXT version of the whole
 * collection, runs the public site's own parser over it, and only then
 * writes. A database with NOT NULL columns and an enum catches a lot,
 * but it does not know that a poster path must start with /media/ or
 * that a title must be non-empty after trimming — so the parser stays
 * in front of the write, exactly where it was.
 *
 * The write itself is TARGETED rather than a rewrite of every row. The
 * file version had no choice; a database does, and rewriting 30 rows to
 * change one is both slower and a way to clobber a concurrent edit.
 */

/** Flat DB columns ↔ the nested shape the form and the parsers use. */
interface Mapping {
  toRow(record: Record<string, unknown>): Row;
  toColumns(row: Row): Record<string, unknown>;
}

const str = (value: unknown): string => (typeof value === "string" ? value : "");
const pair = (value: unknown, key: string): string => {
  if (typeof value !== "object" || value === null) return "";
  const bag = value as Record<string, unknown>;
  return typeof bag[key] === "string" ? (bag[key] as string) : "";
};

const MAPPINGS: Record<string, Mapping> = {
  projects: {
    toRow: (r) => ({
      id: r.id,
      slug: r.slug,
      client: r.client,
      title: { ar: r.titleAr, en: r.titleEn },
      pillar: r.pillar,
      year: r.year,
      poster: r.poster,
      preview: r.preview,
      /* The column is nullable, the domain field is optional, and the
         parser rejects null — so an absent id is an absent KEY. */
      ...(r.vimeoId ? { vimeoId: r.vimeoId } : {}),
    }),
    toColumns: (row) => ({
      id: str(row.id),
      slug: str(row.slug),
      client: str(row.client),
      titleAr: pair(row.title, "ar"),
      titleEn: pair(row.title, "en"),
      pillar: str(row.pillar),
      year: Number(row.year),
      poster: str(row.poster),
      preview: str(row.preview),
      vimeoId: str(row.vimeoId) || null,
    }),
  },
  clients: {
    toRow: (r) => ({ id: r.id, name: r.name, logo: r.logo }),
    toColumns: (row) => ({
      id: str(row.id),
      name: str(row.name),
      logo: str(row.logo),
    }),
  },
  bts: {
    toRow: (r) => ({
      id: r.id,
      title: { ar: r.titleAr, en: r.titleEn },
      client: r.client,
      year: r.year,
      href: r.href,
    }),
    toColumns: (row) => ({
      id: str(row.id),
      titleAr: pair(row.title, "ar"),
      titleEn: pair(row.title, "en"),
      client: str(row.client),
      year: Number(row.year),
      href: str(row.href),
    }),
  },
  team: {
    toRow: (r) => ({
      id: r.id,
      name: { ar: r.nameAr, en: r.nameEn },
      role: r.role,
      bio: { ar: r.bioAr, en: r.bioEn },
    }),
    toColumns: (row) => ({
      id: str(row.id),
      nameAr: pair(row.name, "ar"),
      nameEn: pair(row.name, "en"),
      role: str(row.role),
      bioAr: pair(row.bio, "ar"),
      bioEn: pair(row.bio, "en"),
    }),
  },
  awards: {
    toRow: (r) => ({ id: r.id, name: r.name }),
    toColumns: (row) => ({ id: str(row.id), name: str(row.name) }),
  },
};

/* eslint-disable @typescript-eslint/no-explicit-any --
   Drizzle's table types are structurally distinct per table, and this
   module is deliberately generic over all five. Narrowing each call
   site would mean five near-identical copies of every function below,
   which is the drift the registry exists to prevent. The mapping above
   is where the real type discipline lives, and every read goes through
   the site's parser afterwards. */
const TABLES: Record<string, any> = {
  projects: schema.projects,
  clients: schema.clients,
  bts: schema.btsFilms,
  team: schema.team,
  awards: schema.awards,
};
/* eslint-enable @typescript-eslint/no-explicit-any */

function parts(collection: Collection) {
  const table = TABLES[collection.name];
  const mapping = MAPPINGS[collection.name];
  if (!table || !mapping) {
    throw new Error(`No table mapped for collection "${collection.name}"`);
  }
  return { table, mapping };
}

/** Every row, in the order the site renders them. */
export async function readRows(collection: Collection): Promise<Row[]> {
  const { table, mapping } = parts(collection);
  const records = await db().select().from(table).orderBy(asc(table.position));
  return records.map((record: Record<string, unknown>) => mapping.toRow(record));
}

/** Append. `position` puts it last, which is where a new row belongs. */
export async function insertRow(
  collection: Collection,
  row: Row,
): Promise<void> {
  const { table, mapping } = parts(collection);

  /* max(position) + 1. Read rather than computed from the row count,
     because a delete leaves a gap: five rows can occupy positions
     0,1,2,4,5, and `count` would hand the new row position 5 — a
     duplicate, and two rows whose order is then decided by the query
     planner rather than by anyone. */
  const existing = await db().select({ position: table.position }).from(table);
  const last = existing.reduce(
    (max: number, record: { position: number }) => Math.max(max, record.position),
    -1,
  );

  await db()
    .insert(table)
    .values({ ...mapping.toColumns(row), position: last + 1 });
}

export async function updateRow(
  collection: Collection,
  id: string,
  row: Row,
): Promise<void> {
  const { table, mapping } = parts(collection);
  const columns = mapping.toColumns(row);
  /* The id is immutable in the form, so it is never part of an update —
     changing a primary key would orphan the media named after it. */
  delete columns.id;
  await db().update(table).set(columns).where(eq(table.id, id));
}

export async function deleteRow(
  collection: Collection,
  id: string,
): Promise<void> {
  const { table } = parts(collection);
  await db().delete(table).where(eq(table.id, id));
}

/**
 * Swap two rows' positions.
 *
 * ⚠️ IN A TRANSACTION. Between the two updates both rows briefly hold
 * the same position, and a read landing there would render the logo
 * rail in an order that exists in no version of the data. Neon's HTTP
 * driver supports transactions for exactly this.
 */
export async function swapPositions(
  collection: Collection,
  a: string,
  b: string,
): Promise<void> {
  const { table } = parts(collection);
  const rows = await db()
    .select({ id: table.id, position: table.position })
    .from(table)
    .where(inArray(table.id, [a, b]));

  const first = rows.find((r: { id: string }) => r.id === a);
  const second = rows.find((r: { id: string }) => r.id === b);
  if (!first || !second) return;

  await db().transaction(async (tx) => {
    await tx.update(table).set({ position: second.position }).where(eq(table.id, a));
    await tx.update(table).set({ position: first.position }).where(eq(table.id, b));
  });
}

/** Index of a row by id, or -1. Ids are unique — the parser guarantees it. */
export function indexOf(rows: Row[], id: string): number {
  return rows.findIndex((row) => row["id"] === id);
}

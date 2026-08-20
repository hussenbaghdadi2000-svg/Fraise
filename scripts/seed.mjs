/**
 * Load content/data/*.json into the database.
 *
 *   npm run db:seed            insert rows that are not there yet
 *   npm run db:seed -- --force overwrite rows that ARE there
 *
 * ⚠️ THE JSON FILES ARE NOT DELETED WHEN THE DATABASE TAKES OVER, and
 * that is the point. They are the seed, the offline backup and the
 * record of what the site shipped with — 29 projects, 22 clients, 5 BTS
 * films, 6 crew and 3 awards, most of it recovered from a WordPress
 * site that no longer exists in this form. Losing them to a dropped
 * database would mean re-harvesting the lot.
 *
 * ⚠️ `--force` OVERWRITES DASHBOARD EDITS. The default is
 * ON CONFLICT DO NOTHING precisely so that re-running this after the
 * studio has been using /studio/ cannot silently revert their work.
 * Reach for --force only against an empty or throwaway database.
 *
 * Written with the raw `pg` client rather than Drizzle on purpose:
 * lib/db/schema.ts imports through the `@/` path alias, which Node
 * cannot resolve without a bundler. A seed script that needs a build
 * step to run is a seed script nobody runs.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const FORCE = process.argv.includes("--force");
const ROOT = process.cwd();
const DATA = path.join(ROOT, "content", "data");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Try:  npm run db:seed");
  process.exit(1);
}

const read = (file) =>
  JSON.parse(readFileSync(path.join(DATA, file), "utf8"));

/**
 * Every table, as the columns to write and how to get them off a row.
 *
 * `position` is the array index. SQL has no inherent row order and the
 * order in these files is load-bearing — the homepage logo rail is the
 * client list in sequence — so the index has to be written down rather
 * than hoped for.
 */
const TABLES = [
  {
    table: "projects",
    file: "projects.json",
    columns: ["id", "slug", "client", "title_ar", "title_en", "pillar", "year", "poster", "preview", "vimeo_id", "position"],
    values: (r, i) => [r.id, r.slug, r.client, r.title.ar, r.title.en, r.pillar, r.year, r.poster, r.preview, r.vimeoId ?? null, i],
  },
  {
    table: "clients",
    file: "clients.json",
    columns: ["id", "name", "logo", "position"],
    values: (r, i) => [r.id, r.name, r.logo ?? "", i],
  },
  {
    table: "bts_films",
    file: "bts.json",
    columns: ["id", "title_ar", "title_en", "client", "year", "href", "position"],
    values: (r, i) => [r.id, r.title.ar, r.title.en, r.client, r.year, r.href, i],
  },
  {
    table: "team",
    file: "team.json",
    columns: ["id", "name_ar", "name_en", "role", "bio_ar", "bio_en", "position"],
    values: (r, i) => [r.id, r.name.ar, r.name.en, r.role, r.bio.ar, r.bio.en, i],
  },
  {
    table: "awards",
    file: "awards.json",
    columns: ["id", "name", "position"],
    values: (r, i) => [r.id, r.name, i],
  },
];

const client = new pg.Client({
  connectionString: url,
  /* Neon requires TLS; a local container does not offer it. */
  ssl: url.includes("localhost") || url.includes("127.0.0.1")
    ? false
    : { rejectUnauthorized: false },
});

await client.connect();

try {
  /* One transaction for the whole seed. A half-loaded database is
     harder to reason about than an empty one — if any table fails,
     none of them changed. */
  await client.query("BEGIN");

  for (const spec of TABLES) {
    const rows = read(spec.file);
    const cols = spec.columns.join(", ");
    let written = 0;

    for (const [i, row] of rows.entries()) {
      const values = spec.values(row, i);
      const placeholders = values.map((_, n) => `$${n + 1}`).join(", ");
      const conflict = FORCE
        ? `ON CONFLICT (id) DO UPDATE SET ${spec.columns
            .filter((c) => c !== "id")
            .map((c) => `${c} = EXCLUDED.${c}`)
            .join(", ")}`
        : "ON CONFLICT (id) DO NOTHING";

      const result = await client.query(
        `INSERT INTO ${spec.table} (${cols}) VALUES (${placeholders}) ${conflict}`,
        values,
      );
      written += result.rowCount ?? 0;
    }

    console.log(
      `${spec.table.padEnd(10)} ${String(rows.length).padStart(3)} in file, ` +
        `${String(written).padStart(3)} ${FORCE ? "written" : "inserted"}`,
    );
  }

  await client.query("COMMIT");
  console.log(FORCE ? "\nSeeded (overwrote existing rows)." : "\nSeeded. Existing rows were left alone — use --force to overwrite.");
} catch (error) {
  await client.query("ROLLBACK");
  console.error("\nSeed failed, nothing was written:\n", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}

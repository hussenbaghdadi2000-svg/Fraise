import type { Config } from "drizzle-kit";

/**
 * drizzle-kit reads this to generate SQL migrations from lib/db/schema.ts.
 *
 *   npm run db:generate   schema.ts -> a new file in drizzle/
 *   npm run db:migrate    apply pending migrations to DATABASE_URL
 *   npm run db:seed       load content/data/*.json into an empty database
 *
 * Migrations are GENERATED AND COMMITTED rather than pushed. `db:push`
 * diffs the schema straight onto the database, which is fine on a
 * throwaway branch and a way to lose a column on a live one — there is
 * no review step and no record of what changed.
 */
export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  /* Verbose diffs, and a prompt before anything destructive. */
  verbose: true,
  strict: true,
} satisfies Config;

import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/lib/db/schema";

/**
 * The database handle.
 *
 * ⚠️ TWO DRIVERS, ONE SCHEMA, AND THAT IS DELIBERATE.
 *
 * Neon speaks HTTP rather than the Postgres wire protocol, which is the
 * whole reason it works on Vercel: a serverless function cannot hold a
 * pooled TCP connection open between invocations, and a normal Postgres
 * client on a busy route exhausts the connection limit within minutes.
 * `neon-http` opens no connection at all — each query is one request.
 *
 * But that driver only talks to Neon. A plain `postgres:16` container on
 * localhost — for tests, for offline work, for CI — needs the ordinary
 * wire protocol. So the driver is chosen from the URL, and everything
 * above this line is identical either way: the same `schema`, the same
 * Drizzle query builder, the same types.
 *
 * The alternative was to make everyone run against a cloud database
 * even to run a test, which is slow, costs a network round trip per
 * query, and stops working on a plane.
 */

/** Neon hostnames. Anything else is treated as ordinary Postgres. */
function isNeon(url: string): boolean {
  return url.includes("neon.tech") || url.includes("neon.database");
}

function connect() {
  const url = process.env.DATABASE_URL;

  /* Fail loudly and early. A missing URL used to surface as a stack
     trace from inside the driver on whichever page happened to render
     first, which says nothing about what is actually wrong. */
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in — " +
        "see docs/05-database.md for where to get a Neon connection string.",
    );
  }

  if (isNeon(url)) {
    return drizzleNeon(neon(url), { schema });
  }

  /* Local Postgres. The pool is module-scoped so `next dev`'s hot
     reload does not open a new one on every edit — that leaks
     connections until the server refuses to accept any more, and it
     presents as the database being "down". */
  return drizzleNode(new Pool({ connectionString: url }), { schema });
}

/**
 * Created once per process, lazily.
 *
 * Lazily because `next build` imports this module while collecting page
 * data for routes that may not touch the database at all; connecting at
 * import time would make a missing URL fail a build that had no need of
 * one. `globalThis` because a dev-server reload re-evaluates modules but
 * keeps the process, so a plain module-level `let` would build up a new
 * pool per save.
 */
const globalForDb = globalThis as unknown as {
  fraiseDb?: ReturnType<typeof connect>;
};

export function db(): ReturnType<typeof connect> {
  globalForDb.fraiseDb ??= connect();
  return globalForDb.fraiseDb;
}

export { schema };

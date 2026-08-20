import { NextResponse } from "next/server";
import { hasStudioSession } from "@/lib/studio/session";

/**
 * Shared plumbing for the JSON API under /api/.
 *
 * WHAT THE API IS FOR, AND WHAT IT IS NOT FOR.
 *
 * Reads are public: the content is already on a public website, so
 * putting it behind a key would protect nothing while making it useless
 * to the things an API is actually for — a mobile app, a partner site,
 * a future separate frontend.
 *
 * Writes exist because "make APIs with a database" is not much of a
 * database if the only way in is a browser form. They are NOT how the
 * dashboard writes: /studio/ uses Server Actions, which are a single
 * round trip with no JSON envelope. Two write paths sharing one
 * validator and one repository is fine; two write paths with two
 * definitions of valid would not be.
 */

/** CORS is open on reads, because a public read API that a browser
    cannot call from another origin is a file, not an API. */
const READ_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  /* Cached at the edge, revalidated by the studio on every write —
     revalidatePath("/", "layout") covers these route handlers too. */
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export function json(body: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(body, {
    ...init,
    headers: { ...READ_HEADERS, ...(init?.headers ?? {}) },
  });
}

export function apiError(status: number, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Same constant-time discipline as the password. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return difference === 0;
}

/**
 * May this request write?
 *
 * Two ways in, because there are two kinds of caller:
 *
 *   - a browser already signed into /studio/, carrying the session
 *     cookie. This is what makes the API usable from a script running
 *     in the dashboard's own tab without a second secret.
 *   - a machine, carrying `Authorization: Bearer <STUDIO_API_TOKEN>`.
 *
 * ⚠️ WITH NO STUDIO_API_TOKEN SET, BEARER AUTH IS OFF ENTIRELY rather
 * than accepting an empty token. An unset environment variable is the
 * most common way a deployment ends up with an open door.
 */
export async function canWrite(request: Request): Promise<boolean> {
  if (await hasStudioSession()) return true;

  const token = process.env.STUDIO_API_TOKEN;
  if (!token) return false;

  const header = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;
  return constantTimeEqual(header.slice(prefix.length), token);
}

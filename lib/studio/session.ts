import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { SESSION_COOKIE, sessionIsValid } from "@/lib/studio/auth";
import { DEFAULT_LOCALE, type Locale } from "@/types/content";

/**
 * The two things every studio screen needs before it renders.
 *
 * ⚠️ THIS FILE USED TO 404 THE WHOLE DASHBOARD OUTSIDE DEVELOPMENT.
 * That was correct while the studio wrote to the working copy: there
 * was nothing on a deployed server for it to write TO. Now that the
 * rows live in Postgres the dashboard is meant to be reachable in
 * production, so the gate changed from "which environment is this" to
 * "who is asking".
 *
 * The check is DEFENCE IN DEPTH, on purpose. proxy.ts also redirects an
 * unauthenticated request away from /studio, which is what makes the
 * experience decent — but a proxy is a routing convenience and there is
 * a long history of them being bypassed. The authorization that matters
 * is the one next to the data, so every page calls this and every
 * Server Action calls it again.
 */

export const LOGIN_PATH = "/studio/login/";

/** Does this request carry a live, correctly signed session? */
export async function hasStudioSession(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return sessionIsValid(token);
}

/** Send anyone without one to the door. */
export async function requireStudioSession(): Promise<void> {
  if (!(await hasStudioSession())) redirect(LOGIN_PATH);
}

/**
 * Which language the dashboard is speaking.
 *
 * Defaults to Arabic, like the site — the studio is in Amman and
 * Arabic is the primary language here, not the localised one. The
 * cookie is scoped to /studio so it can never affect which locale a
 * visitor gets on the public site.
 */
export async function studioLocale(): Promise<Locale> {
  const value = (await cookies()).get("studio-locale")?.value;
  return value !== undefined && isLocale(value) ? value : DEFAULT_LOCALE;
}

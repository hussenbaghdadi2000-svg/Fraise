import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionIsValid } from "@/lib/studio/auth";
import { DEFAULT_LOCALE, LOCALES } from "@/types/content";

/**
 * Serves Arabic AT the root instead of at /ar.
 *
 * This file is NOT called middleware.ts. Next 16 deprecated that name and
 * renamed the convention to proxy.ts — same API, the export is `proxy`.
 *
 * The problem it solves: the App Router needs a real [locale] segment to
 * hand `lang` and `dir` to the layout, so Arabic pages exist internally at
 * /ar/*. But the live site has served Arabic from the root for years and
 * that is where its ranking lives. A rewrite is the only tool that
 * separates the two: the URL bar keeps /, the router still sees /ar.
 *
 * A redirect would be wrong here — it changes the URL the visitor sees,
 * which is the exact thing we are preserving.
 *
 * Execution order matters (docs: proxy.md §Execution order). `redirects`
 * from next.config.ts run BEFORE this file, so a `/` → `/ar/` redirect
 * there would fire first and this would never see the request. That
 * redirect was removed when this landed.
 */

/** Locales that keep a visible prefix — everything except the default. */
const PREFIXED_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

const DEFAULT_PREFIX = `/${DEFAULT_LOCALE}`;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* 0 — anything with a dot is a file, not a page: favicon.ico, robots.txt,
     sitemap.xml, everything in public/. Rewriting those to /ar/... 404s
     them. This guard lives in code rather than in the matcher on purpose;
     see the note on the matcher below. */
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  /* 0a — /api is the JSON API. Same trap as /studio: without this the
     proxy rewrites it to /ar/api/... and every endpoint 404s, with
     nothing in the response to suggest routing was the problem.
     Authorization lives in the route handlers, not here — reads are
     public by design. */
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  /* 0b — /studio is the content dashboard: a SECOND ROOT LAYOUT at
     app/studio/, deliberately outside the [locale] tree because it is a
     developer tool rather than a page of the site. It has no locale
     prefix and never will, so rewriting it to /ar/studio would look it
     up as a pillar slug and 404 — with nothing on screen to suggest the
     routing was the problem.

     It used to 404 outside development, back when it wrote to the
     working copy. The rows are in Postgres now, so it is reachable
     from the deployed site and the gate below is a password. */
  if (pathname === "/studio" || pathname.startsWith("/studio/")) {
    /* The dashboard is behind a password now that the content lives in
       Postgres and the studio edits it from the deployed site.

       ⚠️ THIS REDIRECT IS UX, NOT SECURITY. It exists so an expired
       session lands on the login form instead of a blank 404, and it
       must never be the only check — proxies have a history of being
       bypassed, and a Server Action answers POST whether or not any
       page rendered. The authorization that counts is in
       lib/studio/session.ts, called by every page AND every action. */
    const isLogin = pathname === "/studio/login" || pathname === "/studio/login/";
    if (!isLogin) {
      const token = request.cookies.get(SESSION_COOKIE)?.value;
      if (!(await sessionIsValid(token))) {
        const url = request.nextUrl.clone();
        url.pathname = "/studio/login/";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  /* 1 — /en and /en/* are already correct. Hands off. */
  if (
    PREFIXED_LOCALES.some(
      (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
    )
  ) {
    return NextResponse.next();
  }

  /* 2 — /ar/* is the INTERNAL form. If it arrives from the outside it is a
     second URL serving identical content, which splits ranking across two
     addresses. Send it to the canonical one permanently. No loop: this
     runs before the rewrite in step 3, and a rewrite does not re-enter
     the proxy. */
  if (pathname === DEFAULT_PREFIX || pathname.startsWith(`${DEFAULT_PREFIX}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_PREFIX.length) || "/";
    return NextResponse.redirect(url, 308);
  }

  /* 3 — everything else is Arabic at the root. Rewrite, do not redirect:
     the visitor's URL never changes. The trailing slash is carried
     through untouched, or Next would normalise the rewritten path and
     leak /ar/ back into the address bar. */
  const url = request.nextUrl.clone();
  url.pathname = `${DEFAULT_PREFIX}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  /* Keeps the proxy off static assets — on Vercel every matched request
     is a billed invocation, and this site is media-heavy.
     
     VERIFIED THE HARD WAY: the matcher form shown in the Next docs,
     `/((?!_next/static|_next/image|.*\..*).*)`, does NOT work in 16.3.1.
     With that pattern the proxy ran for `/` and NOTHING else — no error,
     no warning, it simply never executed, and /ar/ stayed publicly
     reachable. The `.*\..*` clause is what breaks it. Dropping that one
     clause makes the matcher work; the dot case is handled in step 0.
     
     If you edit this matcher, re-run the routing checks. A broken
     matcher here fails silently. */
  matcher: ["/((?!_next/static|_next/image).*)"],
};

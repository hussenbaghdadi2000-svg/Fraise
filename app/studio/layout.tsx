import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Shell } from "@/components/studio/Shell";
import { DIR } from "@/lib/i18n";
import { hasStudioSession, studioLocale } from "@/lib/studio/session";
import "../globals.css";

/**
 * THE SECOND ROOT LAYOUT.
 *
 * There is no `app/layout.tsx` in this project — `app/[locale]/layout.tsx`
 * is the root layout, because `dir` is an attribute of the document and
 * the segment that decides it has to sit above the root. The Next docs
 * name the consequence exactly: "any layout without a layout.js above it
 * is a root layout", so omitting the top-level file makes each
 * subdirectory's layout a root of its own.
 *
 * That is what this is. It renders its own `<html>` and `<body>`, and
 * navigating between /studio and the public site is a full page load
 * rather than a client transition — which is correct here anyway, since
 * they are two different applications that happen to share a repo.
 *
 * ⚠️ `/studio` ALSO HAD TO BE EXCLUDED IN proxy.ts. The proxy rewrites
 * every unprefixed path to /ar/*, so without a guard this route would
 * be looked up as /ar/studio and 404 — with nothing on screen to
 * suggest the routing was the problem. The same file now also bounces
 * an unauthenticated request to /studio/login/.
 *
 * ⚠️ THIS NO LONGER 404s IN PRODUCTION. It did while the dashboard
 * wrote to the working copy — there was nothing on a server for it to
 * write to. The rows are in Postgres now, so the studio is meant to be
 * reachable from the deployed site and the gate is a password instead.
 *
 * WHY THE FONT LOADERS ARE REPEATED HERE. next/font must be called at
 * module scope, and hoisting the three calls into a shared module would
 * mean editing the PUBLIC site's root layout to build a developer tool.
 * The loaders are content-addressed, so calling them twice with the same
 * options produces the same files and no extra bytes — the duplication
 * is three lines and the alternative is risk on the shipping surface.
 */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "600"],
  display: "swap",
});

/**
 * Belt and braces. These routes 404 in production, so a crawler can
 * never reach them — but robots.txt disallows /studio/ as well, and
 * saying it three times costs nothing.
 */
export const metadata: Metadata = {
  title: "Content Studio · Fraise",
  robots: { index: false, follow: false },
};

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await studioLocale();
  /* The shell is the SIGNED-IN chrome: nav, language switch, sign out.
     Rendering it around the login form would offer links that all
     bounce straight back to the login form. */
  const signedIn = await hasStudioSession();

  return (
    <html
      lang={locale}
      dir={DIR[locale]}
      className={`${geistSans.variable} ${geistMono.variable} ${plexArabic.variable}`}
    >
      <body className="min-h-dvh bg-ink text-bone antialiased">
        {signedIn ? <Shell locale={locale}>{children}</Shell> : children}
      </body>
    </html>
  );
}

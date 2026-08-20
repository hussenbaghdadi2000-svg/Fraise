import type { Metadata } from "next";
import { Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

/**
 * The 404 for URLs that match no route at all.
 *
 * This file exists because the root layout lives at `app/[locale]/` — a
 * top-level dynamic segment. The docs name that exact case: with no
 * single static layout to compose from, a route-level `not-found.js`
 * has nothing to render inside. `global-not-found` is handled at the
 * ROUTING level, so Next skips rendering entirely and returns this.
 *
 * That is also why it declares its own <html>, its own fonts and its
 * own stylesheet import: it bypasses the layout, so nothing is
 * inherited. Only two fonts are loaded, not three — a page nobody wants
 * to be on should not download a display face.
 *
 * EVERY LINK HERE IS A PLAIN <a>, and the lint rule that objects is
 * wrong in this one file. `global-not-found` is handled at the routing
 * level and skips rendering, so the client router is never mounted —
 * <Link> would have no context to prefetch or soft-navigate with. A
 * hard navigation is the correct behaviour here, not a fallback.
 *
 * It is bilingual on purpose. A request that matched no route carries
 * no locale, so guessing one would be wrong half the time. Both ways
 * out are offered instead.
 */

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "404 — Fraise Studio",
  robots: { index: false, follow: false },
};

/* eslint-disable @next/next/no-html-link-for-pages -- see the note above:
   this page is outside the router, so <Link> has nothing to hook into. */
export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl" className={`${mono.variable} ${arabic.variable}`}>
      <body className="min-h-dvh antialiased">
        <main className="flex min-h-dvh flex-col justify-between px-gutter py-beat sm:px-gutter-lg">
          <a
            href="/"
            lang="en"
            dir="ltr"
            className="u-caps w-fit font-mono text-label font-medium text-bone"
          >
            Fraise Studio
          </a>

          <div className="flex flex-col gap-beat">
            <p
              lang="en"
              dir="ltr"
              className="u-caps font-mono text-label text-fraise"
            >
              404
            </p>

            <div className="flex flex-col gap-8">
              <p className="max-w-display text-title font-semibold">
                هذه الصفحة لم تعد موجودة.
              </p>
              <p
                lang="en"
                dir="ltr"
                className="u-display max-w-display text-title font-semibold text-bone-dim"
              >
                This page is no longer here.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-10 gap-y-3">
              <a
                href="/"
                className="u-caps border-b border-hairline pb-1 font-mono text-label text-bone transition-colors duration-300 hover:border-fraise"
              >
                الصفحة الرئيسية
              </a>
              <a
                href="/en/"
                lang="en"
                dir="ltr"
                className="u-caps border-b border-hairline pb-1 font-mono text-label text-bone transition-colors duration-300 hover:border-fraise"
              >
                Homepage
              </a>
              <a
                href="/our-work/"
                className="u-caps border-b border-hairline pb-1 font-mono text-label text-bone-dim transition-colors duration-300 hover:border-fraise hover:text-bone"
              >
                الأعمال
              </a>
            </nav>
          </div>

          <p className="font-mono text-label text-bone-faint">
            <span lang="en" dir="ltr">
              hello@fraise.studio
            </span>
          </p>
        </main>
      </body>
    </html>
  );
}

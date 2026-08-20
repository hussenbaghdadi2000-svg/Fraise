import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { COPY } from "@/content/copy";
import { DIR, assertLocale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";
import { LOCALES } from "@/types/content";
import "../globals.css";

/* next/font downloads these at BUILD time and serves them from our own
   domain. No runtime request to Google, no third-party connection. */

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

/* IBM Plex Sans Arabic is not a variable font, so each weight is a
   separate file. We load only the two we actually use. */
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "600"],
  display: "swap",
});

/**
 * Both locales are known at build time, so both are prerendered.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * `[locale]` matches ANY first path segment — /ar, /en, /pricing,
 * /wp-admin. This turns the two values above into the complete list:
 * anything else returns a 404 at the routing layer, before this
 * layout renders. Without it, /wp-admin would render the whole site
 * with lang="wp-admin".
 */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const locale = assertLocale((await params).locale);
  return {
    /* Makes every relative canonical/OG URL below resolve against the
       real host. VERIFIED: the apex 301s to www, so www is canonical —
       omitting this would emit URLs that cost a redirect hop. */
    metadataBase: new URL(SITE_URL),
    ...COPY[locale].meta,
  };
}

/**
 * The root layout — note it lives inside [locale], not at app/.
 *
 * That is the whole point of Step 2: `dir` is an attribute of the
 * document, so the segment that decides it has to sit ABOVE the root
 * layout. Because it is server-rendered, the very first byte the
 * browser parses already says the page is RTL. Setting direction from
 * JavaScript would mean painting an LTR page and then flipping it.
 */
export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const locale = assertLocale((await params).locale);

  return (
    <html
      lang={locale}
      dir={DIR[locale]}
      className={`${geistSans.variable} ${geistMono.variable} ${plexArabic.variable}`}
    >
      <body className="min-h-dvh antialiased">
        {/*
          Skip link. Every page opens with a header of five links; a
          keyboard or screen-reader user otherwise tabs through all of
          them on every single navigation before reaching content.

          It is not hidden with display:none — that would remove it from
          the tab order and defeat the purpose. It sits off-canvas and
          slides in on :focus-visible, which is the only state where it
          needs to exist. Position is logical (start-6), so it lands on
          the correct side in Arabic.

          :focus, NOT :focus-visible. A skip link is only ever focused
          deliberately, and :focus-visible depends on the engine's
          keyboard heuristics — it does not match programmatic focus, so
          "restore focus here" patterns would move focus to an element
          the user cannot see.
        */}
        <a
          href="#content"
          className="u-caps absolute start-6 top-0 z-50 -translate-y-full border border-hairline bg-ink px-4 py-3 font-mono text-label text-bone transition-transform duration-200 focus:translate-y-4"
        >
          {COPY[locale].home.skip}
        </a>
        <div id="content">{children}</div>
      </body>
    </html>
  );
}

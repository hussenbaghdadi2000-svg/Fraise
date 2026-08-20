import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { Locale } from "@/types/content";

/**
 * The share card. One renderer, every route.
 *
 * Nothing here reaches the client: `ImageResponse` runs on the server
 * and every one of these routes is static, so the PNGs are produced at
 * build time and served as files. The JS budget is untouched.
 *
 * ⚠️ THE FONT IS VENDORED, and it has to be. `next/font/google` hands
 * back a className, not font bytes, and satori needs the bytes. The
 * bundled fallback inside @vercel/og is Geist — Latin only — so an
 * Arabic title would have rendered as a row of empty boxes on the one
 * locale that is this site's primary. IBM Plex Sans Arabic is the same
 * face the site itself uses, downloaded once to assets/fonts/ so the
 * build never depends on a network call.
 *
 * ⚠️ `dir="rtl"` IS NOT OPTIONAL on the Arabic card. Satori does its
 * own text layout; without the direction it lays Arabic out
 * left-to-right and the line reads backwards.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Read once per build rather than per image — 29 project cards times
   two locales is 58 renders through this function. */
const ARABIC = readFileSync(
  join(process.cwd(), "assets/fonts/PlexArabic-SemiBold.ttf"),
);

export interface OgProps {
  locale: Locale;
  /** The Latin kicker — the section or format name. */
  kicker: string;
  /** The page's own title, in its own language. */
  title: string;
  /** Optional third line: a client, a year, a count. */
  meta?: string;
}

export function ogImage({ locale, kicker, title, meta }: OgProps) {
  const rtl = locale === "ar";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          /* The same ink the site is built on, not a generic black. */
          backgroundColor: "#0b0b0c",
          color: "#f4f1ec",
          padding: "72px 80px",
          fontFamily: "Plex",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            letterSpacing: 4,
            color: "#8a8887",
          }}
        >
          <span>FRAISE STUDIO</span>
          <span>{kicker.toUpperCase()}</span>
        </div>

        {/* ⚠️ `alignItems`, NOT `textAlign`. These are flex items, and
            text-align does not move a flex item — the first build set
            direction and text-align on this column and every Arabic
            card still rendered hard against the left edge. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 24,
            alignItems: rtl ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{ width: "100%", height: 1, backgroundColor: "#2a2a2c" }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 68,
              lineHeight: 1.25,
              direction: rtl ? "rtl" : "ltr",
            }}
          >
            {title}
          </div>
          {meta && (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                color: "#a3a09b",
                direction: rtl ? "rtl" : "ltr",
              }}
            >
              {meta}
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Plex", data: ARABIC, style: "normal", weight: 600 }],
    },
  );
}

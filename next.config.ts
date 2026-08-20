import type { NextConfig } from "next";
import { LEGACY_REDIRECTS } from "./content/redirects";

const nextConfig: NextConfig = {
  /**
   * VERIFIED against the live site, not assumed (question B3):
   *   GET https://www.fraise.studio/en  ->  301  ->  /en/
   * and every internal link on the live site ends in a slash.
   *
   * This cannot be changed after launch without invalidating the
   * entire redirect map, so it is set once, here, from evidence.
   */
  trailingSlash: true,

  experimental: {
    /**
     * Required for app/global-not-found.tsx. The root layout lives at
     * app/[locale]/ — a top-level dynamic segment — so there is no
     * static layout for a route-level not-found.js to render inside.
     * The docs name this exact case.
     */
    globalNotFound: true,

    /**
     * Uploads for the content studio.
     *
     * A Server Action buffers its whole request body before the action
     * runs, and the default ceiling is 1 MB — generous for a form and
     * useless for one that uploads posters. Past the limit the framework
     * rejects the request before any of our code executes, so it
     * surfaces as a runtime error with no field attached to it.
     *
     * ⚠️ 4 MB, NOT MORE, AND THE NUMBER IS NOT OURS TO CHOOSE.
     * Vercel caps a serverless function's request body at 4.5 MB at the
     * platform level. Setting this higher would not raise that ceiling;
     * it would move the failure from a message we control to a 413 from
     * the edge, which is worse. 4 MB leaves room for the multipart
     * framing and the text fields that travel with the file.
     *
     * That is comfortably above the studio's real assets — the largest
     * file in public/media/ is a 292 kB poster, and a 2560px master runs
     * to one or two MB. For anything genuinely larger the answer is not
     * a bigger number here, it is uploading straight from the browser to
     * Blob so the bytes never pass through a function at all. See
     * docs/05-database.md §uploads.
     *
     * Same value in both environments now: the dashboard is a
     * production feature since the content moved to Postgres, so a
     * local-only limit would mean uploads behaved differently on the
     * machine where they were tested.
     *
     * Keep this in step with UPLOAD_LIMIT_BYTES in lib/studio/form.ts,
     * which is what refuses an oversized file in the browser before it
     * travels.
     */
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },

  /**
   * Serve studio uploads from Vercel Blob at their /media/ path.
   *
   * ⚠️ `afterFiles`, AND THAT IS THE WHOLE TRICK. Rewrites in that
   * phase run only AFTER Next has failed to find a real file, so the 83
   * assets committed in public/media/ keep being served as static files
   * from the deployment — no extra hop, no blob egress — and only a
   * path with nothing behind it falls through to the blob store.
   *
   * The result is that every row in the database says `/media/x.jpg`
   * whether the bytes are in git or in blob. Storing an absolute blob
   * URL instead would break the parser (which requires an in-origin
   * path) and could never work for DERIVED assets at all, since
   * BtsCard computes `/media/{id}.jpg` itself and has no way to know a
   * hostname.
   *
   * With no BLOB_BASE_URL set this returns nothing and the site behaves
   * exactly as it did before — which is the local-development case.
   */
  async rewrites() {
    const base = process.env.BLOB_BASE_URL;
    if (!base) return { beforeFiles: [], afterFiles: [], fallback: [] };
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: "/media/:path*",
          destination: `${base.endsWith("/") ? base.slice(0, -1) : base}/media/:path*`,
        },
      ],
      fallback: [],
    };
  },

  /**
   * The 301 map. See content/redirects.ts for what each entry is and
   * why — this file only turns that list into config.
   *
   * ⚠️ SELF-REFERENTIAL ENTRIES ARE FILTERED OUT. The map deliberately
   * lists URLs whose slug does NOT change (`/tv-commercials/` →
   * `/tv-commercials/`), so a future slug edit cannot silently drop
   * them. Emitting those as redirects would make each one an infinite
   * loop, and the page would be unreachable rather than merely wrong.
   *
   * There is still no `/` → `/ar/` redirect. proxy.ts serves Arabic AT
   * `/` by rewriting, so the entry point costs no hop at all — and a
   * redirect here would win by execution order and stop proxy.ts from
   * ever seeing the request.
   */
  async redirects() {
    return LEGACY_REDIRECTS.filter(({ from, to }) => from !== to).map(
      ({ from, to }) => ({
        /* The matcher compares against the RAW request path, which
           arrives percent-encoded. A source written in Arabic
           characters silently never matches — the page 404s and the
           redirect looks present in config while doing nothing.
           encodeURI leaves `/` and `#` alone and encodes the rest. */
        source: encodeURI(from),
        destination: encodeURI(to),
        /* 308, not 307: these old URLs are never coming back, and a
           permanent redirect is what transfers the ranking. */
        permanent: true,
      }),
    );
  },
};

export default nextConfig;

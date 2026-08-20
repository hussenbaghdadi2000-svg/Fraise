import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

/**
 * Where an uploaded file goes.
 *
 * ⚠️ VERCEL'S FILESYSTEM IS READ-ONLY. Everything the studio wrote
 * before this file existed went to `public/media/`, which works on a
 * laptop and fails on a serverless function — and fails in the worst
 * way, because `writeFile` to /var/task throws EROFS at the moment
 * someone is uploading a poster, not at deploy time when it could be
 * noticed.
 *
 * So there are two backends and the environment picks:
 *
 *   BLOB_READ_WRITE_TOKEN set  →  Vercel Blob
 *   otherwise                  →  public/media/, exactly as before
 *
 * ⚠️ THE PUBLIC PATH IS `/media/...` IN BOTH CASES. That is the whole
 * design. A blob URL is
 * `https://<store>.public.blob.vercel-storage.com/media/x.jpg`, and
 * storing THAT in the row would break two things at once: the parser
 * requires an in-origin path, and derived assets are COMPUTED as
 * `/media/{id}.jpg` by BtsCard and the team page, so they could never
 * carry a blob host at all.
 *
 * next.config.ts closes the gap with an `afterFiles` rewrite:
 * `/media/:path*` falls through to the blob store ONLY when no file
 * exists in public/. So the 83 committed assets keep being served from
 * the deployment as static files, new uploads are served from blob, and
 * every row in the database says `/media/...` either way.
 */

const PUBLIC_DIR = path.join(process.cwd(), "public");

export function usingBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Guard against a path escaping public/, whichever backend is used. */
function safePublicPath(publicPath: string): string {
  if (!publicPath.startsWith("/media/") || publicPath.includes("..")) {
    throw new Error(`Refusing to write outside /media/: ${publicPath}`);
  }
  return publicPath;
}

export function absolutePublicPath(publicPath: string): string {
  const resolved = path.join(PUBLIC_DIR, publicPath);
  if (!resolved.startsWith(PUBLIC_DIR + path.sep)) {
    throw new Error(`Refusing to touch ${resolved}`);
  }
  return resolved;
}

/**
 * Write bytes and return the path the site will reference.
 *
 * The bytes arrive already validated — lib/studio/media.ts probes the
 * buffer for format and dimensions BEFORE calling this, which is why
 * there is no staging dance here any more. On blob there is nothing to
 * stage: `put` with `allowOverwrite` is atomic from a reader's point of
 * view. On disk the temp-file-and-rename is kept, because a half-written
 * poster served to a visitor is worse than a missing one.
 */
export async function store(
  publicPath: string,
  bytes: Buffer,
  contentType: string,
): Promise<string> {
  safePublicPath(publicPath);

  if (usingBlob()) {
    await put(publicPath.replace(/^\//, ""), bytes, {
      access: "public",
      contentType,
      /* The path is derived from the row id, so re-uploading a poster
         for the same piece MUST land on the same URL. Without this,
         Blob appends a random suffix and the row would point at the
         previous file for ever. */
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return publicPath;
  }

  const destination = absolutePublicPath(publicPath);
  const staged = `${destination}.upload`;
  await mkdir(path.dirname(destination), { recursive: true });
  try {
    await writeFile(staged, bytes);
    await rename(staged, destination);
  } catch (error) {
    await rm(staged, { force: true });
    throw error;
  }
  return publicPath;
}

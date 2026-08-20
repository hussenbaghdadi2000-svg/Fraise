import path from "node:path";
import { head } from "@vercel/blob";
import { ContentError } from "@/lib/content-schema";
import type { AssetField } from "@/lib/studio/collections";
import { UPLOAD_LIMIT_BYTES, formatBytes } from "@/lib/studio/form";
import { probe, probeBuffer, probeUrl, type Probe } from "@/lib/studio/probe";
import {
  absolutePublicPath,
  store,
  usingBlob,
} from "@/lib/studio/storage";
import type { Ratio } from "@/types/content";

export { absolutePublicPath };

/**
 * Uploads, and the ratio check that is the point of having them.
 */

/**
 * The server-side backstop.
 *
 * In practice this rarely fires: the framework enforces
 * `serverActions.bodySizeLimit` on the whole request before this action
 * is ever entered, and RowForm refuses an oversized selection in the
 * browser before it travels. It is here for the case those two miss —
 * a single file just under the request ceiling — and because a write
 * path should not depend on a caller having checked.
 */
const MAX_BYTES = UPLOAD_LIMIT_BYTES;

/**
 * `.jpeg` and `.jpg` are the same format with two spellings, and a
 * camera or an export preset will hand you either. Normalising here
 * rather than accepting both keeps one filename convention on disk.
 */
const CANONICAL: Record<string, string> = {
  ".jpeg": ".jpg",
  ".jpg": ".jpg",
  ".png": ".png",
  ".webp": ".webp",
  ".mp4": ".mp4",
  ".m4v": ".mp4",
};

/** Blob needs a content type; a browser will not play an mp4 served as
    application/octet-stream. */
const CONTENT_TYPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
};

/** What the bytes actually turned out to be, per extension. */
const FORMAT_FOR: Record<string, Probe["format"]> = {
  ".jpg": "jpeg",
  ".png": "png",
  ".webp": "webp",
  ".mp4": "mp4",
};

/** "2.39:1" → 2.39. The taxonomy as a number the arithmetic can use. */
export function ratioValue(ratio: Ratio): number {
  const [width, height] = ratio.split(":").map(Number);
  return width / height;
}

/**
 * Does this file carry the ratio its pillar claims?
 *
 * The tolerance is 2%, and it is not slack — it is the real spread in
 * the studio's own exports. A 2.39:1 master lands at 2200×920 (2.391)
 * and its preview loop at 642×268 (2.396), because both are integer
 * crops of a 1080p frame and neither divides evenly. An exact match
 * would report every correctly-cropped file on the site as wrong.
 */
export function ratioMatches(
  measured: Probe,
  expected: Ratio,
  tolerance = 0.02,
): boolean {
  const actual = measured.width / measured.height;
  const target = ratioValue(expected);
  return Math.abs(actual - target) / target <= tolerance;
}

/** How a ratio reads in a warning: "2200×920 is 2.39:1". */
export function describeRatio(measured: Probe): string {
  const value = measured.width / measured.height;
  const named: [Ratio, number][] = (
    ["2.39:1", "16:9", "9:16", "4:5", "1:1"] as Ratio[]
  ).map((ratio) => [ratio, ratioValue(ratio)]);
  const nearest = named.find(
    ([, target]) => Math.abs(value - target) / target <= 0.02,
  );
  return nearest ? nearest[0] : value.toFixed(3) + ":1";
}

export interface Upload {
  /** The public path the file landed on, e.g. /media/karam-menu.jpg */
  path: string;
  measured: Probe | null;
}

/**
 * Write one uploaded file to the path its field's template names.
 *
 * ⚠️ THE EXTENSION IS CHECKED AGAINST THE BYTES, not just the filename.
 * A PNG saved as `.jpg` is the failure this catches: it decodes fine in
 * every browser, so nothing looks wrong, and it silently costs several
 * times the bytes on a page whose whole media strategy is weight.
 * `probe` reads the real magic number and the mismatch is refused.
 */
export async function saveUpload(
  file: File,
  field: AssetField,
  id: string,
): Promise<Upload> {
  if (file.size === 0) {
    throw new ContentError(`${field.name}: the uploaded file is empty`);
  }
  if (file.size > MAX_BYTES) {
    throw new ContentError(
      `${field.name}: ${formatBytes(file.size)} is past the ${formatBytes(MAX_BYTES)} ceiling`,
    );
  }

  const raw = path.extname(file.name).toLowerCase();
  const extension = CANONICAL[raw];
  if (!extension || !field.ext.includes(extension)) {
    throw new ContentError(
      `${field.name}: expected ${field.ext.join(" or ")} (got "${raw || "no extension"}")`,
    );
  }

  const publicPath = field.template
    .replace("{id}", id)
    .replace("{ext}", extension);

  /* ⚠️ PROBE THE BYTES BEFORE STORING ANYTHING.
     This used to write a staging file next to the target and probe
     that, so a rejected upload never clobbered a working poster. On a
     read-only serverless filesystem there is no staging file to write —
     but there is no need for one either, because the bytes are already
     in memory. Validate, then store once. */
  const bytes = Buffer.from(await file.arrayBuffer());
  const measured = await probeBuffer(bytes);

  if (!measured) {
    throw new ContentError(
      `${field.name}: could not read this file as ${extension} — it may be corrupt`,
    );
  }
  if (measured.format !== FORMAT_FOR[extension]) {
    throw new ContentError(
      `${field.name}: the file is named ${extension} but the bytes are ${measured.format}`,
    );
  }

  await store(publicPath, bytes, file.type || CONTENT_TYPE[extension]);
  return { path: publicPath, measured };
}

/**
 * Measure an asset by its PUBLIC PATH, wherever it actually lives.
 *
 * Disk first: the 83 committed assets are still served straight out of
 * public/ on every deploy, and reading them locally costs nothing. Only
 * when there is no such file does this ask the blob store — which is
 * exactly the set of files the studio has uploaded since.
 *
 * Returns null when neither knows about it, which is what the Health
 * page reports as "missing or unreadable".
 */
export async function probePublicPath(publicPath: string): Promise<Probe | null> {
  const onDisk = await probe(absolutePublicPath(publicPath));
  if (onDisk) return onDisk;
  if (!usingBlob()) return null;

  try {
    const blob = await head(publicPath.slice(1));
    return await probeUrl(blob.url);
  } catch {
    return null;
  }
}

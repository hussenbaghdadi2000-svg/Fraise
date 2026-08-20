import { open } from "node:fs/promises";

/**
 * Pixel dimensions, read from the file's own header. Zero dependencies.
 *
 * WHY BOTHER.
 *
 * "Aspect ratio is the service taxonomy" is the load-bearing rule on
 * this site: a visitor learns that a 9:16 frame is a Reel without ever
 * reading a label. Which means a 16:9 file dropped onto a `reels` row
 * is not a cosmetic slip — it is the page teaching the wrong thing. The
 * frames are `object-cover`, so it will not look broken; it will look
 * cropped, and nobody will know why until someone opens the file.
 *
 * A ratio check therefore has to happen at the moment of upload, and
 * that needs real dimensions. `sharp` or `probe-image-size` would each
 * be a dependency this project has spent considerable effort not
 * having, for a job that is a few dozen bytes of header parsing.
 *
 * WHY IT SEEKS RATHER THAN READS.
 *
 * The Health page probes every asset on the site — around eighty files,
 * half of them video. Slurping those would be several hundred megabytes
 * to learn a hundred and sixty numbers. Images read one chunk off the
 * front; MP4 walks the box tree through a file handle, so a `moov` atom
 * sitting at the END of a non-faststart export costs a few seeks rather
 * than the whole file.
 */
export interface Probe {
  width: number;
  height: number;
  format: "jpeg" | "png" | "webp" | "mp4";
  bytes: number;
}

/** Enough to clear a JPEG's EXIF block and reach the frame header. */
const HEAD = 256 * 1024;

/** The shared parse, once the bytes can be reached however they arrive. */
async function probeReader(reader: Reader): Promise<Probe | null> {
  if (reader.size < 16) return null;
  const head = await reader.read(0, Math.min(HEAD, reader.size));

  const image = readImage(head);
  if (image) return { ...image, bytes: reader.size };

  if (isMp4(head)) {
    const box = await readMp4(reader);
    if (box) return { ...box, format: "mp4", bytes: reader.size };
  }
  return null;
}

/** A file on disk. */
export async function probe(absolutePath: string): Promise<Probe | null> {
  let handle;
  try {
    handle = await open(absolutePath, "r");
  } catch {
    return null;
  }
  try {
    const { size } = await handle.stat();
    const reader: Reader = {
      size,
      async read(offset, length) {
        const buffer = Buffer.alloc(Math.max(0, Math.min(length, size - offset)));
        if (buffer.length === 0) return buffer;
        const { bytesRead } = await handle!.read(buffer, 0, buffer.length, offset);
        return buffer.subarray(0, bytesRead);
      },
    };
    return await probeReader(reader);
  } catch {
    return null;
  } finally {
    await handle.close();
  }
}

/**
 * Bytes already in memory.
 *
 * ⚠️ THIS IS THE UPLOAD PATH NOW. The file is validated BEFORE it is
 * stored, which is what lets a wrong format be refused without ever
 * touching the poster it was going to replace — on a read-only
 * filesystem there is no temp file to stage into.
 */
export async function probeBuffer(bytes: Buffer): Promise<Probe | null> {
  return probeReader({
    size: bytes.length,
    async read(offset, length) {
      return bytes.subarray(offset, offset + length);
    },
  });
}

/**
 * A file behind a URL, read with HTTP Range requests.
 *
 * For assets served from Vercel Blob, where the Health page has no disk
 * to look at. Range is what keeps this honest: probing eighty remote
 * files by downloading them would be hundreds of megabytes to learn a
 * hundred and sixty numbers.
 */
export async function probeUrl(url: string): Promise<Probe | null> {
  let size: number;
  try {
    const head = await fetch(url, { method: "HEAD" });
    if (!head.ok) return null;
    size = Number(head.headers.get("content-length") ?? 0);
    if (!Number.isFinite(size) || size < 16) return null;
    /* No range support means every read would return the whole file.
       Better to report nothing than to pull the file eight times. */
    if (head.headers.get("accept-ranges") !== "bytes") return null;
  } catch {
    return null;
  }

  return probeReader({
    size,
    async read(offset, length) {
      const end = Math.min(offset + length, size) - 1;
      if (end < offset) return Buffer.alloc(0);
      const response = await fetch(url, {
        headers: { Range: `bytes=${offset}-${end}` },
      });
      if (!response.ok) return Buffer.alloc(0);
      return Buffer.from(await response.arrayBuffer());
    },
  });
}

/* ---------- images ------------------------------------------------- */

function readImage(
  buffer: Buffer,
): { width: number; height: number; format: "jpeg" | "png" | "webp" } | null {
  if (buffer.length >= 24 && buffer.readUInt32BE(0) === 0x89504e47) {
    /* PNG. IHDR is mandated to be the first chunk, so the offsets are
       fixed: 8 signature, 4 length, 4 type, then width and height. */
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
      format: "png",
    };
  }

  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    return readJpeg(buffer);
  }

  if (
    buffer.length >= 30 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return readWebp(buffer);
  }

  return null;
}

/**
 * JPEG is a chain of marker segments, so this walks rather than
 * indexes. Skipping each segment by its declared length is also what
 * carries it safely over an EXIF block containing a whole second JPEG
 * (the embedded thumbnail) — a naive scan for a start-of-frame marker
 * finds the thumbnail's dimensions instead of the image's.
 */
function readJpeg(
  buffer: Buffer,
): { width: number; height: number; format: "jpeg" } | null {
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];

    /* Padding and standalone markers carry no length field. */
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }

    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2) return null;

    /* Every start-of-frame variant lays out precision, height, width
       identically — baseline, progressive, arithmetic and lossless
       alike. C4, C8 and CC are in the same numeric range but are NOT
       frame headers, which is the usual off-by-one in this parser. */
    const isFrameHeader =
      (marker >= 0xc0 && marker <= 0xcf) &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;

    if (isFrameHeader) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
        format: "jpeg",
      };
    }

    offset += 2 + length;
  }
  return null;
}

/** Three container variants, and the client logos use two of them. */
function readWebp(
  buffer: Buffer,
): { width: number; height: number; format: "webp" } | null {
  const chunk = buffer.toString("ascii", 12, 16);

  if (chunk === "VP8 ") {
    /* Lossy. The 3-byte sync code is what confirms the frame header
       starts where we think it does. */
    if (buffer[23] !== 0x9d || buffer[24] !== 0x01 || buffer[25] !== 0x2a) {
      return null;
    }
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
      format: "webp",
    };
  }

  if (chunk === "VP8L") {
    if (buffer[20] !== 0x2f) return null;
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
      format: "webp",
    };
  }

  if (chunk === "VP8X") {
    /* Extended. Dimensions are 24-bit little-endian, stored minus one. */
    const width = buffer.readUIntLE(24, 3) + 1;
    const height = buffer.readUIntLE(27, 3) + 1;
    return { width, height, format: "webp" };
  }

  return null;
}

/* ---------- mp4 ---------------------------------------------------- */

/**
 * Where the bytes come from.
 *
 * ⚠️ ADDED WHEN UPLOADS MOVED TO VERCEL BLOB. The MP4 walker seeks —
 * that is the point of it, so a `moov` atom at the end of a
 * non-faststart export costs a few reads instead of the whole file —
 * and seeking used to mean a file handle. On a serverless deploy the
 * file is not on a disk at all, and during an upload it is a Buffer in
 * memory that has not been written anywhere yet.
 *
 * One interface, three sources: a file, a buffer, and an HTTP range
 * request. The parsing below did not have to change for any of them.
 */
export interface Reader {
  size: number;
  read(offset: number, length: number): Promise<Buffer>;
}

function isMp4(head: Buffer): boolean {
  return head.length >= 12 && head.toString("ascii", 4, 8) === "ftyp";
}

/**
 * Walk moov → trak → tkhd and read the track's display size.
 *
 * `tkhd` is the right box rather than the video sample description
 * (`stsd`): stsd carries the CODED size, tkhd carries the size the file
 * asks to be DISPLAYED at. They differ whenever there is anamorphic
 * pixel aspect, which is exactly the case a cinema-ratio studio hits —
 * a 2.39:1 master is routinely coded 1920×1080 with a stretch applied.
 * Reading stsd would report every one of those as 16:9.
 */
async function readMp4(
  reader: Reader,
): Promise<{ width: number; height: number } | null> {
  const moov = await findBox(reader, 0, reader.size, "moov");
  if (!moov) return null;

  let best: { width: number; height: number } | null = null;
  let cursor = moov.start;

  /* Several traks: video, audio, sometimes timecode. The audio track's
     tkhd is a valid box with a 0×0 display size, so the largest wins
     rather than the first. */
  while (cursor < moov.end) {
    const trak = await findBox(reader, cursor, moov.end, "trak");
    if (!trak) break;
    const tkhd = await findBox(reader, trak.start, trak.end, "tkhd");
    if (tkhd) {
      const track = await readTkhd(reader, tkhd.start, tkhd.end);
      if (track && track.width > 0 && track.height > 0) {
        if (!best || track.width * track.height > best.width * best.height) {
          best = track;
        }
      }
    }
    cursor = trak.end;
  }
  return best;
}

interface Box {
  /** First byte of the box's PAYLOAD, not of its header. */
  start: number;
  end: number;
}

async function findBox(
  reader: Reader,
  from: number,
  until: number,
  type: string,
): Promise<Box | null> {
  let cursor = from;

  while (cursor + 8 <= until) {
    const header = await reader.read(cursor, 16);
    const bytesRead = header.length;
    if (bytesRead < 8) return null;

    let boxSize = header.readUInt32BE(0);
    const boxType = header.toString("ascii", 4, 8);
    let payload = cursor + 8;

    if (boxSize === 1) {
      /* 64-bit largesize. Node cannot index a buffer past 2^53, and a
         file that big is not a poster loop — reading the low half is
         both safe and sufficient. */
      if (bytesRead < 16) return null;
      boxSize = Number(header.readBigUInt64BE(8));
      payload = cursor + 16;
    } else if (boxSize === 0) {
      /* Runs to the end of the file. */
      boxSize = until - cursor;
    }

    if (boxSize < 8) return null;
    const end = Math.min(cursor + boxSize, until);
    if (boxType === type) return { start: payload, end };
    cursor = end;
  }
  return null;
}

async function readTkhd(
  reader: Reader,
  start: number,
  end: number,
): Promise<{ width: number; height: number } | null> {
  const length = end - start;
  if (length < 84) return null;

  const box = await reader.read(start, Math.min(length, 96));
  if (box.length < 84) return null;

  const version = box[0];
  /* v0 packs the times into 32 bits, v1 into 64 — a 12-byte shift in
     everything after it. */
  const afterTimes = version === 1 ? 4 + 32 : 4 + 20;
  /* reserved(8) layer(2) alternate_group(2) volume(2) reserved(2) */
  const matrix = afterTimes + 16;
  const dimensions = matrix + 36;
  if (dimensions + 8 > box.length) return null;

  /* 16.16 fixed point. The fraction is real — a 2.39:1 crop of a 1080p
     master lands on 803.5 — but a rounded pixel count is all the ratio
     check needs. */
  const width = Math.round(box.readUInt32BE(dimensions) / 65536);
  const height = Math.round(box.readUInt32BE(dimensions + 4) / 65536);

  /* The display matrix can rotate the track a quarter turn, and a
     phone-shot 9:16 reel is very often stored as a rotated 16:9. The
     stored dimensions are pre-rotation, so reporting them would call a
     correct vertical file a wrong horizontal one. a=d=0 with b or c
     set is the 90°/270° case. */
  const a = box.readInt32BE(matrix);
  const b = box.readInt32BE(matrix + 4);
  const c = box.readInt32BE(matrix + 12);
  const d = box.readInt32BE(matrix + 16);
  const quarterTurn = a === 0 && d === 0 && (b !== 0 || c !== 0);

  return quarterTurn ? { width: height, height: width } : { width, height };
}

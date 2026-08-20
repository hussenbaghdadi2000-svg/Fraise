"use client";

import { useEffect, useRef, useState } from "react";
import { Note } from "@/components/studio/Note";
import type { AssetField } from "@/lib/studio/collections";
import { STUDIO_COPY } from "@/lib/studio/copy";
import { formatBytes } from "@/lib/studio/form";
import type { AssetStatus } from "@/lib/studio/health";
import type { Locale } from "@/types/content";

/**
 * A poster, a loop, a mark — the file half of a row.
 *
 * WHY THIS ONE IS A CLIENT COMPONENT.
 *
 * Everything else in the studio renders on the server. This does not,
 * because the single most useful thing it can do is show you the file
 * you just picked BEFORE you commit it. `URL.createObjectURL` is the
 * only way to see a local file without a round trip, and the whole
 * point of a ratio check is to catch a wrong crop while it is still a
 * choice rather than after it is on the page.
 *
 * It stays a leaf: no data fetching, no routing, no form state. The
 * form around it is a Server Component and the submit is a Server
 * Action, so this is the only piece of the screen that hydrates.
 *
 * TWO INPUTS, ONE MEANING. A path you can type and a file you can
 * upload. The upload wins when there is one — see resolveAsset in
 * lib/studio/actions.ts. Typing matters for the inherited filenames:
 * `/media/logos/Four-Seasones.png` is a typo in a real file, and
 * correcting the row should not require re-exporting the mark.
 */
export interface AssetInputProps {
  field: AssetField;
  /** Null on a new row — nothing has been uploaded yet. */
  status: AssetStatus | null;
  locale: Locale;
}

const IMAGE = /\.(jpe?g|png|webp)$/i;

export function AssetInput({ field, status, locale }: AssetInputProps) {
  const copy = STUDIO_COPY[locale];
  const [picked, setPicked] = useState<{ url: string; file: File } | null>(null);
  /* Kept in a ref as well so the cleanup effect can revoke the URL
     without re-running every time the state object identity changes. */
  const objectUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    /* Revoke the previous one first. Picking three files in a row
       otherwise leaks two decoded images for the life of the page. */
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    if (!file) {
      objectUrl.current = null;
      setPicked(null);
      return;
    }
    const url = URL.createObjectURL(file);
    objectUrl.current = url;
    setPicked({ url, file });
  }

  const currentIsImage = status !== null && IMAGE.test(status.path);
  const pickedIsImage = picked !== null && picked.file.type.startsWith("image/");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start gap-4">
        {/* The file as it stands, measured on the server. */}
        <figure className="flex flex-col gap-2">
          <span className="u-caps font-mono text-label text-bone-faint">
            {copy.currentFile}
          </span>
          <div className="relative flex h-24 w-32 items-center justify-center overflow-hidden border border-hairline bg-ink-raised">
            {currentIsImage && status.path !== "" ? (
              /* eslint-disable-next-line @next/next/no-img-element --
                 the project does not use next/image; see the measured
                 reasoning in components/media/Poster.tsx. */
              <img
                src={status.path}
                alt=""
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="px-2 text-center font-mono text-label text-bone-faint">
                {status && status.measured
                  ? `${status.measured.format.toUpperCase()}`
                  : copy.noFile}
              </span>
            )}
          </div>
          {status?.measured && (
            <figcaption
              lang="en"
              dir="ltr"
              className="font-mono text-label text-bone-faint"
            >
              {status.measured.width}×{status.measured.height} ·{" "}
              {formatBytes(status.measured.bytes)}
            </figcaption>
          )}
        </figure>

        {/* The file about to replace it, straight off the disk. */}
        {picked && (
          <figure className="flex flex-col gap-2">
            <span className="u-caps font-mono text-label text-bone">
              {copy.chooseFile} →
            </span>
            <div className="relative flex h-24 w-32 items-center justify-center overflow-hidden border border-bone-faint bg-ink-raised">
              {pickedIsImage ? (
                /* eslint-disable-next-line @next/next/no-img-element --
                   a blob: URL, which next/image cannot take anyway. */
                <img
                  src={picked.url}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                <video
                  src={picked.url}
                  muted
                  playsInline
                  loop
                  autoPlay
                  className="h-full w-full object-contain"
                />
              )}
            </div>
            <figcaption
              lang="en"
              dir="ltr"
              className="max-w-32 truncate font-mono text-label text-bone-dim"
            >
              {formatBytes(picked.file.size)}
            </figcaption>
          </figure>
        )}
      </div>

      {/* The path. Only for stored fields — a derived one is computed
          from the id by the component that renders it, so there is
          nothing here for a person to set. */}
      {field.stored && (
        <input
          type="text"
          name={field.name}
          defaultValue={status?.path ?? ""}
          lang="en"
          dir="ltr"
          spellCheck={false}
          placeholder={field.template}
          className="w-full border border-hairline bg-ink-raised px-3 py-2 font-mono text-caption text-bone placeholder:text-bone-faint focus:outline-2 focus:outline-fraise"
        />
      )}

      <input
        type="file"
        name={`${field.name}.file`}
        accept={field.ext.join(",")}
        onChange={onPick}
        lang="en"
        dir="ltr"
        className="w-full cursor-pointer border border-hairline bg-ink-raised px-3 py-2 font-mono text-caption text-bone-dim file:me-3 file:cursor-pointer file:border-0 file:bg-transparent file:p-0 file:font-mono file:text-label file:text-bone focus:outline-2 focus:outline-fraise"
      />

      <p className="text-caption text-bone-faint">
        {copy.keepFile}{" "}
        <span lang="en" dir="ltr" className="font-mono">
          {field.ext.join(" / ")} → {field.template}
        </span>
      </p>

      {status?.problems.map((problem, index) => (
        <Note
          key={index}
          severity={problem.severity}
          message={problem.message[locale]}
          locale={locale}
        />
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AssetInput } from "@/components/studio/AssetInput";
import { Note } from "@/components/studio/Note";
import { DIR, LOCALE_NAME } from "@/lib/i18n";
import { isLatinField, type Field, type Row } from "@/lib/studio/collections";
import { STUDIO_COPY } from "@/lib/studio/copy";
import {
  EMPTY_STATE,
  UPLOAD_LIMIT_BYTES,
  formatBytes,
  type FormState,
} from "@/lib/studio/form";
import type { AssetStatus } from "@/lib/studio/health";
import { LOCALES, type Locale } from "@/types/content";

/**
 * One row, as a form. The generic one — there is no per-collection form.
 *
 * WHY `useActionState` AND NOT A PLAIN SERVER FORM.
 *
 * Everything else here avoids client JavaScript, and a `<form>` posting
 * to a Server Action needs none. But a rejected save has to say WHY
 * without throwing away eight fields of typed Arabic, and the 0 kB
 * version of that is a redirect carrying an error code — which reloads
 * the page and empties every input.
 *
 * `useActionState` keeps the error beside the button and the inputs
 * untouched. They are uncontrolled, so the browser preserves what was
 * typed across the re-render on its own; no value is echoed back from
 * the server and none needs to be. The file input resets, which is
 * correct — a picker still holding a stale selection is how you upload
 * the wrong file twice.
 *
 * This is a leaf. It renders inputs and a submit; it fetches nothing.
 */
export interface RowFormProps {
  fields: Field[];
  /** Null when creating. */
  row: Row | null;
  assets: AssetStatus[];
  locale: Locale;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  cancelHref: string;
  /** Shown after a redirect from a successful create. */
  justCreated?: boolean;
}

/**
 * ⚠️ NO WIDTH IN HERE, DELIBERATELY.
 *
 * It used to start with `w-full`, and the year box then rendered full
 * width despite carrying `w-32` at its call site. Tailwind resolves two
 * utilities that set the same property by their order in the GENERATED
 * STYLESHEET, not by their order in the class attribute — so appending
 * a narrower width to a string that already has `w-full` is a coin
 * toss. Width is set per field instead, where it is a real decision:
 * a year is four characters and a title is a sentence.
 */
const INPUT =
  "border border-hairline bg-ink-raised px-3 py-2 text-body text-bone placeholder:text-bone-faint focus:outline-2 focus:outline-fraise";

export function RowForm({
  fields,
  row,
  assets,
  locale,
  action,
  cancelHref,
  justCreated = false,
}: RowFormProps) {
  const copy = STUDIO_COPY[locale];
  const [state, submit, pending] = useActionState(action, EMPTY_STATE);
  const [tooLarge, setTooLarge] = useState<string | null>(null);
  const isNew = row === null;

  /**
   * Stop an oversized submission before it leaves the browser.
   *
   * A Server Action buffers the WHOLE request body, and past
   * `serverActions.bodySizeLimit` the framework rejects it before the
   * action is entered — so there is nothing for the action to catch and
   * no field to hang the failure on. It surfaces as a bare
   * "Body exceeded 1 MB limit" runtime error, which tells the person
   * holding a 12 MB master nothing they can act on.
   *
   * The limit is on the REQUEST, so the poster and the loop are weighed
   * together rather than one at a time. The margin covers the text
   * fields and the multipart framing that travel with them.
   */
  function guardSize(event: React.FormEvent<HTMLFormElement>) {
    let bytes = 0;
    for (const input of event.currentTarget.querySelectorAll("input[type=file]")) {
      const files = (input as HTMLInputElement).files;
      if (files) for (const file of files) bytes += file.size;
    }
    if (bytes > UPLOAD_LIMIT_BYTES - 512 * 1024) {
      event.preventDefault();
      setTooLarge(
        `${copy.tooLarge} — ${formatBytes(bytes)} / ${formatBytes(UPLOAD_LIMIT_BYTES)}`,
      );
      return;
    }
    setTooLarge(null);
  }

  return (
    <form
      onSubmit={guardSize}
      action={submit}
      /*
        ⚠️ NO `encType` HERE, AND IT IS NOT AN OVERSIGHT.
        The instinct with a file input is `encType="multipart/form-data"`,
        and React rejects it out loud: "Cannot specify a encType or method
        for a form that specifies a function as the action. React provides
        those automatically. They will get overridden." When the action is
        a function, React owns the transport and encodes the File objects
        itself. Setting it is a dev-console error for no behaviour change.
      */
      className="flex max-w-[52rem] flex-col gap-bar"
    >
      <div className="flex flex-col gap-beat">
        {fields.map((field) => (
          <FieldBlock
            key={field.name}
            field={field}
            row={row}
            asset={assets.find((entry) => entry.field.name === field.name) ?? null}
            locale={locale}
            isNew={isNew}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {tooLarge && (
          <Note severity="error" message={tooLarge} locale={locale} />
        )}
        {state.error && !tooLarge && (
          <Note severity="error" message={state.error} locale={locale} />
        )}
        {(state.ok || justCreated) && !state.error && !tooLarge && (
          <p
            role="status"
            className="border-s-2 border-hairline bg-ink-raised px-4 py-3 text-caption text-bone-dim"
          >
            {copy.savedRow}
          </p>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="border border-bone px-6 py-2.5 text-body text-bone transition-colors duration-200 hover:border-fraise focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fraise disabled:opacity-50"
          >
            {pending ? copy.saving : copy.save}
          </button>
          <Link
            href={cancelHref}
            className="text-caption text-bone-dim transition-colors duration-200 hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fraise"
          >
            {copy.cancel}
          </Link>
        </div>
      </div>
    </form>
  );
}

function FieldBlock({
  field,
  row,
  asset,
  locale,
  isNew,
}: {
  field: Field;
  row: Row | null;
  asset: AssetStatus | null;
  locale: Locale;
  isNew: boolean;
}) {
  const copy = STUDIO_COPY[locale];
  const value = row?.[field.name];
  const latin = isLatinField(field);

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={field.name}
        className="u-caps w-fit font-mono text-label text-bone-dim"
      >
        {field.label[locale]}
      </label>

      {field.help && (
        <p className="max-w-[62ch] text-caption leading-relaxed text-bone-faint">
          {field.help[locale]}
        </p>
      )}

      {field.kind === "id" && (
        <>
          <input
            id={field.name}
            name={field.name}
            type="text"
            required
            /* ⚠️ The id is the filename on disk and the join key that
               content/curation.ts points at. Renaming it in place would
               orphan the media and break the curation silently, so the
               field is readonly once the row exists — deliberate, not an
               oversight. */
            readOnly={!isNew}
            defaultValue={typeof value === "string" ? value : ""}
            lang="en"
            dir="ltr"
            spellCheck={false}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={`${INPUT} w-full font-mono ${isNew ? "" : "text-bone-faint"}`}
          />
          {!isNew && (
            <p className="text-caption text-bone-faint">{copy.idLocked}</p>
          )}
        </>
      )}

      {field.kind === "slug" && (
        /* Editable, unlike the id above it — a slug is a public URL and
           may legitimately need to move. The parser still holds it to
           kebab-case and to being unique across the collection. */
        <input
          id={field.name}
          name={field.name}
          type="text"
          required
          defaultValue={typeof value === "string" ? value : ""}
          lang="en"
          dir="ltr"
          spellCheck={false}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className={`${INPUT} w-full font-mono`}
        />
      )}

      {(field.kind === "text" || field.kind === "url") && (
        <input
          id={field.name}
          name={field.name}
          type={field.kind === "url" ? "url" : "text"}
          required={!(field.kind === "text" && field.optional)}
          defaultValue={typeof value === "string" ? value : ""}
          /* Latin in both locales. Without the explicit dir this
             inherits RTL from the document on an Arabic dashboard and
             puts the caret and the punctuation on the wrong side of a
             brand name. */
          lang={latin ? "en" : undefined}
          dir={latin ? "ltr" : undefined}
          className={`${INPUT} w-full ${field.kind === "url" ? "font-mono text-caption" : ""}`}
        />
      )}

      {field.kind === "number" && (
        <input
          id={field.name}
          name={field.name}
          type="number"
          required
          min={field.min}
          max={field.max}
          inputMode="numeric"
          defaultValue={typeof value === "number" ? value : ""}
          lang="en"
          dir="ltr"
          className={`${INPUT} w-32 font-mono`}
        />
      )}

      {field.kind === "select" && (
        <select
          id={field.name}
          name={field.name}
          defaultValue={typeof value === "string" ? value : field.options[0].value}
          className={`${INPUT} w-fit`}
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label[locale]}
            </option>
          ))}
        </select>
      )}

      {(field.kind === "bilingual" || field.kind === "prose") && (
        /*
          ONE INPUT PER LANGUAGE, each carrying its OWN lang and dir.
          Not the dashboard's direction — the CONTENT's. Typing Arabic
          into an ltr box works but reads back wrong, and it is how a
          stray Latin comma ends up on the wrong end of a sentence.
        */
        <div className="grid gap-4 sm:grid-cols-2">
          {LOCALES.map((entry) => {
            const pair =
              typeof value === "object" && value !== null
                ? (value as Record<string, unknown>)
                : {};
            const text = pair[entry];
            const name = `${field.name}.${entry}`;
            return (
              <div key={entry} className="flex flex-col gap-1.5">
                <label
                  htmlFor={name}
                  lang={entry}
                  className="font-mono text-label text-bone-faint"
                >
                  {LOCALE_NAME[entry]}
                </label>
                {field.kind === "prose" ? (
                  <textarea
                    id={name}
                    name={name}
                    rows={6}
                    required
                    defaultValue={typeof text === "string" ? text : ""}
                    lang={entry}
                    dir={DIR[entry]}
                    className={`${INPUT} w-full resize-y leading-relaxed`}
                  />
                ) : (
                  <input
                    id={name}
                    name={name}
                    type="text"
                    required
                    defaultValue={typeof text === "string" ? text : ""}
                    lang={entry}
                    dir={DIR[entry]}
                    className={`${INPUT} w-full`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {field.kind === "asset" && (
        <AssetInput field={field} status={asset} locale={locale} />
      )}
    </div>
  );
}

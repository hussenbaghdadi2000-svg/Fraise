"use client";

import { useActionState } from "react";
import { Note } from "@/components/studio/Note";
import { signIn } from "@/lib/studio/actions";
import { STUDIO_COPY } from "@/lib/studio/copy";
import { EMPTY_STATE } from "@/lib/studio/form";
import type { Locale } from "@/types/content";

/**
 * The door.
 *
 * A Client Component for the same reason RowForm is one: the failure
 * has to be readable without a page reload that empties the field. It
 * is the only interactive part of this screen.
 *
 * ⚠️ THE ERROR IS A CODE, NOT A SENTENCE. `signIn` returns
 * "wrong-password" and the wording is chosen HERE, in the locale the
 * dashboard is speaking. Returning a ready-made English string from the
 * server would mean the one screen an Arabic-speaking studio sees first
 * is the one screen that is not in Arabic.
 */
export function LoginForm({ locale }: { locale: Locale }) {
  const copy = STUDIO_COPY[locale];
  const [state, submit, pending] = useActionState(signIn, EMPTY_STATE);

  return (
    <form action={submit} className="flex w-full max-w-sm flex-col gap-5">
      <label
        htmlFor="password"
        className="u-caps font-mono text-label text-bone-dim"
      >
        {copy.password}
      </label>

      <input
        id="password"
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        /* Latin: the password is not prose, and an RTL password field
           puts the caret on the wrong side of what you are typing. */
        lang="en"
        dir="ltr"
        className="w-full border border-hairline bg-ink-raised px-3 py-2.5 font-mono text-body text-bone focus:outline-2 focus:outline-fraise"
      />

      {state.error && (
        <Note severity="error" message={copy.wrongPassword} locale={locale} />
      )}

      <button
        type="submit"
        disabled={pending}
        className="border border-bone px-6 py-2.5 text-body text-bone transition-colors duration-200 hover:border-fraise focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fraise disabled:opacity-50"
      >
        {pending ? copy.saving : copy.signIn}
      </button>
    </form>
  );
}

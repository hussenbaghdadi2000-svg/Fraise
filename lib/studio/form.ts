/**
 * The state `useActionState` carries between submissions.
 *
 * ⚠️ IT LIVES HERE AND NOT IN actions.ts BECAUSE OF A HARD RULE: a
 * module marked `"use server"` may export ASYNC FUNCTIONS AND NOTHING
 * ELSE. Every export becomes a callable POST endpoint, so a plain
 * constant sitting beside the actions is a build error rather than a
 * style preference.
 *
 * There is no `values` field. Echoing the submitted values back would
 * be wasted work: the inputs are uncontrolled, so the browser keeps
 * whatever was typed across the re-render, and a failed save leaves the
 * form exactly as the person left it. Only the file input resets, which
 * is what you want — a file picker holding a stale selection is how you
 * upload the wrong thing twice.
 */
export interface FormState {
  ok: boolean;
  error?: string;
}

export const EMPTY_STATE: FormState = { ok: false };

/**
 * The upload ceiling, in bytes.
 *
 * ⚠️ THIS NUMBER LIVES IN THREE PLACES AND THEY MUST AGREE:
 *   1. `experimental.serverActions.bodySizeLimit` in next.config.ts —
 *      the transport limit, enforced by the framework BEFORE any of
 *      our code runs;
 *   2. `MAX_BYTES` in lib/studio/media.ts — the server-side backstop;
 *   3. the browser check in components/studio/RowForm.tsx.
 *
 * ⚠️ THE NUMBER IS VERCEL'S, NOT OURS. A serverless function's request
 * body is capped at 4.5 MB at the platform level, so no value above
 * that is real — it would only move the failure from a message we
 * control to a 413 from the edge.
 *
 * Only (3) can produce a decent error message. Past the transport
 * limit the request is rejected before the action is entered, so there
 * is nothing to catch and no field to attach the failure to — it
 * surfaces as a bare "Body exceeded 1 MB limit" runtime error. The
 * browser check exists so that never happens: it measures the whole
 * form, because the limit applies to the REQUEST, not to each file, and
 * a poster and a loop travel together.
 */
export const UPLOAD_LIMIT_BYTES = 4 * 1024 * 1024;

/** "1.4 MB" — for a message a person has to act on. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " kB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

/**
 * How bad a finding is.
 *
 * ⚠️ DECLARED HERE RATHER THAN IN health.ts, which is where it is used
 * most, because components/studio/Note.tsx needs it and Note is
 * rendered inside a Client Component. `import type` is erased, so
 * importing it from health.ts would be safe today — but health.ts
 * pulls in `node:fs`, and one careless change from `import type` to
 * `import` would drag the filesystem into a browser bundle. A type in a
 * module with no imports cannot do that to anyone.
 *
 * ERROR means a page or the build is broken. WARNING means a person
 * should look, and may reasonably decide to keep what is there.
 */
export type Severity = "error" | "warning";

"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ContentError, isValidId } from "@/lib/content-schema";
import {
  findCollection,
  type AssetField,
  type Field,
  type Row,
} from "@/lib/studio/collections";
import type { FormState } from "@/lib/studio/form";
import { saveUpload } from "@/lib/studio/media";
import {
  deleteRow,
  indexOf,
  insertRow,
  readRows,
  swapPositions,
  updateRow,
} from "@/lib/studio/repository";
import { LOGIN_PATH, requireStudioSession } from "@/lib/studio/session";
import { issueSession, passwordMatches, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/studio/auth";
import { isLocale } from "@/lib/i18n";
import { LOCALES } from "@/types/content";

/**
 * Every write the dashboard can perform.
 *
 * ⚠️ A SERVER ACTION IS A PUBLIC POST ENDPOINT. It is reachable whether
 * or not a page links to it, so `requireStudioSession()` is called at
 * the top of EVERY ONE rather than being left to the proxy redirect or
 * to the page that rendered the form. Gating only the UI would leave
 * every write open to anyone who can construct a POST.
 *
 * WHY SERVER ACTIONS AND NOT ROUTE HANDLERS.
 *
 * A `<form action={fn}>` posts and re-renders in one round trip with no
 * fetch, no JSON envelope and no client router call. It also works
 * before hydration — which is the same instinct as the rest of this
 * codebase, where the mobile menu is a `<details>` element rather than
 * React state.
 */

function collectionOr404(name: string) {
  const collection = findCollection(name);
  if (!collection) throw new Error(`Unknown collection: ${name}`);
  return collection;
}

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Turn the posted form into the row that will be written.
 *
 * Only the SHAPE is decided here — whether a value is a string, a
 * number or a per-locale pair. Whether it is ALLOWED is decided by the
 * site's own parser inside `writeRows`, so there is exactly one
 * definition of valid and this function cannot drift from it.
 */
async function buildRow(
  fields: Field[],
  formData: FormData,
  id: string,
  previous: Row | undefined,
): Promise<Row> {
  const row: Row = {};

  for (const spec of fields) {
    switch (spec.kind) {
      case "id":
        row[spec.name] = id;
        break;

      case "slug":
      case "url":
      case "select":
        row[spec.name] = field(formData, spec.name);
        break;

      case "text": {
        const value = field(formData, spec.name);
        /* An OPTIONAL field left blank is omitted rather than written
           as "". `vimeoId` is absent on all 29 pieces today, and
           stamping an empty string onto every row would put a key in
           the JSON that means nothing and reads as data. */
        if (value === "" && spec.optional) break;
        row[spec.name] = value;
        break;
      }

      case "number": {
        const raw = field(formData, spec.name);
        /* An empty box must not become 0 and quietly pass a range
           check that starts at 1990 — NaN fails the parser loudly. */
        row[spec.name] = raw === "" ? NaN : Number(raw);
        break;
      }

      case "bilingual":
      case "prose": {
        const pair: Record<string, string> = {};
        for (const locale of LOCALES) {
          pair[locale] = field(formData, `${spec.name}.${locale}`);
        }
        row[spec.name] = pair;
        break;
      }

      case "asset": {
        const resolved = await resolveAsset(spec, formData, id, previous);
        /* Derived assets are written to disk and NOT to the row — the
           component computes that path from the id. */
        if (spec.stored) row[spec.name] = resolved;
        break;
      }
    }
  }

  return row;
}

/**
 * An asset field is two inputs that mean one thing: a path you can type
 * and a file you can upload.
 *
 * The upload wins when there is one, because that is the stronger
 * statement of intent — you picked a file. Otherwise the typed path
 * stands, which is what lets an inherited filename like
 * `/media/logos/Four-Seasones.png` be corrected by hand without having
 * to re-upload the mark.
 */
async function resolveAsset(
  spec: AssetField,
  formData: FormData,
  id: string,
  previous: Row | undefined,
): Promise<string> {
  const upload = formData.get(`${spec.name}.file`);
  if (upload instanceof File && upload.size > 0) {
    const saved = await saveUpload(upload, spec, id);
    return saved.path;
  }

  if (!spec.stored) return "";

  const typed = field(formData, spec.name);
  if (typed !== "") return typed;

  const inherited = previous?.[spec.name];
  return typeof inherited === "string" ? inherited : "";
}

/**
 * Create or update one row.
 *
 * Bound as `saveRow.bind(null, collection, id)` — `id` is null when
 * creating. The last two parameters are what `useActionState` supplies.
 */
export async function saveRow(
  collectionName: string,
  existingId: string | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireStudioSession();
  const collection = collectionOr404(collectionName);

  /* The id is resolved FIRST because it is also the filename an upload
     lands on. Writing bytes to a path built from an unchecked id would
     leave a stray file named after a typo even when the save fails. */
  const id = existingId ?? field(formData, "id");
  if (!isValidId(id)) {
    return {
      ok: false,
      error: `id must be lowercase kebab-case (got "${id}")`,
    };
  }

  const rows = await readRows(collection);
  const at = indexOf(rows, id);

  if (existingId === null && at !== -1) {
    return { ok: false, error: `"${id}" already exists in ${collection.name}` };
  }
  if (existingId !== null && at === -1) {
    return { ok: false, error: `"${id}" is no longer in ${collection.name}` };
  }

  try {
    const row = await buildRow(
      collection.fields,
      formData,
      id,
      at === -1 ? undefined : rows[at],
    );
    /* ⚠️ VALIDATE THE WHOLE COLLECTION, WRITE ONE ROW.
       The parser's job includes checks no single row can answer — a
       duplicate id, a slug already taken by another piece — so it has
       to see the collection as it WOULD BE. The write that follows is
       targeted, because rewriting thirty rows to change one is both
       slower and a way to clobber a concurrent edit. */
    const next = at === -1 ? [...rows, row] : rows.with(at, row);
    collection.validate(next);

    if (at === -1) await insertRow(collection, row);
    else await updateRow(collection, id, row);
  } catch (error) {
    /* A ContentError is the parser refusing the row, which is the
       user's problem to fix and is phrased for them. Anything else is a
       bug in the dashboard and should reach the error overlay. */
    if (error instanceof ContentError) return { ok: false, error: error.message };
    throw error;
  }

  refresh(collection.name);

  /* A new row's own page did not exist when the form was submitted, so
     creating redirects and editing stays put. Staying put matters: the
     page re-probes the assets on render, so the measured size beside a
     freshly uploaded poster is the file that just landed. */
  if (existingId === null) {
    redirect(`/studio/${collection.name}/${encodeURIComponent(id)}?saved=1`);
  }
  return { ok: true };
}

export async function removeRow(
  collectionName: string,
  id: string,
): Promise<void> {
  await requireStudioSession();
  const collection = collectionOr404(collectionName);

  const rows = await readRows(collection);
  const at = indexOf(rows, id);
  if (at === -1) redirect(`/studio/${collection.name}`);

  /* ⚠️ THE MEDIA FILE IS LEFT ON DISK. Deleting a row is one click and
     git will restore it; deleting a master that no longer exists in the
     export folder is not recoverable from here. An orphaned file costs
     nothing — it is never referenced, so it is never served. */
  collection.validate(rows.toSpliced(at, 1));
  await deleteRow(collection, id);

  refresh(collection.name);
  redirect(`/studio/${collection.name}?removed=${encodeURIComponent(id)}`);
}

/**
 * Move a row one place.
 *
 * Only offered where order is meaningful — content/projects.ts derives
 * the homepage logo rail from clients.json IN SEQUENCE, so this is a
 * layout control wearing a list control's clothes.
 */
export async function moveRow(
  collectionName: string,
  id: string,
  direction: "up" | "down",
): Promise<void> {
  await requireStudioSession();
  const collection = collectionOr404(collectionName);

  const rows = await readRows(collection);
  const at = indexOf(rows, id);
  const to = direction === "up" ? at - 1 : at + 1;
  if (at === -1 || to < 0 || to >= rows.length) {
    redirect(`/studio/${collection.name}`);
  }

  const next = [...rows];
  [next[at], next[to]] = [next[to], next[at]];
  collection.validate(next);

  await swapPositions(collection, id, String(rows[to].id));

  refresh(collection.name);
  redirect(`/studio/${collection.name}#${encodeURIComponent(id)}`);
}

/**
 * The dashboard's own language.
 *
 * A cookie rather than a path segment or a query string: the studio is
 * one person's tool, the preference is sticky, and threading `?lang=`
 * through every link in the app would be noise on screen for a setting
 * that changes twice a year.
 */
export async function setStudioLocale(formData: FormData): Promise<void> {
  const next = field(formData, "locale");
  if (!isLocale(next)) return;

  const jar = await cookies();
  jar.set("studio-locale", next, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/studio",
  });
  revalidatePath("/studio", "layout");
}

/**
 * Both trees, deliberately.
 *
 * The studio tree so the list and the form show the row that just
 * changed; `/` as a layout so the PUBLIC pages pick the edit up on the
 * next navigation. Without the second call the dashboard would show a
 * saved project that the homepage had never heard of, which reads as
 * the save having failed.
 */
function refresh(collectionName: string): void {
  revalidatePath(`/studio/${collectionName}`, "layout");
  /* Every public page. They are statically rendered, so this is what
     turns a database write into new HTML — without it the studio would
     save successfully and the site would keep serving the build. */
  revalidatePath("/", "layout");
  /* Explicit: a route handler is not a page and is not covered by the
     layout sweep above. A new project has to reach the sitemap. */
  revalidatePath("/sitemap.xml");
}

/* ---------- the door ------------------------------------------------ */

/**
 * Sign in.
 *
 * ⚠️ ONE DELIBERATE ASYMMETRY: a wrong password says "wrong password"
 * and nothing else. There is no username to enumerate and no "no such
 * account" to leak, which is the whole benefit of a single shared
 * secret — the only information an attacker gets back is whether the
 * guess was right.
 */
export async function signIn(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = field(formData, "password");
  if (password === "" || !(await passwordMatches(password))) {
    return { ok: false, error: "wrong-password" };
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, await issueSession(), {
    httpOnly: true,
    sameSite: "lax",
    /* Secure in production only: a local dev server is plain http, and
       a Secure cookie there is set and never sent back, which presents
       as the login silently not working. */
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/studio",
  });

  redirect("/studio/");
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete({ name: SESSION_COOKIE, path: "/studio" });
  redirect(LOGIN_PATH);
}

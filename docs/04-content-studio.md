# The Content Studio — `/studio/`

A local, file-backed dashboard for the site's data. It runs on
`npm run dev` and **404s in production**: it writes into the working
copy, so the deploy step is `git diff` → commit → push, exactly as it
was before it existed.

It is not a CMS. Nobody logs in, nothing is hosted, no database was
added, and the site is still 100% static.

---

## 1. What moved, and what did not

Content used to be TypeScript array literals. A form cannot edit those
without a code generator, so **the rows moved to JSON** and the modules
that used to hold them now read and validate that JSON:

| file | rows | edited at |
|---|---|---|
| `content/data/projects.json` | 29 | `/studio/projects/` |
| `content/data/clients.json` | 22 | `/studio/clients/` |
| `content/data/bts.json` | 5 | `/studio/bts/` |
| `content/data/team.json` | 6 | `/studio/team/` |
| `content/data/awards.json` | 3 | `/studio/awards/` |

`content/projects.ts`, `content/bts.ts` and `content/team.ts` kept every
comment, every derived export and every call site. `BtsFilm`, `Member`,
`ClientCard` and `Award` moved to `types/content.ts` — where CLAUDE.md
says domain models live — and are re-exported from their old homes, so
no import anywhere had to change.

**The art direction did not move.** `content/curation.ts` is new and
holds the hero, the showcase, the Selected Work rows and the capability
strip **as ids**. Which piece opens the site is a decision with a
reason; the reason belongs next to it in code. The dashboard edits the
catalogue, not the edit.

`content/curation.ts` exists as a separate file for one structural
reason: `content/projects.ts` resolves those ids to real projects and
**throws** if one is missing. That is correct for a build and exactly
wrong for the screen whose job is to warn you that a curated piece has
gone missing. Strings cannot throw.

## 2. The guarantee that replaced the type system

A TypeScript literal made `pillar: "recipies"` a compile error.
`resolveJsonModule` types every string in a JSON file as `string`, so
that guarantee is gone the moment the data becomes JSON.

`lib/content-schema.ts` puts it back one layer down. The parsers run at
**module scope** in `content/*.ts`, so they run during `next build`: a
malformed row is still a failed build, with a message naming the file,
the row index and the field.

> ⚠️ **The studio writes through those same parsers.**
> `lib/studio/store.ts` validates the next version of a collection with
> the public site's own `validate` and only then writes the file. There
> is no second, laxer definition of "valid" that a form could satisfy
> and the build could reject. Verified: submitting a project with no
> preview shows `projects.json[29] — preview is empty` in the form and
> writes nothing.

## 3. One registry, not thirty screens

Five collections × six operations would be thirty screens that drift.
`lib/studio/collections.ts` is the only bespoke part; `app/studio/`
renders whatever it finds there. A sixth collection is an array entry,
not a route.

A field declares its kind (`id`, `slug`, `text`, `bilingual`, `prose`,
`number`, `select`, `url`, `asset`), its bilingual label, and its help
text. The help text is where the design law is taught at the point of
use — "Latin in both locales, it appears on the slate", "Arabic is
authored, not translated".

## 4. Uploads, and why the ratio check exists

`aspect ratio is the service taxonomy`. A 16:9 file on a `reels` row is
not a cosmetic slip — it is the page teaching the wrong thing, and
because the frames are `object-cover` it looks cropped rather than
broken. Nobody finds it by reading JSON.

So `lib/studio/probe.ts` reads real pixel dimensions out of the file
header — JPEG, PNG, WebP and MP4 — with **zero dependencies**. It seeks
rather than slurps: images read one chunk off the front, MP4 walks the
box tree through a file handle, so a `moov` atom at the end of a
non-faststart export costs a few seeks instead of the whole file.
Verified against all 95 files in `public/media/`: 95 parsed, 0 failures.

Notes that cost real debugging:

- **`tkhd`, not `stsd`.** `stsd` carries the *coded* size; `tkhd`
  carries the size the file asks to be *displayed* at. They differ
  under anamorphic pixel aspect — routine for a 2.39:1 master coded
  1920×1080. Reading `stsd` would report every one of those as 16:9.
- **The display matrix can rotate a track a quarter turn**, and a
  phone-shot 9:16 reel is often stored as a rotated 16:9. Stored
  dimensions are pre-rotation, so they are swapped when `a == d == 0`.
- **The 2% tolerance is not slack.** A 2.39:1 master lands at 2200×920
  (2.391) and its loop at 642×268 (2.396) — both are integer crops of a
  1080p frame and neither divides evenly. An exact match would report
  every correctly-cropped file on the site as wrong.
- **The extension is checked against the bytes.** A PNG saved as `.jpg`
  decodes fine everywhere and silently costs several times the weight.
  The upload is staged beside its target and probed there, so a rejected
  file never touches the one it was going to replace. Verified: an
  `.mp4` offered to a poster field is refused and the existing poster is
  byte-for-byte untouched.

Two asset shapes exist. **Stored** assets keep their path in the row.
**Derived** assets do not — `BtsCard` builds `/media/{id}.jpg` and the
team page builds `/media/team-{id}.jpg`, so storing a second copy would
let the two disagree. Derived fields accept exactly one extension,
because the component's derived path says `.jpg` and a PNG would 404
with nothing on screen to explain why.

## 5. Health

`/studio/` reports what no single file can see. Today, on real data:
**0 errors, 25 warnings**, every one of them true —

- 7 posters/loops below the size floor (the gallery stills harvested
  from WordPress; the same failure that already cost Al Wadi its place);
- 6 crew portraits at 600px against a 1280px floor — the upscale
  `docs/03-asset-spec.md` already documents, now visible while editing
  the row;
- 12 projects credited to clients who are not on the roster, so they
  appear in neither the logo rail nor the JSON-LD. This is the
  "twenty-two clients across two lists that overlapped on four" problem,
  still partly open.

It also checks every curated id in `content/curation.ts` against what is
actually on disk, so deleting the hero is caught **before** it becomes a
failed build.

## 6. Cost to the public site

**Zero bytes.** Verified by grepping all nine module chunks served on
`/ar` for studio and parser markers: none present. The dashboard lives
in a second root layout (`app/studio/layout.tsx`) — legal because there
is no `app/layout.tsx`, so every top-level layout is a root of its own.

The three client components in the studio (`RowForm`, `AssetInput`,
`NavLink`) never enter the public graph. `RowForm` uses `useActionState`
deliberately: a rejected save has to say why without throwing away eight
fields of typed Arabic, and the 0 kB alternative is a redirect that
reloads the page and empties every input.

Everything else follows the site's instincts — the delete confirmation
is a native `<details>`, the language switch is a form posting a Server
Action, and the list is a `<ul>` rather than a `<table>` because at
320px a table either overflows or squeezes to one character per line.

## 7. Verified

- `npm run build` clean, 87 static pages.
- `npm run lint` clean (the two warnings are in the skill's own scripts).
- Overflow sweep: 8 studio routes × 9 widths (320→2560) — no overflow.
- No Arabic run carries uppercase or letter-spacing, on four screen
  types. *(One bug found and fixed here: the rail's brand line is
  `.u-caps` and was marked `lang="en"` so the English build keeps its
  caps — which let Arabic text through the gate. It is a Latin brand
  name in both locales now, per the slate rule.)*
- End to end over CDP: create + two uploads → saved, redirected, ratio
  warning correctly raised on a 16:9 file in a 1:1 row; wrong extension
  → refused, original untouched; reorder → `clients.json` order changes
  and restores; delete → row gone, redirect to the list.
- Public JS budget unchanged by this work.

## 8. Deliberately not built

- **Curation editing.** Hero, showcase and Selected Work stay in
  `content/curation.ts`. The row arities are a typed union (`WorkRow`),
  and a form for that is fiddly for a decision made twice a year by the
  person with the repo open. Health validates the references instead.
- **Orphan media detection.** Deleting a row leaves its file on disk on
  purpose: git restores a row, but not a master that no longer exists in
  the export folder. An unreferenced file is never served.
- **`copy/ar.ts` and `copy/en.ts`.** Page prose is authored, not data
  entry, and the `Copy` interface is what makes a missing Arabic string
  a build error.
- **Auth, a database, a deploy target.** See the top of this file.

## 9. Two traps for the next person

- **`/studio` must be excluded in `proxy.ts`.** The proxy rewrites every
  unprefixed path to `/ar/*`, so without the guard `/studio` is looked
  up as a pillar slug and 404s, with nothing on screen to suggest
  routing was the problem.
- **`new` is a reserved id.** `app/studio/[collection]/new/` is a static
  segment beside `[id]`, and static wins — so a row whose id is `new`
  would be uneditable. Nothing in this content wants that name.

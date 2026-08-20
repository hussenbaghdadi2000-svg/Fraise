# Postgres, the API, and the live dashboard

The content moved from `content/data/*.json` into Postgres, `/studio/`
got a password and went live, and there is now a JSON API. The site is
still statically rendered and still ships the same bytes to a visitor.

**Nothing was lost.** The JSON files are still in the repo — they are the
seed, the offline backup, and the record of what the site shipped with.
`npm run db:seed` reloads them.

---

## 1. Getting it running

```bash
cp .env.example .env.local          # then fill in DATABASE_URL
npm run db:migrate                  # create the tables
npm run db:seed                     # load the 66 rows from content/data/
npm run dev
```

**Local Postgres**, if you do not want to hit Neon while developing:

```bash
docker run -d --name fraise-pg -e POSTGRES_PASSWORD=fraise \
  -e POSTGRES_DB=fraise -p 55432:5432 postgres:16-alpine
# DATABASE_URL=postgresql://postgres:fraise@localhost:55432/fraise
```

`lib/db/index.ts` picks the driver off the hostname: Neon gets the HTTP
driver (no connection to hold open, which is the only thing that works
on serverless), anything else gets ordinary `pg`. One schema, one query
builder, either way.

### The four environment variables

| | |
|---|---|
| `DATABASE_URL` | Neon connection string, or any Postgres URL |
| `STUDIO_PASSWORD` | what you type at `/studio/login/` |
| `STUDIO_SECRET` | signs the session cookie — must differ from the password |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob. Unset locally → uploads go to `public/media/` as before |
| `BLOB_BASE_URL` | your blob store's public base, for the `/media/` rewrite |
| `STUDIO_API_TOKEN` | optional bearer token for API writes |

## 2. What changed in the site

**Every content export became async.** `PROJECTS` is `getProjects()`,
`HERO` is `getHero()`, `TEAM` is `getTeam()`. A module-scope `const`
cannot await a query. The pages were already async Server Components, so
each call site gained one `await` — but the names changed rather than
staying the same and lying about what they do.

**The pages are still static.** `generateStaticParams` runs the queries
at build time and 89 pages are prerendered exactly as before. A write
from the dashboard calls `revalidatePath("/", "layout")`, which
regenerates them on demand. The visitor still gets static HTML and the
JS budget is untouched.

> ⚠️ **`dynamicParams` on `/our-work/[project]` flipped to `true`.** It
> was `false`, which 404s any slug `generateStaticParams` did not
> produce — correct when the catalogue was a file, and fatal now: a
> project the studio adds after a deploy has never been seen by a build.
> Nothing is lost, because the page still calls `notFound()` when the
> slug matches no row. The guard moved from the router to the page,
> where it can consult the data.

**`lib/content-schema.ts` still runs on every read.** The database
enforces NOT NULL, the pillar enum and the unique slug; it does not know
that a poster path must start with `/media/` or that a title must be
non-empty after trimming. So the parsers sit in front of every read
(`lib/db/queries.ts`) and every write (`lib/studio/actions.ts`), and
there is still exactly one definition of a valid row.

## 3. The dashboard is live now

`/studio/` no longer 404s outside development. It is behind a password.

- **`lib/studio/auth.ts`** — a signed cookie, hand-written, no
  dependency. There is one account and no sign-up, reset, provider or
  user table; an auth library solves problems this door does not have.
  Web Crypto rather than `node:crypto` so `proxy.ts` can use it on the
  Edge runtime.
- **Checked in three places.** `proxy.ts` redirects for UX; every page
  calls `requireStudioSession()`; **every Server Action calls it again**.
  A Server Action is a public POST endpoint whether or not a page
  rendered, and proxies have a history of being bypassed — the
  authorization that counts is the one next to the data.
- Passwords are compared in constant time, after hashing both sides so
  the comparison is uniform whatever length was typed.

## 4. Uploads

Two backends, chosen by environment (`lib/studio/storage.ts`):

```
BLOB_READ_WRITE_TOKEN set  →  Vercel Blob
otherwise                  →  public/media/, exactly as before
```

> ⚠️ **The stored path is `/media/...` in both cases.** A blob URL is on
> another hostname, and storing that would break two things: the parser
> requires an in-origin path, and *derived* assets are computed as
> `/media/{id}.jpg` by `BtsCard` and the team page — they have no way to
> know a hostname. `next.config.ts` closes the gap with an `afterFiles`
> rewrite, which runs only when no real file exists: the 84 committed
> assets stay static, new uploads fall through to blob.

**Size ceiling: 4 MB, and the number is Vercel's, not ours.** A
serverless function's request body is capped at 4.5 MB at the platform
level, so no larger value is real — it would only move the failure from
a message we control to a 413 from the edge. That is comfortably above
the studio's actual assets (the largest file in `public/media/` is
292 kB; a 2560px master runs to one or two MB).

`RowForm` weighs the whole form in the browser and refuses an oversized
selection before it travels, because past the transport limit the
request is rejected before any of our code runs and there is nothing to
attach an error to.

*If genuinely larger masters are ever needed*, the answer is not a bigger
number: it is `upload()` from `@vercel/blob/client`, which sends the
bytes straight from the browser to Blob and never passes them through a
function. That is written up rather than built because it cannot be
verified without a real Blob store.

## 5. The API

Reads are public — the content is already on a public website. Writes
need either the studio session cookie or
`Authorization: Bearer $STUDIO_API_TOKEN`.

```
GET    /api/:collection/          every row
GET    /api/:collection/:id/      one row
POST   /api/:collection/          create        (auth)
PATCH  /api/:collection/:id/      merge fields  (auth)
DELETE /api/:collection/:id/      remove        (auth)
```

`:collection` is `projects | clients | bts | team | awards` — the same
registry the dashboard renders, so a sixth collection gets an endpoint
for free.

> ⚠️ **The trailing slash is required.** `trailingSlash: true` is
> load-bearing for the site's canonical URLs, and it applies to route
> handlers too. `fetch()` follows the 308 automatically; `curl` does not
> unless you pass `-L`.

**PATCH merges, it does not replace** — so filling in a Vimeo id is one
field, not a whole row:

```bash
curl -X PATCH https://www.fraise.studio/api/projects/alsayad-tvc/ \
  -H "Authorization: Bearer $STUDIO_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vimeoId":"753259934"}'
```

Every write validates the collection **as it would be**, not the row on
its own — a duplicate slug is only visible against the others, and
deleting the homepage hero is only visible against `content/curation.ts`.

## 6. Deploying to Vercel

1. Push to GitHub, import the repo in Vercel.
2. **Storage → Postgres → Neon** — this sets `DATABASE_URL` for you.
3. **Storage → Blob** — sets `BLOB_READ_WRITE_TOKEN`. Copy the store's
   public base URL into `BLOB_BASE_URL` yourself.
4. Add `STUDIO_PASSWORD` and `STUDIO_SECRET` (`openssl rand -base64 32`).
5. Run the migration and seed once against the production URL:
   `DATABASE_URL='...' npm run db:migrate && DATABASE_URL='...' npm run db:seed`

## 7. Verified

- `npm run build` clean — **89 static pages generated from Postgres**.
- `npm run lint` clean.
- All public routes 200; `/studio/` 307s to the login form.
- Login: wrong password rejected with an Arabic message, right password
  lands on the overview, sign-out returns to the door.
- Full round trip through the browser: create a project with two uploads
  → row in Postgres with `position` 30 → its page live at
  `/our-work/db-roundtrip/` with the Arabic title → in `sitemap.xml` →
  ratio warning correctly raised on a 1:1 loop in a 16:9 row → reorder a
  client and restore → delete.
- API: list, single row, 404 on unknown collection, 401 without a token,
  authenticated PATCH persisted and appeared on the public page.

## 8. Known and deliberate

- **New work is appended LAST**, so it lands at the bottom of
  `/our-work/` and needs "load more" to be seen. That is the existing
  pagination, not a regression — but "newest first" is probably what the
  studio wants, and it is now one `ORDER BY` in `lib/db/queries.ts`.
  Left alone because the editorial cadence is an art-direction decision.
- **A failed save can leave an uploaded file behind.** The upload
  happens while the row is being built, before the collection is
  validated. `public/media/team-hussen.jpg` is a real example: a
  portrait uploaded for a crew member whose row was never saved.
- **Deleting a row leaves its media.** Git restores a row; it does not
  restore a master that no longer exists in the export folder.
- **The seed is a point in time.** `npm run db:seed` loads
  `content/data/*.json`. Anything added through the dashboard *after*
  those files stopped being the source of truth exists only in the
  database.

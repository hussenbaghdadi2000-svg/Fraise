@AGENTS.md

# FRAISE STUDIO

Premium food & beverage production studio, Amman Jordan. Replatform from
WordPress → Next.js. Bilingual **Arabic (primary) + English**.

**Asset requests go through `docs/03-asset-spec.md`** — the spec sheet for
the studio's edit suite. Assets are currently the ceiling on quality, not
the code.

**Read `docs/02-handoff.md` before starting work.** It carries every decision,
the verified state of the build, the roadmap, and the open questions.
Full design analysis: `docs/01-predev-analysis.md`.

## Working with this developer

New to Next.js, learning deliberately. Small steps, one concept at a time,
something visible on screen at the end of each. Explain the *why* briefly before
the code. Flag what is core Next.js worth learning vs. a project-specific
choice. **Never claim something works without running the build.** They speak
Arabic and English — answer in whichever they use.

## Stack

Next.js 16.3.1 · React 19.2.8 · TypeScript strict · Tailwind **v4** · Turbopack.

- Tailwind v4 → **no `tailwind.config.ts`**. Tokens live in `@theme` blocks in
  `app/globals.css`.
- Next 16 has breaking changes vs. older training data. Read the bundled docs in
  `node_modules/next/dist/docs/` before implementing a feature.

## Non-negotiables

**Design — "Black Room, Warm Plate."** The UI is achromatic; all colour comes
from the food. `--color-fraise` (#C8402F) is for **interactive state only**:
focus ring, active filter, hover underline. Never a background, button, border,
heading or gradient.

- **Spacing, type and measure come from tokens** — `@theme` in
  `app/globals.css`. Six space steps (`gutter gutter-lg beat bar movement
  rest`), seven type roles (`label caption body lead subtitle title display`,
  the top four fluid `clamp()`), three measures (`max-w-display/lead/body`).
  No `sm:`/`lg:` type ladders and no ad-hoc `py-*`. The page gutter is
  `components/ui/Container.tsx` — as a component or as its exported `INSET`
  string, never a fresh literal.
- **No light grounds anywhere.** The `u-invert` bands are gone and the
  logo wall with them — the room is black on every route, verified by
  computed luminance. Separation is hairlines and whitespace only.
- **The homepage sits in one 68rem `Measure`.** Every section shares the
  inline edges; that is what makes six different layouts read as one page.
- Media `border-radius: 0`. Always. Controls max 2px.
- Separation is hairlines and whitespace — **never shadows**.
- No gradients, glassmorphism, blobs, grain overlays, or texture.
- ⚠️ **The homepage `h1` is now LARGE and centred on the hero, with a
  filled `--color-fraise` button beside it** — both deliberate reversals
  made on the studio's instruction from its own live site. Every other
  page still keeps its `h1` small. See docs/02-handoff.md §5.16.
- Aspect ratio is the service taxonomy: TVC 2.39:1 · Recipes 16:9 · Reels 9:16 ·
  Stills 4:5 · Menu 1:1. Every media element declares its ratio (this is also
  the CLS strategy).
- ⚠️ **The ratio is NOT shown to the visitor.** It governs layout, the CLS
  boxes and `sizes`, and nothing else. It used to print in seven places —
  the slate, the services menu, the capability rows, the work-index band
  headers, the project credits, the adjacent-pillar rows — on the
  pre-dev analysis's reasoning that the notation teaches the taxonomy.
  The Stage 1 client brief names aspect ratio twice and both times as an
  ASSET SPEC ("a square or 16:9 poster frame for the thumbnail state");
  it asks instead for "a clear project name on every video" and "minimal
  text throughout". `/style/` still shows it — that page documents the
  system for developers, not for visitors.

**Engineering.**

- Server Components by default. Client Components are **leaves only** — never a
  page, layout or section.
- **JS budget: 120 kB brotli. 115.6 kB is spent — 4.4 kB of headroom remains**
  (111.1 framework + 3.8 `next/link` + 0.7 the whole media system). Measure
  before adding client code: sum the `<script src>` tags in
  `.next/server/app/ar.html` compressed, **excluding `noModule`** — that tag
  is a 112 kB legacy polyfill modern browsers never fetch.
- **Do not use `next/image`.** Measured at **4.3 kB brotli** — nine times the
  entire video system. `components/media/Poster.tsx` uses a plain `<img>`;
  read the note in that file before changing it. (`priority` is also
  deprecated in Next 16 — `preload`, and never with `fetchPriority`.)
- Zero runtime dependencies beyond the framework. No Framer Motion, GSAP, Lenis,
  Swiper, UI kits, state libraries. **Scroll reveals are `animation-timeline:
  view()` in `app/globals.css` — pure CSS, 0 kB**, guarded by `@supports` and
  `prefers-reduced-motion` so the unsupported path renders the finished state.
  Utilities: `.u-rise` `.u-enter` `.u-scrim` `.u-scrim-top` `.u-mirror`.
- **Verify UI by screenshotting the running page, not by reading the JSX — and
  across NINE widths, not two.** `320,360,414,768,1024,1280,1440,1920,2560`.
  320 caught a flex item that would not shrink, 768 caught a 568px-tall
  card, 2560 caught a column marooned in empty black — none of which 390
  or 1440 could show. Check both locales: the 320 overflow existed only
  in English, because Arabic words are shorter. Five real bugs so far were invisible in code,
  including a header that collided with itself on mobile.
- **Reach for the platform before React.** The mobile menu is `<details>` —
  native disclosure, keyboard and screen-reader support included, 0 kB. A React
  menu would need state, an effect, outside-click, Escape and a focus trap to
  match it. Chrome headless
  `--screenshot` will NOT work: `captureBeyondViewport` renders at scroll 0, so
  every scroll reveal is at opacity 0 and the page looks blank. Drive Chrome over
  CDP (`--remote-debugging-port`, Node's native `WebSocket`, `Runtime.evaluate`
  to scroll, `Page.captureScreenshot` per position). See docs/02-handoff.md §5.2.
- Strict TypeScript. No `any`, no `@ts-ignore`. Domain models live in
  `types/content.ts`.
- Max 2 concurrent video decoders, enforced by a module-level singleton — not
  React context.

**RTL.** Logical properties only — `ps-* pe-* ms-* me-* start-* end-*`.
A single `pl-*` is an RTL bug. Mirror directional icons; **never** mirror media,
logos, slates, Latin brand names or numerals.

**Arabic typography.** Never uppercase it, never letter-space it — the script
has no case and is connected. **The optical size correction REVERSES with
size:** `html:lang(ar)` adds +6.25% because Arabic reads smaller at body
sizes, and `:lang(ar) { --optical: 0.86 }` takes 14% back off the three
display tokens because at display sizes Arabic is already visually larger.
One global multiplier is wrong at one end of the scale whichever value you
pick. Relative font-size under `:lang(ar)` compounds, so the optical bump is
on `html:lang(ar)` only. Arabic copy is authored, not translated.

⚠️ **The correction scales the TOKEN, never the element.** It used to be
`.u-display:lang(ar) { font-size: 0.86em }` — class + pseudo-class is
specificity (0,2,0) and every Tailwind size utility is (0,1,0), so that rule
did not take 14% off, it **outranked the utility** and replaced it with 86%
of the inherited body size. Every Arabic display heading, including the
homepage `h1`, rendered at **14.6px** for months; it was invisible because
the call site's class list still *names* the intended size. **Never set
`font-size` in a rule with more than one class-level selector — adjust the
variable instead.** See docs/02-handoff.md §5.5.

Gate Latin-only treatment with `.u-caps:lang(ar)` — the element's **own**
language. Never `:lang(ar) .u-caps`, which is a descendant selector and would
also strip runs explicitly marked `lang="en"` (the slate). Any class that sets
`letter-spacing` needs a `:lang(ar)` counterpart next to it; see `.u-display`.

## Scope discipline

Routes built: Homepage · `/our-work/` · `[pillar]` (10 pages) · `/about-us/` ·
`/style/` (noindex). Not built, deliberately: case studies, contact backend,
CMS, per-client pages.

`/about-us/` lists **departments, not named people** — the analysis found the
live team roster argues against the positioning. Reversible, but make it a
deliberate reversal.

`app/page.tsx` is currently a **temporary design-system reference page**, not
the homepage.

## State

Steps 1–3 complete and verified. `app/[locale]/layout.tsx` is the **root
layout** (there is no `app/layout.tsx`) — `lang`/`dir` are server-rendered and
`dynamicParams = false` 404s any locale that is not `ar`/`en`.

**Arabic is served at `/`, English at `/en/`.** `proxy.ts` (NOT
`middleware.ts` — renamed in Next 16) rewrites `/` → `/ar` internally, so the
URL bar never shows `/ar`; an incoming `/ar/*` 308s to the canonical root
path. `trailingSlash: true`, canonical host `https://www.fraise.studio`.

⚠️ **The proxy matcher form in the Next docs is broken in 16.3.1** — the
`.*..*` clause makes the proxy silently never run. See docs/02-handoff.md §5.
Re-run the routing table after any matcher edit.

**`lib/routes.ts` is the URL source of truth.** Nothing constructs an href by
hand. Pages pass a `Route` (`{kind:"home"|"work"|"pillar"}`), never a path —
slugs are per-locale (D1), so `/إنشاء-مقاطع-ريلز/` and `/en/reels/` share no
characters and a path cannot be translated by string surgery. The same
function feeds the LocaleSwitcher and `alternates.languages`.

Step 4 done: `lib/video-manager.ts` (module singleton, max 2 decoders) and
`components/media/{Poster,Preview}.tsx`. `HoverPreview` and `InViewVideo`
**merged into one `Preview` leaf** — the server cannot know whether a visitor
has a mouse, so the choice has to happen at runtime.

Step 5 done: `app/[locale]/page.tsx` is the **real homepage**, all seven
sections, 115.7 kB brotli. The design-system reference page moved to
`/style/` (noindex, not in `lib/routes.ts`). The editorial cadence lives in
`components/work/WorkGrid.tsx`; its rules are enforced by the `WorkRow` union
rather than by review.

**The hero and all five capability frames are cut from the studio's own
2023 showreel** (`imgdata/2023-reel_without-logos-1.mp4`, 1920×1080, 51s,
no burned-in graphics) — so they carry REAL motion. **No stock remains on
the site.** Everything else is Vimeo poster frames with a generated push.
Real footage compresses far worse: budget 400–550 kB per clip against
~100 kB for a push, and check timecodes frame by frame — a 2.39:1 shot
letterboxed inside 1080p needs its bars cropped before the ratio crop.

⚠️ **`public/media/` is the studio's REAL work**, pulled from the live
site and cropped per pillar. Clients Al-Balqa, Knorr×Chef Deema and Askemo
are identifiable from the frames. **Titles, years and pillar assignment are
still invented**, as are the three studio figures — the originals are camera
filenames with no project metadata anywhere.

**H2 answered: there are no preview encodes and no self-hosted video** — all
films are on Vimeo. The loops in `public/media/` are slow pushes generated
from the stills, not the real films.

**B4 answered, badly:** `/our-work/` has 217 images but includes washing
machines, a phone case and a hospital operating theatre. The problem is
curation, not volume. **A Cannes Silver Lion, Dubai Lynx and Gourmand award
exist as logo files and are stated nowhere in the copy** — exported as
`AWARDS`, not yet placed. See docs/02-handoff.md §5.1. The figures are business claims — they must not ship
unverified. **Step 5 is an art-direction go/no-go gate: it needs a human
decision before Step 6.**

Step 6 done: `app/[locale]/work/page.tsx` with `<Link>` filters and
load-more (0 kB — they are URL state). `lib/cadence.ts` derives the editorial
rhythm for a filtered list; the A→B→C→D pattern is a **preference**, skipped
when the shape is unavailable, so an all-vertical filter degrades to an honest
grid instead of stretching one 9:16 across the viewport. The canonical on a
filtered view always points at bare `/work/`.

Step 7 done: `app/[locale]/[pillar]/page.tsx` — **one file, ten static
pages**. Every link on the site now resolves. `pillarFromSlug` is
locale-strict, so an Arabic slug under `/en/` 404s instead of duplicating a
page. **The ratio decides the hero layout:** wide pillars full-bleed, tall
ones height-capped and centred — a 9:16 hero at 100vw is 2560px tall.
`content/pillars.ts` holds the nine old service names as crawlable `tags`,
which is where the nine→five consolidation keeps its search terms.

⚠️ A **nested** `generateStaticParams` gets parent params as a plain object,
NOT a Promise — typing it as a Promise fails the build's route validator.

Step 8 done: `app/sitemap.ts` (generated from `lib/routes.ts` so it cannot
drift), `app/robots.ts`, `content/redirects.ts` + the `next.config.ts` 301
map, and `components/seo/JsonLd.tsx` (Organization + Service — the awards are
now machine-readable). **OG images deferred.**

⚠️ **Two redirect traps that fail silently:** a `source` written in Arabic
characters never matches (the path arrives percent-encoded — use
`encodeURI`), and a self-referential entry is an infinite loop (the map
lists unchanged slugs on purpose; `next.config.ts` filters `from === to`).

**The English URL set is in.** `PILLAR_SLUG` carries the live slug for both
locales (`/en/reels-video-shooting/`, `/en/tv-commercial-production/`,
`/en/recipes/`, `/en/food-photography/`, `/en/food-styling/`). **B2 answered by
evidence: `/our-work/` in both locales** — ⚠️ that slug also lives in the
FOLDER NAME `app/[locale]/our-work/`, because a static route's folder name is
its URL. Change both together.

**14 URLs at 0 hops · 19 legacy URLs at exactly 1 hop**, verified on a running
server. ⚠️ `/client/:slug*` (~16 per-client pages, no equivalent route in MVP)
301s to the portfolio — revisit if Search Console shows it earning traffic.

States are built: `app/global-not-found.tsx` (needs
`experimental.globalNotFound` — the root layout is a dynamic segment),
`our-work/loading.tsx` (skeleton reuses the real ratio boxes so nothing
shifts), `[locale]/error.tsx` (the only justified `"use client"`), and a skip
link using **`:focus` not `:focus-visible`** — the latter ignores programmatic
focus.

**Code-complete.** What remains is not code: confirmed titles/years,
real studio figures, the award→work mapping, and publication permission.

Still open: **B2** (work vs projects vs case-studies), **B4**, **H2**, **H3**,
and the English URL set — `/en/` serves a bot interstitial to non-browsers, so
it needs Search Console or a real browser.

## Content Studio — `/studio/`

A **local, dev-only** dashboard for the site's data. `npm run dev`, then
`/studio/`. It 404s in production and writes into the working copy, so
shipping an edit is still `git diff` → commit → push. No CMS, no
database, no auth, no new dependency, and **zero bytes** added to the
public JS budget (verified against the chunks `/ar` actually serves).

**Full write-up: `docs/04-content-studio.md`.** The load-bearing points:

- **The rows live in `content/data/*.json` now**, not in TypeScript
  literals. `content/{projects,bts,team}.ts` kept every comment and every
  export; they read the JSON through `lib/content-schema.ts`.
- **`lib/content-schema.ts` is what replaced the type system.** JSON
  widens `pillar` to `string`, so the parsers re-impose the unions at
  MODULE SCOPE — a bad row is still a failed build. ⚠️ **The studio
  writes through those same parsers**, so it cannot save a file that
  `next build` would reject.
- **`content/curation.ts` is new and holds the art direction as IDS** —
  hero, showcase, Selected Work, capability strip. The dashboard edits
  the catalogue, not the edit. It is a separate file because
  `content/projects.ts` THROWS on a missing id, which is wrong for the
  screen whose job is to report that.
- **`lib/studio/probe.ts` reads real pixel dimensions, zero deps**
  (JPEG/PNG/WebP/MP4), so an upload is checked against its pillar's
  ratio at the moment it lands. ⚠️ Read `tkhd`, not `stsd` — anamorphic
  masters differ — and the 2% tolerance is the studio's own integer-crop
  spread, not slack.
- **`app/studio/layout.tsx` is a SECOND ROOT LAYOUT**, legal because
  there is no `app/layout.tsx`. ⚠️ `/studio` also had to be excluded in
  `proxy.ts`, or it is rewritten to `/ar/studio` and 404s silently.
- ⚠️ **`new` is a reserved id** — the create route is a static segment
  beside `[id]`, and static wins.

**Health, on real data today: 0 errors, 25 warnings, all true** — 7
undersized gallery posters, 6 crew portraits at 600px against a 1280px
floor, and **12 projects credited to clients who are not on the
roster**, so they reach neither the logo rail nor the JSON-LD. That last
one is B4 restated as a list you can act on.

## Postgres · live dashboard · JSON API

**The content lives in Postgres now.** `/studio/` is behind a password
and reachable on the deployed site, so the studio adds work without a
developer. Full write-up: `docs/05-database.md`.

**`content/data/*.json` was NOT deleted** — it is the seed, the offline
backup and the record of what shipped. `npm run db:seed` reloads it.

- **Neon + Drizzle.** `lib/db/index.ts` picks the driver off the
  hostname: Neon gets the HTTP driver (serverless cannot hold a pooled
  connection), anything else gets ordinary `pg`, so a local
  `postgres:16` container works with no network.
- ⚠️ **EVERY CONTENT EXPORT IS ASYNC.** `PROJECTS` → `getProjects()`,
  `HERO` → `getHero()`, `TEAM` → `getTeam()`. A module-scope const
  cannot await. The names changed rather than lying about what they do.
- **The pages are still static.** 89 prerendered from the database at
  build; a dashboard write calls `revalidatePath("/", "layout")` and
  they regenerate. The JS budget is untouched.
- ⚠️ **`dynamicParams` on `/our-work/[project]` flipped to `true`.** It
  was `false`, which 404s any slug the build did not produce — fatal
  once a project can be added after a deploy. The page still calls
  `notFound()` on an unknown slug, so the guard moved from the router to
  the data, it did not disappear.
- **`lib/content-schema.ts` still runs on every read AND every write.**
  Postgres enforces NOT NULL, the pillar enum and the unique slug; it
  does not know a poster must start with `/media/`.
- **Auth is a hand-written signed cookie** (`lib/studio/auth.ts`), Web
  Crypto so `proxy.ts` can use it on the Edge. ⚠️ Checked in THREE
  places — proxy (UX), every page, and **every Server Action**, because
  an action answers POST whether or not a page rendered.
- **Uploads: Vercel Blob in production, `public/media/` locally.** ⚠️ The
  stored path is `/media/...` either way; `next.config.ts` has an
  `afterFiles` rewrite that only fires when no real file exists. Storing
  a blob URL would break the parser and could never work for DERIVED
  assets, which the components compute themselves.
- ⚠️ **Upload ceiling is 4 MB and the number is VERCEL'S** — a
  serverless request body is capped at 4.5 MB at the platform level.
  A larger value here would only move the failure to a 413 from the edge.
- **API:** `GET/POST /api/:collection/` and
  `GET/PATCH/DELETE /api/:collection/:id/`. Reads public, writes need
  the session cookie or `Authorization: Bearer $STUDIO_API_TOKEN`.
  ⚠️ The **trailing slash is required** — `trailingSlash: true` applies
  to route handlers. ⚠️ `/api` and `/studio` both need their guard in
  `proxy.ts` or they get rewritten to `/ar/...` and 404 silently.

⚠️ **New work is appended LAST**, so it lands at the bottom of
`/our-work/` behind "load more". Existing pagination, not a regression —
but "newest first" is one `ORDER BY` in `lib/db/queries.ts` if the
studio wants it.

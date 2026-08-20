# FRAISE STUDIO — SESSION HANDOFF

Everything decided and built so far. Written so a new conversation can pick up
with zero context loss.

Date: 2026-08-18
Project root: `f:\work\fraise-studio`

---

## 0. READ THIS FIRST (for the AI assistant)

**This project uses Next.js 16.3.1. That is newer than most training data and
has breaking changes.**

`AGENTS.md` in the project root instructs you to read the bundled docs before
writing code. They are real and they are local:

```
node_modules/next/dist/docs/
```

Relevant guides for the work ahead:

| Topic | Path (under `node_modules/next/dist/docs/`) |
|---|---|
| i18n / locale routing | `01-app/02-guides/internationalization.md` |
| Proxy (was middleware) | `01-app/03-api-reference/03-file-conventions/proxy.md` |
| Root params | `01-app/03-api-reference/04-functions/next-root-params.md` |
| Metadata API | `01-app/03-api-reference/04-functions/generate-metadata.md` |
| Sitemap | `01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md` |
| OG images | `01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md` |
| next/image | `01-app/03-api-reference/02-components/image.md` |
| next/font | `01-app/01-getting-started/13-fonts.md` |
| Redirects (301 map) | `01-app/03-api-reference/05-config/01-next-config-js/redirects.md` |

**Read the relevant one before implementing that feature.** Do not write from
memory of older Next.js versions.

Next 16 specifics already observed in this project:

- `LayoutProps<"/[locale]">` / `PageProps<"/[locale]">` typed route props are
  generated automatically and are globally available — no import. It is not
  the old `{ children }: { children: React.ReactNode }` pattern.
- Turbopack is the default for both `next dev` and `next build`.
- There is **no `tailwind.config.ts`** — this is Tailwind v4, tokens live in
  CSS inside `@theme` blocks in `app/globals.css`.
- **`middleware.ts` is deprecated and renamed `proxy.ts`.** Same API, same
  `config.matcher`; the export is `proxy` instead of `middleware`. Codemod:
  `npx @next/codemod@canary middleware-to-proxy .`. Step 3 writes `proxy.ts`.
- **`next/root-params` (new in 16.3.0)** exports a getter per dynamic segment
  above the root layout — ours is `locale`. Any Server Component or server
  utility can `await locale()` with no prop drilling. **Deliberately not used
  yet:** Step 2 has no component deep enough to need it, and `params` is
  clearer while the tree is two levels. **Adopt it in Step 5**, when sections
  and cards nest and the alternative is threading `locale` through every one.
  It cannot be used in Client Components, Server Actions or Route Handlers.
- A dynamic root layout (`app/[locale]/layout.tsx`) is the exact case the docs
  flag as awkward for 404s: there is no single static layout to compose one
  from. `dynamicParams = false` covers unmatched locales for now. A *designed*
  404 needs `app/global-not-found.tsx` + `experimental.globalNotFound`, which
  must return a full HTML document itself. Step 8.

---

## 1. WHO THE DEVELOPER IS

New to Next.js, working at a new company, wants to genuinely improve — not to
have things done for them or dumbed down.

**How to work with them:**

- Small steps. One concept at a time. Something visible on screen at the end of
  each step.
- Explain the *why* briefly before the code — enough that they could defend the
  decision in a code review.
- Flag what is worth actually learning (core Next.js they will use forever) vs.
  what is just a choice for this project.
- Verify claims. Run the build. Never say "this works" without evidence.
- They speak Arabic and English. Answer in whichever they use.

---

## 2. THE PROJECT

**Fraise Studio** — premium food & beverage production studio, Amman, Jordan.

Replatform from **WordPress → Next.js**, bilingual **Arabic (primary) +
English**.

Live site: `https://fraise.studio/en/`
Preview reference: `https://fraise-studio-preview.vercel.app/`

### What was verified about the existing site (crawled, not assumed)

| Finding | Evidence |
|---|---|
| Live site is **WordPress** | `robots.txt` has the standard `wp-admin` / `wp-content` block |
| **No sitemap exists** | `robots.txt` declares no `Sitemap:`; `/sitemap.xml` 404s |
| **Arabic is probably at the root** | Canonical is `fraise.studio/en/`; WP multilingual puts the default locale at root |
| **`/work/` is not a portfolio** | It renders five *service* tiles. Projects live at `/projects/` ("قصص النجاح") |
| Real clients recoverable | Jordina, Baker, Sunwhite, JoSweet, UMIC, Zaity, KFC, Thuraya Halloumi |
| Editorial numbering already exists | `01/05`, `01 / PEOPLE`, `02 / PROCESS` on preview pages |
| **Canonical host is `www`** | `fraise.studio/` → **301** → `www.fraise.studio/` |
| **Arabic IS at root** | the site's own `hreflang="ar"` → `https://www.fraise.studio/` |
| **Trailing slashes are enforced** | `/en` → **301** → `/en/`; every internal link ends in `/` |
| **Arabic slugs are Arabic, not Latin** | `/إنشاء-مقاطع-ريلز/` is the live Reels URL |

### The core problem

The site's weakness is **not** visual — **the information architecture argues
against the positioning**. Clicking "Work" shows services, so the work is
structurally prevented from ever being the hero. Every symptom the client
complained about follows from that.

### Team (from the live preview)

Ahmad Aqraa (Founder / Visual Creative Director), Omar Aqraa (Photographer),
Saleem Najjar (E-commerce Consultant), Mahmoud Aqraa (Editor), Ahmad Al Sbaihat
(DoP), Yaman Ajami (Editor).

Contact: `hello@fraise.studio` · WhatsApp `+962 7 9372 4731` · `@fraisestudio`

---

## 3. DESIGN DIRECTION — LOCKED AND APPROVED

### "Black Room, Warm Plate"

**The interface has no colour of its own.** Achromatic ground, warm bone type,
hairline rules, mono metadata. Every pixel of chroma comes from the food.

This is the operative argument, not a style preference. It *forbids* gradients,
glassmorphism, blobs, tinted shadows and duotone overlays — because they would
be the interface asserting colour it has not earned.

### Tokens (already implemented in `app/globals.css`)

```
--color-ink          #0B0B0C    ground (not #000 — pure black kills the frame edge)
--color-ink-raised   #131315
--color-bone         #F2EFE9    warm, not #FFF
--color-bone-dim     #A8A49C
--color-bone-faint   #6E6A64
--color-hairline     rgba(242,239,233,0.14)
--color-fraise       #C8402F    INTERACTIVE STATE ONLY
```

**`--color-fraise` permitted uses, exhaustively:** focus ring, active filter,
link hover underline, the recording dot (one instance, homepage hero).
**Forbidden:** backgrounds, buttons at rest, borders at rest, headings, icons
at rest, hover fills, any gradient.

### Two structural devices

**1 — The slate.** Every piece of media carries production metadata:

```
JORDINA        TVC        2023        2.39:1
```

Mono, uppercase, tracked, bottom-inline-start. It satisfies the client's
"project name visible on every video" requirement while reading as production
infrastructure rather than a portfolio caption. **Its content is always
Latin/numeric, so it survives RTL untouched.**

**2 — Aspect ratio is the taxonomy.** Each pillar has a native shape:

| Pillar | Ratio |
|---|---|
| TVC / Cinematography | 2.39:1 |
| Recipes | 16:9 |
| Reels | 9:16 |
| Stills | 4:5 |
| Menu Plate Design | 1:1 |

The grid becomes asymmetric *for a reason*, a visitor learns the taxonomy
without reading labels, and declaring the ratio up front is the entire CLS
strategy.

### Other locked rules

- Media has `border-radius: 0`. Always. Controls max 2px.
- Separation is hairlines and whitespace — **never shadows**.
- Full-bleed is the default; margins are the exception.
- One `h1` per page, and it is **small**. The work is the hero, not the title.
- No grain overlay, no texture, no illustration. Grain is the current
  AI-portfolio tell.
- Client wall = names **set in type**, not a greyscale logo grid.
- Hero is **88vh desktop / 82svh mobile** — the remaining space reveals the top
  of the first work row.

---

## 4. ENGINEERING DECISIONS ALREADY MADE

### Stack

Next.js 16.3.1 · React 19.2.8 · TypeScript strict · Tailwind v4 · Turbopack ·
ESLint. Zero runtime dependencies beyond the framework.

**Explicitly rejected:** Framer Motion, GSAP, Lenis, Swiper, UI kits, Redux,
Zustand, form libraries. CSS + IntersectionObserver covers the entire motion
vocabulary this site needs.

### Server/Client boundary

Server Components are the default. Client Components are **leaves only**.

| Component | Type |
|---|---|
| `WorkCard` `WorkGrid` `Slate` `Poster` `ClientWall` `PillarGrid` `FilterRail` `LoadMore` `LocaleSwitcher` `Header` `Footer` | **Server** |
| `HoverPreview` `InViewVideo` `HeroReel` `NavOverlay` | Client |

Three non-obvious calls made in the architecture review:

- **Filters and Load-more are `<Link>`s, not client state.** They are already
  URL state (`/work?service=reels`), so RSC can serve them with zero client JS.
  Trade: ~150–300ms server round-trip per click, imperceptible on a video page.
- **`LocaleSwitcher` is a Server Component.** Each page passes its own
  alternate-locale URL down as a prop. That same value feeds
  `alternates.languages` in `generateMetadata` — one source of truth, so the
  switcher and hreflang can never drift.
- **`Header` has no scroll-state behaviour** in MVP. It sits on dark media
  everywhere; scroll state would be a Client Component earning nothing.

Pattern for hover previews (children-as-props keeps markup on the server):

```tsx
<HoverPreview src={...} ratio={...}>   {/* "use client", ~1.5 KB */}
  <WorkCardContent />                   {/* Server Component */}
</HoverPreview>
```

### Video architecture

- **Two encodes per project.** Preview loop: 6–8s, **audio track stripped
  entirely**, ~720p max (640px wide for grid), <600 KB, faststart.
  Full film: adaptive HLS via Mux/Cloudflare Stream (Phase 2, not MVP).
- **Poster must be extracted from the preview's own first frame** — a separately
  art-directed still makes the poster→video transition visibly jump.
- **Desktop:** pointerenter → **120ms intent delay** → attach src → play →
  240ms crossfade. On leave: pause, reset, crossfade back, keep src ~30s,
  detach when scrolled out.
- **Concurrency cap: max 2 decoders** (hero + one preview), enforced by a
  **module-level singleton** in `lib/video-manager.ts` — *not* React context,
  which would force a client provider high in the tree.
- **Mobile:** exactly **one** autoplaying preview — the card nearest viewport
  centre. Not tap-to-play (defeats the brief), not autoplay-everything (jank +
  data cost).
- Bail to posters on `prefers-reduced-motion`, `saveData`, or `effectiveType`
  2g/slow-2g.

Three implementation gotchas already identified:

1. **Touch fires `pointerenter`.** Guard `e.pointerType === "mouse"`.
2. **Detaching needs `el.removeAttribute("src"); el.load();`** — setting
   `src = ""` issues a request to the page URL and never frees the decoder.
3. **Clear the intent timer on unmount**, not just on pointerleave.

### Hero / LCP strategy

The **poster is the LCP element, never the video**:

1. `next/image` poster with `priority` + `fetchPriority="high"` → paints as LCP
2. `<video>` renders with `preload="none"` and **no `src`**
3. After paint, on `requestIdleCallback`, attach src and play
4. 240ms crossfade over the poster

### Performance budget — MEASURED, not estimated

Framework baseline with **zero** app client code:

```
130.0 kB gzip
111.1 kB brotli   ← what Vercel actually serves
```

**Budget is 120 kB.** Measured again at the end of Step 2, with `next/link`
now in the tree:

```
133.9 kB gzip
114.9 kB brotli   ← 5.1 kB of headroom remains
```

`next/link` cost **3.8 kB brotli**, measured by building the same page twice
with `<Link>` and with `<a>`. It is a **one-time** cost — the component loads
once, so the `<Link>`-based filters and load-more in Steps 6–7 are now already
paid for and add nothing further. What remains of the budget belongs to
`HoverPreview`, `InViewVideo` and `HeroReel`.

**How to measure it (the previous number was reproduced exactly this way):**
sum the `<script src>` tags in `.next/server/app/en.html`, compressed —
**excluding any tag carrying `noModule`**. That is a 112 kB legacy polyfill
bundle which only non-ESM browsers download. Counting it reports ~145 kB and
looks like a blown budget when nothing is wrong.

Other targets: LCP < 2.0s mobile · CLS < 0.05 · INP < 200ms · total transfer
before hover < 1.2 MB.

### Arabic typography rules (non-negotiable)

1. Arabic runs ~8–12% larger than Latin at the same optical size.
2. Arabic needs ~+0.15 more line-height.
3. **Never uppercase Arabic** — the script has no case.
4. **Never letter-space Arabic** — it is connected; tracking breaks the joins.
5. Use Western numerals 0–9 in both locales.
6. Arabic copy is **authored, not translated**.

Fonts chosen: **Geist Sans** (Latin) · **Geist Mono** (slate) ·
**IBM Plex Sans Arabic** (Arabic, weights 400/600 only).
Explicitly rejected: Inter, Poppins, Montserrat, Cairo, Noto Kufi Arabic.

### RTL engineering

Logical properties everywhere — `ps-* pe-* ms-* me-* start-* end-*`.
**A single `pl-*` in the codebase is an RTL bug**, so this should become a lint
rule (not yet implemented).

Mirror directional icons only. **Do not mirror:** media, logos, play buttons,
slates, Latin brand names, numerals.

---

## 5. WHAT IS ACTUALLY BUILT (Steps 1–3 — complete and verified)

```
app/globals.css                  design tokens, Arabic rules, focus ring
app/[locale]/layout.tsx          ROOT layout — fonts, lang + dir, metadata
app/[locale]/page.tsx            TEMPORARY design-system reference page, bilingual
lib/i18n.ts                      DIR, OTHER_LOCALE, LOCALE_NAME, assertLocale
content/copy/{ar,en,index}.ts    the two copy dictionaries + COPY record
types/content.ts                 Locale, Pillar, Ratio, Copy + PILLAR_RATIO, RATIO_CLASS
components/primitives/Slate.tsx  the production slate component
lib/routes.ts                    THE url source of truth — Route union, slugs, alternates
lib/video-manager.ts             module singleton, max 2 decoders, previewsAllowed()
components/media/Poster.tsx      Server — plain <img>, ratio box, CLS strategy
components/media/Preview.tsx     Client LEAF — hover + in-view over one <video>
public/media/                    placeholder loops + first-frame posters (ffmpeg)
proxy.ts                         serves Arabic at / by rewriting to /ar
components/chrome/LocaleSwitcher.tsx   Server Component, takes a Route not an href
next.config.ts                   trailingSlash: true (no redirects — proxy owns routing)
docs/                            analysis + this handoff
```

There is **no `app/layout.tsx`**. That is the point of Step 2: `dir` is an
attribute of the document, so the segment that decides it has to sit *above*
the root layout. `app/[locale]/layout.tsx` is the root layout.

### Verification run (all passed)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run lint` | clean |
| `npm run build` | compiled 16.3s |
| Route `/` | `○ Static` — prerendered |
| 5 aspect utilities in output CSS | present |
| 7 colour tokens in output CSS | present |
| `html:lang(ar)` rule + `u-caps` gating | present |
| Client JS from our code | **zero** |

### Step 5 — the homepage is built (all seven sections)

`app/[locale]/page.tsx` is now the real homepage. The old design-system
reference page was **kept**, moved to `/style/` and `/en/style/` with
`robots: { index: false }` — it is deliberately absent from
`lib/routes.ts` and nothing links to it.

| Section | Built as |
|---|---|
| 01 Hero | 82svh / 88vh full-bleed 2.39:1, autoplay-after-idle, slate + recording dot |
| 02 Positioning | one sentence, `u-display`, ≤12 words |
| 03 Selected Work | `WorkGrid` — rows A, B, C of the editorial cadence |
| 04 Capabilities | five pillars, each looping in its own native ratio |
| 05 Clients | eight real names set in type, not a logo grid |
| 06 The Studio | body + three figures + one still |
| 07 CTA | in `Footer` — one line, one action, details visible |

| Check | Result |
|---|---|
| `tsc` · `lint` · `build` | clean |
| `h1` count | **1**, and it is small (mono, 11px) |
| `<video>` elements | 12 |
| `<video>` carrying a `src` | **0** |
| Hero poster | `loading="eager" fetchPriority="high"` |
| Other posters | `loading="lazy"` × 11 |
| First-load JS | **115.7 kB brotli — 4.3 kB headroom** |
| Routes | `/` `/en/` `/style/` `/en/style/` 200 · `/ar/` 308 · `/fr/` 404 |

**The cadence is enforced by the type system.** `WorkRow` is a union whose
variants hold exactly one, two, two and three projects. "Never four in a
row" and "maximum two moving pieces per row" are not review comments — no
variant exists that could express them.

**RTL comes free in the grid.** Row C's mandatory whitespace is 2 of 12
columns left empty at the inline-END, so it lands right in English and
left in Arabic with no direction-specific code anywhere.

### 5.2 UI PASS — the first build was structurally right and felt dead

Feedback was blunt and correct: the layout matched the spec, the
interaction layer did not exist. Nothing responded to a cursor, nothing
moved on scroll, spacing was a metronome, and type was flat. A minimal
direction lives or dies on exactly those three things.

**Motion is 100% CSS.** `animation-timeline: view()` drives every reveal
from the element's own position in the viewport, on the compositor.
**0 kB** — which is why it is possible at all with 4 kB of budget left.
It is wrapped in `@supports` and `prefers-reduced-motion`, so anything
that cannot run it renders the finished state and loses nothing.

**Cards are links now**, with the label ON the media over a scrim at
rest — not underneath, and not hover-revealed, because hover does not
exist on a phone. Hover raises contrast and brings up the arrow; it does
not introduce the label. The arrow mirrors in RTL via `.u-mirror`.

**Four bugs found only by screenshotting the running page:**

1. The card label was a normal-flow sibling of the media, so it stacked
   BELOW the frame instead of over it. Invisible in code review.
2. The nav was unreadable over bright media. The direction assumes dark
   frames; this studio shoots high-key interiors. Added `.u-scrim-top`
   for the hero only.
3. Row C stretched the 9:16 to the top, leaving it hanging over a pool
   of dead space. `items-end` makes the height difference read as
   composition.
4. The capability strip **wrapped**, stranding one pillar on its own
   line — which destroys the only thing that section argues. All five
   frames share one height (168px), so width is decided purely by ratio
   and the family lines up on one baseline. Measured: 220px overflows.

**Screenshot method, for next time.** Chrome headless `--screenshot`
cannot capture a long page: `captureBeyondViewport` renders at scroll 0,
so every scroll-driven reveal is still at opacity 0 and the page looks
blank. Drive Chrome over CDP instead — `--remote-debugging-port`, a
native `WebSocket` from Node, `Runtime.evaluate` to scroll, then
`Page.captureScreenshot` per position.

### → docs/03-asset-spec.md — the hand-off sheet for the edit suite

Written for the studio, in Arabic, with the technical values in English.
Every number in it is derived from the actual layout, not estimated.

Covers: per-pillar poster dimensions · the 6–8s silent preview spec with
runnable ffmpeg commands · the first-frame poster rule · the missing
vertical assets · the per-project metadata the code needs · and the
minimum set that makes the homepage work (**five pieces plus one BTS**).

**The design decision it protects:** fewer and larger beats padding with
weaker work. Eight pieces shown beautifully beats twenty at three
quality tiers.

### ⚠️ Hero resolution is capped by their own assets

Every image on the live site is a **1200px web-optimised frame grab**.
The hero crops one to 2.39:1 and displays it ~1900px wide, so it is
upscaled roughly 1.6× and looks soft. No amount of code fixes that —
it needs the master files.

### 5.11 THE POLISH PASS — the states nobody designs until they happen

Four files, and each one closes a gap a reviewer opens first.

**`app/global-not-found.tsx`** — the 404. This is the file the earlier
notes kept deferring: a route-level `not-found.js` has nothing to render
inside when the root layout is a top-level dynamic segment, which is
exactly the case the docs name. It needs
`experimental.globalNotFound: true`, and because it is handled at the
ROUTING level it bypasses the layout entirely — so it declares its own
`<html>`, its own font imports and its own stylesheet.

Two decisions inside it: only **two** fonts load, not three (a page
nobody wants to be on should not fetch a display face), and it is
**bilingual**, because a request that matched no route carries no locale
and guessing would be wrong half the time.

Its links are plain `<a>` and the lint rule that objects is wrong here —
outside the router there is no context for `<Link>` to prefetch or
soft-navigate with, so a hard navigation is correct rather than a
fallback. Disabled with that reason written down.

**`app/[locale]/our-work/loading.tsx`** — that route is server-rendered
on demand because it reads `searchParams`, so every filter click costs a
round trip and the page previously just held still. The skeleton reuses
the real `RATIO_CLASS` boxes in the real cadence, so nothing shifts when
content replaces it — **the skeleton IS the layout**. No spinner: a
spinner says "something is happening somewhere", the boxes say "work is
arriving, in these shapes, in these positions".

**`app/[locale]/error.tsx`** — the one place in this project where
`"use client"` is not a budget decision. React error boundaries need
client lifecycle; there is no server equivalent. It renders inside the
root layout, so it inherits fonts and direction and stays small, and it
shows `digest` rather than a stack trace — a stack trace shown to a
visitor is a security problem.

**The skip link**, in the root layout. Every page opens with five nav
links; without it a keyboard user tabs all five on every navigation.

The detail worth keeping: it uses **`:focus`, not `:focus-visible`**. The
first attempt used `focus-visible` and the test showed the link never
appearing — `:focus-visible` depends on the engine's keyboard heuristics
and does not match programmatic focus. A skip link is only ever focused
deliberately, so plain `:focus` is correct. Verified by dispatching a
real Tab keypress over CDP: off-canvas at `-42px`, `+16px` and focused
after Tab.

### 5.10 MOBILE — the header was broken and nobody had looked

Every screenshot in this project until now was 1440px wide. At 390px the
header **collided**: "Fraise Studio" wrapped onto two lines and the nav
sat on top of the second line. Wordmark + four links + locale switcher
is ~450px of content in a 390px viewport.

**The fix is `<details>`, not React.** A native disclosure widget opens
and closes with no JavaScript, is keyboard operable, announces its
expanded state to screen readers, and survives a script failure. A React
menu would have cost state, an effect, an outside-click handler, an
Escape handler and a focus trap — to reimplement what the browser
already ships, out of a 4.3 kB budget.

Desktop keeps the inline nav (`hidden sm:flex`); mobile gets the same
links inside the disclosure. `summary`'s marker is reset globally —
it is a triangle in Blink and a bullet in WebKit.

Verified: header height 65px, wordmark on one line, no horizontal
overflow anywhere on the page (`scrollWidth === innerWidth === 390`).

**The lesson is the method, not the fix.** Four bugs in the UI pass and
this one all shared a property: invisible in the source, obvious in a
screenshot. Nothing in the JSX said "this wraps at 390px".

### 5.9 THE STUDIO PAGE — and the nav gap it exposed

`app/[locale]/about-us/`. It absorbs three live pages: `/about-us/`,
`/our-team/` and the Arabic `/حكاية-استوديو-فريز/`.

**THE DECISION THAT MATTERS: departments, not people.** The analysis
flagged the live team page as arguing against the positioning — six
people, three sharing a surname, one an e-commerce consultant, on the
page whose whole job is proving "not one person with a camera". A named
roster invites the reader to count heads; a department list invites them
to count **capabilities**, which is the claim the studio wants to make,
and it stays true as people come and go. Reversible without a rewrite,
but it should be a deliberate reversal.

Sections: on-set hero · statement · six departments · figures ·
**four real BTS frames** (Sunwhite BTS, JoSweet BTS, on-set crew, Making
of Baker — all the studio's own) · awards as text.

#### ⚠️ Two navigation bugs this uncovered

Both were invisible in code review and would have shipped:

1. **The five pillar pages had no route in from the navigation.** Step 7
   built them and the work cards linked to them, but the homepage
   capability strip — the section whose entire job is teaching the
   taxonomy — contained **zero links**. It taught the taxonomy and then
   went nowhere. The frames are links now, and the header has a
   Services entry.
2. **`#studio` and `#capabilities` were dead on every route except the
   homepage.** Those sections only exist there, so from `/our-work/` or
   a pillar page the click silently did nothing. Header anchors are
   absolute now (`/en/#capabilities`). `#contact` was always fine — the
   footer carries it everywhere.

#### One URL had to move

`/حكاية-استوديو-فريز/` → `/about-us/`. A static route's folder name is
its URL, so one page cannot carry two locale-specific slugs, and the
English `/en/about-us/` was the more valuable of the two to preserve
exactly. It is the only URL on the entire site that moves without being
a consolidation.

### 5.8 THE ENGLISH URL SET — recovered, and the map is now complete

Supplied by the developer from the live navigation (the crawler could
not reach `/en/`). **Four of my five guessed English slugs were wrong** —
another reminder that a slug is evidence, not a naming exercise:

| pillar | guessed | ACTUAL live URL |
|---|---|---|
| reels | `/en/reels/` | `/en/reels-video-shooting/` |
| tvc | `/en/tv-commercials/` | `/en/tv-commercial-production/` |
| recipes | `/en/recipe-videography/` | `/en/recipes/` |
| stills | `/en/food-photography/` | `/en/food-photography/` ✓ |
| menu | `/en/menu-design/` | `/en/food-styling/` |

`PILLAR_SLUG` now carries the live URL in both locales, so **ten pillar
pages, two homepages and both `/our-work/` pages keep the exact
addresses they have today — fourteen URLs at zero hops.**

#### ⚠️ A whole URL space nobody knew about: client pages

`/clients/` links out to **~16 per-client detail pages**, eight per
locale, with unrelated slugs on each side:

```
/client/kfc/              /en/client/kfc-palestine/
/client/alsayyad/         /en/client/tuna-al-sayyad/
/client/nabil/            /en/client/nabeel-food-industries/
/client/sunwhite/         /en/client/sunwhite-rice/
/client/thuraya-delights/ /en/client/zaity-oil/   … and more
```

This site has no equivalent route — client pages are outside the MVP.
They 301 to the portfolio via a `:slug*` wildcard, which is the nearest
honest destination. **This is a downgrade, and a deliberate one: if
Search Console shows these pages earning real traffic, they are a
Phase 2 route, not a redirect.**

#### Verified against a running server — every entry

Fourteen URLs at **0 hops**. Nineteen legacy URLs at **exactly 1 hop**,
none chained, none looping, in both locales.

### 5.7 STEP 8 — the SEO plumbing, and the 301 map

`app/sitemap.ts` · `app/robots.ts` · `content/redirects.ts` ·
`components/seo/JsonLd.tsx`. **OG images are deferred** — they need
`ImageResponse` and a designed template, and nothing else waits on them.

**The live site has no sitemap at all.** Its robots.txt declares none and
`/sitemap.xml` 404s. Every URL Google knows was found by crawling. This
is the first sitemap the studio has had, and it is generated from
`lib/routes.ts` — the same function behind every href and canonical, so
it cannot drift from the pages. `?service=` views are deliberately
absent: they canonicalise to bare `/work/`, so listing them would spend
crawl budget on URLs that point elsewhere.

#### The 301 map — every entry verified against a running server

| Old URL | Result |
|---|---|
| `/إنتاج-الأفلام-القصيرة/` | 1 hop → `/tv-commercials/` |
| `/إنتاج-وتصوير-فيديو-احترافي-للطعام-وال/` | 1 hop → `/recipe-videography/` |
| `/حكاية-استوديو-فريز/` | 1 hop → `/#studio` |
| `/product-photography/` | 1 hop → `/food-photography-service/` |
| `/commercial-photography/` | 1 hop → `/food-photography-service/` |
| `/our-work/` | 1 hop → `/work/` |
| `/our-team/` `/clients/` | 1 hop → `/#studio` |
| `/contact-us/` | 1 hop → `/#contact` |
| **`/إنشاء-مقاطع-ريلز/`** | **0 hops, 200** |
| **`/`** `/tv-commercials/` `/recipe-videography/` `/food-photography-service/` `/food-decorations/` | **0 hops, 200** |

The zero-hop rows are the point of decision D1: the highest-value URLs
do not move, so they need no redirect at all.

**Two traps, both of which fail silently:**

1. **A `source` written in Arabic characters never matches.** The
   matcher compares against the raw request path, which arrives
   percent-encoded. The redirect sits in the config looking correct and
   does nothing; the page 404s. Fixed with `encodeURI()` on both source
   and destination.
2. **Self-referential entries are infinite loops.** `content/redirects.ts`
   deliberately lists URLs whose slug does NOT change, so a future slug
   edit cannot lose them — but emitting those as redirects makes each
   one a loop. `next.config.ts` filters `from === to` before mapping.

⚠️ **THE ENGLISH SET IS STILL MISSING FROM THE MAP.** `/en/` serves a bot
interstitial to non-browser clients and could not be crawled. Its URLs
must come from Search Console before launch — **shipping without them
silently 404s the entire English site.**

#### JSON-LD

Organization on the homepage, Service on each pillar page. Both are
Server Components: rendered HTML, zero client JS.

The reason it earns its place is the **awards**. A Cannes Silver Lion
that exists only as a logo image is invisible to a search engine; in
`award` on an Organization it is a machine-readable credential. Verified
parsing: `["Cannes Silver Lion","Dubai Lynx","Gourmand Award"]`, 14
clients in `knowsAbout`, and the nine old service terms as `serviceType`
on the pillars.

### 5.6 STEP 7 — the pillar template

`app/[locale]/[pillar]/page.tsx`. **One file, ten static pages** — five
pillars × two locales. Every link on the site now resolves.

| Check | Result |
|---|---|
| `/إنشاء-مقاطع-ريلز/` `/tv-commercials/` `/recipe-videography/` `/food-photography-service/` `/food-decorations/` | 200 (all were 404) |
| `/en/reels/` `/en/tv-commercials/` `/en/food-photography/` `/en/menu-design/` | 200 |
| `/en/إنشاء-مقاطع-ريلز/` | **404** — locale-strict on purpose |
| `/nonsense/` | 404 |
| `/work/` `/style/` `/` `/en/` | 200 — static routes still beat `[pillar]` |
| canonical + hreflang | cross-linked with the correct per-locale slug both ways |
| `h1` count | 1 |
| first-load JS | 115.7 kB brotli, unchanged |

**Three things worth carrying forward:**

1. **A nested `generateStaticParams` receives its parent params as a
   PLAIN OBJECT, not a Promise** — unlike the `params` prop on the page,
   which is always a Promise in Next 16. Typing it as a Promise fails
   the build's route validator with a type error, not a runtime one.
2. **The reverse lookup is locale-strict.** `pillarFromSlug(slug, locale)`
   only matches within the locale, so an Arabic slug under `/en/` 404s
   rather than serving the same page at two addresses.
3. **The ratio decides the hero layout, not the other way round.** The
   first version put every pillar hero at 100vw in its native ratio.
   That is magnificent at 2.39:1 (600px tall) and broken at 9:16 —
   1440px wide became **2560px tall**, two and a half screens of one
   frame with the page's content pushed off the bottom. Wide pillars go
   full-bleed; tall ones are height-capped and centred on the ink, which
   is also what makes a vertical read as vertical rather than as
   "enormous".

**The nine→five consolidation lands here.** `content/pillars.ts` carries
each pillar's `tags` — the old site's nine service names as crawlable
text, not as nine more menu items. The terms keep their ranking; the
navigation problem the consolidation exists to solve does not come back.
The process strip is shared across all five: a production process does
not change because the output ratio does, and five near-identical
versions would be padding.

### 5.5 THE SHOWREEL — real motion, and no stock left on the site

The studio supplied `imgdata/` (42 files, 36 MB). Most of it is client
and award logos, plus the service images already pulled. One file
changes the build:

```
2023-reel_without-logos-1.mp4    1920×1080 · 24fps · 51s
```

**A real showreel with no burned-in graphics.** The hero and all five
capability frames are now cut from it, so those six frames carry actual
footage instead of a push generated from a still. **Every stock clip has
been removed** — nothing on the site is anyone else's work.

| Frame | Timecode | Shot |
|---|---|---|
| hero | 10.0s | hands in black gloves shaping dough, dark counter |
| tvc | 4.5s | flames behind the grill bars |
| recipes | 24.5s | noodles hitting water |
| stills | 34.1s | dough texture macro |
| reels | 37.3s | patty on the grill, cropped vertical |
| menu | 43.7s | plated dish, sauce being poured |

Runtime-verified, not assumed: `document.querySelector('video')` reports
`src` attached, `paused: false`, and the other videos on the page still
hold **no src at all** — the decoder cap and the attach-on-intent rule
are both doing their job on a page with 20+ frames.

**Three things this cost, worth knowing before cutting more:**

1. **Real footage compresses far worse than a generated push.** Three
   clips came out over the 600 kB rule on the first pass and needed
   CRF 33–36. A slow push on a still lands around 100 kB; the same
   length of real motion lands at 400–550 kB.
2. **The showreel is a compilation, so its segments carry no client.**
   Attributing a two-second cut to a specific brand would be a guess
   printed as a fact. They are slated to the studio and the reel's year.
3. **Timecodes have to be checked frame by frame.** The first pass put
   ice cubes under "Recipe Films" and a Coffee Mate carton under
   "Stills", because a sampling grid at 3s intervals does not tell you
   where a shot actually starts. And a 2.39:1 shot letterboxed inside a
   1080p file needs its bars cropped BEFORE the ratio crop, or the black
   bands ship inside the frame.

### 5.4 STEP 6 — the Work page

`app/[locale]/work/page.tsx`. Served at `/work/` and `/en/work/`.

**Every link on the homepage used to 404.** The cards were built as real
links before the pages behind them existed. This step closes most of
that: `/work/` now resolves. The five pillar routes still 404 — Step 7.

| Check | Result |
|---|---|
| `/work/` · `/en/work/` | 200 |
| `?service=reels` · `tvc` · `stills` | 200, and the list actually filters (9 → 3 → 5) |
| `?show=18` | 200 |
| canonical on a **filtered** view | `https://www.fraise.studio/en/work/` — never the filter |
| first-load JS | unchanged — filters and load-more are `<Link>`s, 0 kB |

**`lib/cadence.ts` is the new piece.** The homepage hand-authors three
rows because six pieces deserve art direction; a filtered list cannot,
because it changes with every click. So the rhythm is *derived* while
still obeying the rules.

The important part is that the pattern is a **preference, not a script**.
`/work/?service=reels` is nothing but 9:16 pieces — cycling A→B→C→D
blindly would put a single vertical frame across the full viewport
width, the worst possible use of the widest row on the site. Each row
type is attempted in order and skipped when its shape is unavailable, so
a uniform list degrades to an honest grid. Verified: the reels filter
renders one row of three verticals.

**The canonical decision is load-bearing.** `?service=` is a good URL for
a human (shareable, refresh-safe, back-button-safe) and a bad one for an
index — five near-duplicate pages would compete with each other AND with
the five pillar pages, which are the real indexable filtered views. So
the filter is public to people and invisible to crawlers.

Also added: `Header` now takes `overlay`. It floats over the hero on the
homepage and sits in flow above a hairline everywhere else.

### 5.3 THE VIMEO CATALOGUE — 48 real films, and the metadata problem is solved

The studio's films are all on Vimeo. The **public v2 API needs no key**:

```
https://vimeo.com/api/v2/fraisestudio/videos.json?page=1
```

Returns **48 films** with id, **real title**, duration and upload date.
That is exactly the metadata that was missing — the website's camera
filenames carry none of it. Saved at `vimeo-list.json` during the pull.

Real titles include: *Jordina TVC · Knorr Chicken Stroganoff · NewLand
2022 · Sunwhite · Sunwhite 2022 BTS · Baker · Making of Baker 2022 TVC ·
Nabil Beef Kabbab · Nabil Kubbeh Balls · Durra Special Hummus · Durra
Shish Tawouq Recipe · AlWatanyeh Chicken Thighs · Altahooneh Chicken
Sajeyh · Tuna Alsayad · Chef Fusion season 1 · JoSweet 2023 BTS · Burger
Fever · Boom Boom (×3) · Sona (×4) · Askemo (×8) · Al Wadi (×5) ·
Skyworth Smart TV · Zaiti · Tohfa · Karam · Noodi · Nabout Tea.*

**Poster frames come down at up to 2560px.** The API returns a
`thumbnail_large` ending `-d_640?region=us`; swapping `_640` for
`_2560` serves the same frame at 2560px wide. Verified: 640 · 1280 ·
1920 · 2560 all return 200.

That beats **everything** on the website (1500px ceiling). Current
inventory from the 47 frames pulled: **44 × 2560×1440**, **2 × 2560×4551
(native 9:16)**, **1 × 2560×2560 (native square)**.

The homepage now runs on these. The hero is a frame from *Tuna Alsayad*
— hands, a fish, warm rim light on near-black — which is the direction's
own argument made in one image. **Zero upscaling** at full bleed.

### ⚠️ The films themselves could NOT be downloaded from here

`vimeo.com/fraisestudio` → **403**. `player.vimeo.com/video/{id}/config`
→ **403** with any Referer. `yt-dlp` (2026.07.04) → **403**. The public
metadata API and the CDN thumbnails work; the video streams do not.
Likely a datacenter-IP block rather than a permissions problem.

**The path forward is a person, not a script:** someone signed in to the
studio's Vimeo can download originals directly, or the studio hands over
masters. Then the previews get cut per `docs/03-asset-spec.md` §2 and
the motion becomes real film instead of a generated push.

### ⚠️ Arabic display type needed the OPPOSITE correction

Reported in review as "the font is too big" — on the Arabic page only,
and correctly.

`html:lang(ar)` carries a **+6.25%** bump because Arabic reads optically
*smaller* than Latin at body sizes. At display sizes the relationship
inverts: Arabic has no descender-light lowercase to lighten a line, so
the same font-size is already visually larger, and the root bump
compounds it. At `text-8xl` the Arabic line shouts where the Latin one
speaks.

`.u-display:lang(ar)` now sets `font-size: 0.86em` — cancelling the root
bump (1 / 1.0625 = 0.941) and taking a further 9% off.

**The rule worth keeping: the optical correction reverses with size.**
A single global multiplier for Arabic is wrong at one end of the scale
whichever value you pick.

### 5.1 REAL ASSETS PULLED FROM THE LIVE SITE (2026-08-18)

`public/media/` now holds the studio's own work, cropped to each
pillar's ratio. Nothing is stock, nothing is generated.

**Provenance verified, not assumed.** Each source URL was re-fetched and
its md5 compared against the file actually used. All matched, all HTTP
200 from `www.fraise.studio`. Three files initially failed to download
and returned bot-protection HTML — they need a browser `User-Agent`
header, which is worth knowing for any future asset pull.

**Pillar assignment comes from the studio's OWN filenames.** The live
site names its service images in Arabic, and those names are its own
taxonomy — better evidence than reading the picture:

| Pillar | Source filename | Meaning |
|---|---|---|
| tvc | `تصوير-اعلانات-تلفزيونية` | TV commercials |
| recipes | `تصوير-فيديوهات-الطبخ` | cooking videos |
| stills | `تصوير-الطعام` | food photography |
| reels | `تززين-الاطعمة-والوجبات` | food styling |
| menu | `تصوير-اعلانات-تجارية` | commercial advertising |
| — | `انتاج-الافلام-القصيرة` | short films |

**Identifiable from the frames themselves:** Al-Balqa (البلقاء) — the ghee
tin is held to camera · Knorr × Chef Deema Hajjawi — branded whites and
Knorr packs on set · the BTS frame carries the **Fraise Studio crew
jacket** in shot, which is the best studio-not-freelancer image on the
whole site and is currently buried.

**Corrected after a full sweep of all 194 images:** 68 landscape · 23
portrait (2:3) · 16 square · **2 native 9:16** (1500×2665, both from the
same still-life shoot). So vertical is not absent, it is **two frames
from one session** — enough to prove the format, not to fill a wall.

Reels now uses a 2:3 portrait cropped to 9:16, which is a mild crop and
holds its composition.

**Resolution ceiling:** the two highest-resolution files on the site
(2293×1290) both carry a **client logo burned into the frame** — they are
finished ad end-cards, not cinematic frames, and are unusable as
portfolio media. The cleanest usable frames top out at **1500px**.

**Still missing:** titles, years and pillar assignment. The originals are
camera filenames (`EOS-5D-Mark-IV_9999_182.jpg`) with no project metadata
anywhere on the site. The studio must supply real campaign names, dates
and publication permission.

### ⚠️ H2 — ANSWERED. There are no preview encodes, and no video at all.

The live site **self-hosts zero video**. Every film is on Vimeo
(`vimeo.com/fraisestudio`). So the 6–8s silent preview loops the design
depends on do not exist and must be produced from masters — an edit-suite
task, not a code task.

The loops currently in `public/media/` are **slow camera pushes generated
from the stills beside them**. They demonstrate the crossfade and the
decoder cap honestly, and they are not the real films.

### ⚠️ B4 — the asset problem is worse than "thin", and it is not thin

`/our-work/` carries **217 distinct images**. Volume is not the issue.
**Relevance is.** Sampled directly, the portfolio contains:

- washing machines and tumble dryers (Askemo)
- a phone case (TAG-Phone)
- **a hospital operating theatre**, and other medical-facility interiors

This is hard evidence for the analysis's central thesis, stronger than
anything in §2. It is no longer just "clicking Work shows services" — the
portfolio of a self-described **food & beverage** studio is substantially
not food. Risk #3 was framed as "not enough premium work". The real risk
is **curation**: there is plenty of work, and showing it all is what
dilutes the positioning.

The full-bleed design makes this unavoidable rather than hidden, which is
the point. **Decision needed from the studio:** does the non-food
commercial work appear at all, and if so under what framing?

### ⚠️ AWARDS — recovered, and currently invisible

Three award logos sit in `wp-content/uploads/2025/07/`:

```
Silver-Lion-logo.png     Cannes Lions
dubai_lynx_logo_1.png    Dubai Lynx
Goumand-Award.png        Gourmand
```

**A Cannes Silver Lion is the single strongest credibility asset the
studio has.** It is stated nowhere in the site's copy — it exists only as
an image file, so it is invisible to search engines and to anyone
skimming. The pre-development analysis never mentioned it because it is
not written anywhere to be read.

Exported as `AWARDS` in `content/projects.ts` and deliberately **not yet
placed**. Where it belongs on the page is an art-direction decision.

### The client list is much stronger than we thought

Recovered from logo files: **Almarai · Talabat · Knorr · Zalatimo · Nabil
· Mezete · Al-Balqa · Thuraya · Kasih · Qabalan · Four Seasons · Sunwhite
· Oak Tree · Askemo · Ocean/المحيط**.

Almarai and Talabat are regional accounts. The pre-dev analysis had eight
names; this is fourteen, and better ones.

### ⚠️ Titles and years in content/projects.ts ARE STILL PLACEHOLDER

Client names are real (recovered from the live site). **Titles, years,
pillar assignments and all media are invented.** So are the three figures
in `home.figures` — those are claims about the business and must not ship
unverified. Replacing `content/projects.ts` and `public/media/` is the
whole content task; no component changes.

**This is the art-direction go/no-go gate.** Judge the direction, not the
content — but note risk #3 is now live and visible: the page is built for
full-bleed rows, and how it reads with the REAL inventory depends
entirely on **B4**.

### Step 4 verification run (all passed)

| Check | Result |
|---|---|
| `tsc` · `lint` · `build` | clean |
| Posters in prerendered HTML | 5 |
| `<video>` elements | 5 |
| `<video>` elements carrying a `src` | **0** — attached only on intent |
| `/media/*.mp4` served | 200, `video/mp4`, 19–35 kB |
| Audio tracks in previews | **none** — verified with ffprobe |
| Routing after Step 4 | `/` 200 · `/en/` 200 · `/ar/` 308 → `/` |
| **First-load JS** | **115.6 kB brotli — 4.4 kB headroom** |

### ⚠️ next/image costs 4.3 kB — measured, and removed

The single most expensive thing in Step 4 was not video. It was `next/image`:

```
baseline (step 3)                    114.9 kB brotli
+ Poster using next/image            119.2 kB   (+4.3)
+ the entire video system on top     119.7 kB   (+0.5)   ← 0.3 kB left
```

`next/image` cost **nine times** what the whole hover/in-view/decoder
system cost, and left 0.3 kB of a 120 kB budget with the hero still
unbuilt. `Poster` now renders a plain `<img>` — native `loading`,
`decoding`, `fetchpriority`, and `srcSet` when we pass one.

**What we gave up:** on-demand resizing and format negotiation. Acceptable
here specifically — a production studio exports its own encodes at known
sizes, the aspect ratios are fixed by the taxonomy, and there is no art
direction to switch between. **Cost of reversing it: find 4.3 kB first.**

Also note: **`priority` is deprecated in Next 16** in favour of `preload`,
and the docs warn against combining `preload` with `fetchPriority` or
`loading`. The old LCP recipe in §4 (`priority` + `fetchPriority`) is
wrong for this version.

### ⚠️ HoverPreview and InViewVideo had to merge

The architecture listed them as two components. **They cannot be two.**
Choosing between them requires knowing whether the visitor has a mouse,
and the server does not know that — so rendering one or the other needs a
client-side branch regardless. Two components would both ship anyway.

They are now one leaf, `components/media/Preview.tsx`, branching at
runtime: fine pointer → hover with a 120ms intent delay; coarse pointer →
whichever card crosses the viewport centre, exactly one at a time.

The centre detection uses `rootMargin: "-50% 0px -50% 0px"`, which
collapses the observer root to a zero-height line across the middle of
the viewport. Nearest-to-centre for free — no scroll listener, no rAF
throttle, no per-frame `getBoundingClientRect`.

### Placeholder media (public/media/)

Generated with ffmpeg, not stubbed: five 6-second silent H.264 loops
(18–35 kB each, faststart) at the exact pillar ratios, and five posters
**extracted from each loop's own first frame** — which is the documented
rule, so the poster→video crossfade cannot jump.

**These are placeholders.** Replacing them is a file swap; no code
changes. The real encodes still need H2 and B4 answered.

### Step 3 verification run (all passed)

Against a running `next start`, not assumed:

| Request | Result |
|---|---|
| `GET /` | **200, Arabic, zero redirects** — `x-middleware-rewrite: /ar/` |
| `GET /en/` | 200, English, zero redirects |
| `GET /ar/` | **308 → `/`** — the internal form is not publicly indexable |
| `GET /fr/` | 404 |
| `GET /favicon.ico` | 200 — not rewritten |
| `<html>` at `/` | `lang="ar" dir="rtl"` |
| canonical at `/` | `https://www.fraise.studio/` |
| hreflang pair | `ar → /`, `en → /en/` — matches the live site exactly |
| switcher on `/` | `<a lang="en" hrefLang="en" href="/en/">English</a>` |
| switcher on `/en/` | `<a lang="ar" hrefLang="ar" href="/">العربية</a>` |
| first-load JS | 114.9 kB brotli — unchanged, proxy is server-side |

### ⚠️ The Next 16 proxy matcher trap — cost an hour, will cost it again

**The matcher form printed in the Next 16 docs does not work in 16.3.1:**

```ts
matcher: ["/((?!_next/static|_next/image|.*\..*).*)"]   // ← BROKEN
```

With that pattern the proxy ran for `/` **and nothing else**. No error, no
warning, no build failure — it simply never executed, so `/ar/` stayed
publicly reachable and `/en/` was never inspected. It looks like working
code and it type-checks.

The `.*\..*` clause is the part that breaks it. Dropping only that clause
fixes it:

```ts
matcher: ["/((?!_next/static|_next/image).*)"]             // ← WORKS
```

The dot case (`favicon.ico`, `robots.txt`, `sitemap.xml`, `public/`) is
handled by an early return inside `proxy()` instead.

**How it was caught, and how to catch it again:** a `console.log` at the top
of `proxy()` plus a response header per branch, then curl each path and read
the server log for which paths actually arrived. Header presence alone is not
enough — `x-middleware-rewrite` appears on a rewrite but nothing marks a
request the proxy never saw.

**Never trust a matcher edit without re-running the routing table above.**

### Step 2 verification run (all passed)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run lint` | clean |
| `npm run build` | compiled, `/ar` and `/en` both `● SSG` |
| `<html lang="ar" dir="rtl">` in `.next/server/app/ar.html` | present, server-rendered |
| `<html lang="en" dir="ltr">` in `.next/server/app/en.html` | present, server-rendered |
| Arabic `<title>` / description | present, authored not translated |
| Slate carries `lang="en" dir="ltr"` on the Arabic page | present |
| `GET /` | 307 → `/ar` |
| `GET /wp-admin`, `GET /fr` | 404, layout never renders |
| First-load JS | 114.9 kB brotli (budget 120) |

### Three bugs that only appeared once Arabic actually rendered

Step 1 could not have caught these — there was no Arabic page to render.

1. **`:lang(ar) .u-caps` was the wrong selector.** It is a *descendant*
   selector, so on an Arabic page every `.u-caps` anywhere below
   `<html lang="ar">` matched — including the slate, which is Latin by design
   in both locales. It silently stripped the slate's caps and tracking. Fixed
   to **`.u-caps:lang(ar)`**, which asks about the element's *own* language,
   so marking a run `lang="en"` is enough to opt out. This also survives the
   minifier reordering the rules, because it wins on specificity rather than
   source order — worth checking, since the compiled CSS does emit the
   `:lang(ar)` rule *before* its base rule.
2. **The slate reversed itself in RTL.** It is a flex row, and flex follows
   `dir`, so it rendered `2.39:1 2023 TVC JORDINA`. It now carries its own
   `dir="ltr"`. The design rule "never mirror a slate" needed an attribute,
   not a note in a document.
3. **`tracking-[-0.035em]` on the `h1` applied to Arabic**, breaking rule 4.
   Display type now goes through **`.u-display`**, which pairs the Latin
   tracking + tight leading with an Arabic override in one place, so the
   Arabic case cannot be forgotten at the call site.

**Still unenforced:** a raw Tailwind `tracking-*` utility on Arabic text would
still slip through. Same class of problem as a stray `pl-*`. Both want the
same lint rule, still not written.

### Two lessons captured in the code

- **`:lang(ar)` matches all descendants**, so a relative `font-size` there
  compounds on every nesting level. The size bump is on `html:lang(ar)`,
  applied exactly once. See the comment in `app/globals.css`.
- **Tailwind cannot build class names at runtime** — it scans source as text,
  so `aspect-[${ratio}]` compiles to nothing. Hence the static `RATIO_CLASS`
  map in `types/content.ts`.

`app/page.tsx` is a **temporary reference page**, not the homepage. It gets
replaced in Step 5.

---

## 5.5 THE DESIGN-TOKEN LAYER (2026-08-19)

Before this pass the site had **no scale** — it had eight copies of a
gutter string, twenty ad-hoc vertical values, eleven type sizes doing
about four jobs, and seven `ch` measures. That is not art direction, it
is drift; the same semantic role was `text-5xl` on one page and
`text-6xl` on another for no reason anyone could name.

### What replaced it

`@theme` in `app/globals.css` now defines:

| Axis | Tokens | Was |
|---|---|---|
| Space | `gutter` `gutter-lg` `beat` `bar` `movement` `rest` | 20 ad-hoc values |
| Type | `label` `caption` `body` `lead` `subtitle` `title` `display` | 11 sizes |
| Measure | `display` (18ch) `lead` (46ch) `body` (62ch) | 7 values |

`lead`, `subtitle`, `title` and `display` are **fluid `clamp()`** — the
`sm:`/`lg:` ladder is gone, so type scales continuously from 320 to 1920
instead of jumping at two arbitrary widths.

**206 declarations across 20 files** were migrated. Verified: build, tsc,
lint clean; **JS unchanged at 119.5 kB brotli** (this is a CSS-only
change); CSS 7.8 kB brotli; zero horizontal overflow on 14 routes across
both locales at 390 and 1440.

`components/ui/Container.tsx` owns the gutter, exported **both** as a
component and as the `INSET` string — call sites that already render an
element take the string rather than gaining a DOM node just to hold two
classes. Eight local copies became eight imports.

### ⚠️ Six type roles, not five — and why

The plan said five. Every sub-head on the site was authored as
`text-xl→2xl` or `text-2xl→3xl`, and collapsing those into `--text-title`
would have **doubled them at desktop**. A scale that forces a visible
regression is not a scale, so `--text-subtitle` exists. Its floor was
then raised from `1.25rem` to `1.4rem` because at 390px it resolved to
18.4px against `lead`'s 18.1px — two roles that render identically at a
common width are one role, measured, not argued.

### ⚠️⚠️ THE SPECIFICITY BUG — every Arabic display heading was 14.6px

This one had been live since Step 1 and survived every previous review.

```css
.u-display:lang(ar) { font-size: 0.86em; }   /* WRONG */
```

The intent was "take 14% off the display size". What it actually did:
`.u-display:lang(ar)` is a class **plus a pseudo-class** — specificity
(0,2,0) — and every Tailwind size utility is a bare class, **(0,1,0)**.
So the rule never adjusted anything. It **outranked** the size utility
and replaced it with 86% of the *inherited body size*.

Measured over CDP, `text-display` resolved to **14.6px** at both 390 and
1440. The homepage `h1` was rendering at body size in Arabic.

It was invisible in review for two compounding reasons:

1. The class list at the call site *names* the size the element is
   supposed to be, so the JSX reads correctly.
2. The one element that measured correctly — `text-title` at 51px — was
   `lang="en"` (a client name), so `:lang(ar)` simply did not match. A
   spot check landed on the one passing case.

**The fix is to scale the token, not to fight the cascade.** The utility
keeps ownership of `font-size`; the language only changes its input:

```css
--text-display: calc(clamp(2.5rem, 1.2rem + 5.6vw, 6rem) * var(--optical, 1));
:lang(ar) { --optical: 0.86; }
:lang(en) { --optical: 1; }   /* custom properties inherit — a Latin run
                                 nested in the Arabic document would
                                 otherwise carry the Arabic correction */
```

Verified after the fix, computed at 1440:

| Role | AR | EN |
|---|---|---|
| label | 11.7 | 11 |
| caption | 13.8 | 13 |
| body | 17 | 16 |
| lead | 23.4 | 22 |
| subtitle | 26.5 | 29.8 |
| title | 43.9 | 48 |
| display | **86.9** | **96** |

Monotonic in both locales, and the documented AR/EN display ratio
(≈0.91) is preserved.

**Rule this produces: never set `font-size` in a rule with more than one
class-level selector.** If a language or context needs to adjust a size,
adjust the *variable*.

### ⚠️ THE STALE-SERVER TRAP — cost three wrong measurements today

A `next start` from an earlier session still held port 3000. The new one
died with `EADDRINUSE`, the shell backgrounded it so nothing surfaced,
and the screenshots came back from a **dead build** whose CSS chunk no
longer existed — the page photographed completely unstyled and I nearly
filed it as a migration failure. It then happened twice more on 3100,
because `pkill -f "next start"` does not kill it on Windows.

**Always assert freshness before believing any measurement:**

```bash
for P in $(netstat -ano | grep -E ':3100\s+.*LISTENING' | awk '{print $NF}' | sort -u); do
  taskkill //PID $P //F; done
S=$(curl -s http://localhost:3100/ | grep -oE '/_next/static/chunks/[^"]*\.css' | head -1 | xargs basename)
ls .next/static/chunks/ | grep -q "^$S$" && echo "fresh" || echo "!! STALE"
```

### The two real UI bugs this pass, both invisible in source

1. **Hero controls collided with the tagline at 390px.** The sound/pause
   bar is centred at `bottom-6`; on mobile the tagline runs the full
   width and passes straight under it. Desktop has the horizontal room,
   mobile has to buy it vertically — hence `pb-bar sm:pb-beat`, more
   padding on the *small* screen.
2. The stale-server unstyled render above, which is a tooling bug
   masquerading as a UI bug — the most expensive kind.

### Tooling written for this (scratchpad, not committed)

- `shot.mjs` — CDP driver; scrolls and captures per position, because
  `--screenshot` renders at scroll 0 and every `view()` reveal is at
  opacity 0.
- `measure.mjs` — computed `font-size` per token role. **This is what
  found the specificity bug.** Screenshots showed "small heading";
  only computed style showed *why*.
- `audit.mjs` — horizontal-overflow sweep across every route × width.

---

## 5.6 HOMEPAGE REDESIGN + SCALE REDUCTION (2026-08-19)

Client verdict on the token pass: **"the font is too big"**, and on the
Selected Work section, **"too big and ugly"**, with a screenshot of the
studio's own reference.

### The scale came down ~40% at the top

| Role | Was (EN @1440) | Now |
|---|---|---|
| display | 96px | **51px** |
| title | 48px | **31px** |
| subtitle | 30px | **21px** |
| lead | 22px | **20px** |

Still seven distinct steps at 390px (`11.7 / 13.8 / 17 / 18.1 / 16.5 /
20.6 / 27.7` in Arabic) — the whole point of the fluid curves is that
this could be retuned in four lines without touching a single call site.

### Selected Work: a deliberate reversal of the editorial cadence

`WorkGrid`'s A→B→C→D cadence opened the homepage with one 2.39:1 frame
at the full 1440 — **602px tall**, the loudest thing on a page whose
loudest thing is supposed to be the food. The homepage now uses a new
`components/work/ShowcaseCard.tsx`: contained to a 68rem measure, two
up, caption BELOW the frame instead of scrimmed over it, and a
`PLAY FILM ▸` affordance visible **at rest** (a hover-only cue tells a
phone nothing).

`WorkGrid` is untouched and still drives `/our-work/`. The two grids do
different jobs: a homepage showcase is read across, a work page is
scanned down.

⚠️ **`content/projects.ts` → `SHOWCASE` pairs each row by pillar**, and
the type enforces it: `{ pillar, projects: [Project, Project] }`. A 4:5
stills frame beside a 16:9 recipe frame is 2.2x taller and **no
alignment closes the hole** — bottom-aligned leaves the gap above,
top-aligned leaves it below. That was visible in the first build of this
section. Pairing by pillar squares each row up while the rows still
differ, so the ratio taxonomy is still taught.

### The rest of the redesign

- **Every section has a real `h2`.** They were introduced by an 11px
  label — a caption pretending to be a title. Set at `text-title`, not
  `text-display`: the positioning statement is the one display-sized
  thing on the page, and a second one means neither is the largest. The
  Latin section name sits above it (`SELECTED WORK / 01`), which is the
  reference's device and the same bilingual convention as the slate.
- **The page no longer dead-ends.** Its first action used to be in the
  footer, six screens down. The positioning band now carries two routes
  out, and each section head carries its own.
- **Awards and Clients merged into `RECOGNITION`.** A Cannes Silver Lion
  was set at 11px under a client list. It also removed a real redundancy
  — the logo wall and the client list were the same claim twice.
- **A closing light band answers the opening one.** Quiet → impact →
  quiet, bookended. `Footer` gained `cta?: boolean`; the homepage passes
  `false` so the same sentence does not appear twice in one screen.
- **`text-fraise` removed from a label at rest** in the positioning band
  — the accent had leaked out of interactive state.
- **The play triangle does NOT mirror.** It is a transport control tied
  to a timeline, not a directional icon.

⚠️ **The reference puts a saturated red panel behind the closing CTA.**
That is the one thing the direction rules out — `--color-fraise` is
interactive state, never a ground. The emphasis comes from the inversion
instead. Reversible, but it should be a deliberate reversal.

Verified: build, tsc, lint clean; **JS still 119.5 kB brotli** (every
new component is a Server Component); zero horizontal overflow on 8
routes x 2 widths; screenshots at 390 and 1440.

---

## 5.7 THE ROOM IS BLACK AGAIN (2026-08-19)

Client direction: **make every section look like every other one, and
take the white out.**

### The two light bands are gone

The homepage carried an `u-invert` band at the top (positioning) and
another at the bottom (the close), used as the page's "pulse". They were
a mistake dressed as rhythm. The direction is called **Black Room, Warm
Plate**; two white slabs meant the room was not black, and the page read
as three different sites stacked. Separation is now what the direction
always said it was: a hairline and whitespace.

Verified over CDP — every element with a background whose luminance is
above 120, on all seven routes: **none. Every page is fully dark.**

### The client logo wall went with it

It could only ever sit on white. Brand marks arrive in every colour and
**Zalatimo's is a JPEG** — an opaque white rectangle is baked into the
file, so it cannot be placed on ink at all. The alternative was tinting
artwork that is not ours to tint.

No content was lost: the clients were already on this page as TYPE in
05, which is the stronger treatment, is searchable, and was flagged as a
duplicate of the logo wall when 05 was built. `components/sections/
ClientWall.tsx` is deleted rather than left as dead code — its only
possible ground is now ruled out.

### One measure for the whole page

Every section now sits inside the same 68rem column via a `Measure`
helper. That is what makes six different section layouts — hero,
statement, two-up grid, row list, type list, split — read as one page:
the inline edges line up all the way down, so the eye tracks one margin
instead of a new one per block.

### ما نصنعه — strip to rows

The capability section was a wrapped flex strip of five thumbnails on a
shared height. It taught the taxonomy, but it looked like a filter bar,
and it was the one block on the page that belonged to no family.

It is now five hairline rows — the same device as the awards in 05 and
the reasons on `/about-us/`. Every frame still shares ONE height, so the
format alone decides the width: **2.39:1 runs 245px, 9:16 runs 54px**.
Read down a column against a shared inline edge, that difference is
louder than it ever was in a strip, where each frame was measured
against whatever happened to wrap beside it.

⚠️ First build of the row pinned the name to one edge and the frame to
the other, which left **600px of nothing** across the middle at 1440.
The ratio notation moved into that gap: three anchors instead of two,
and the notation now sits beside the frame it describes. It is hidden
below `sm`, where there is no middle to sit in.

### ⚠️ The showcase is 3-up, and the measure is why

Client: the work images are too big. They were — 562px wide, against
roughly 370px in the studio's own reference.

The wrong fix is narrowing this section's measure, because the page had
just been put on ONE 68rem column on purpose and a section that breaks
the inline edge undoes it. **Three columns instead of two lands the card
at 341px inside the same measure** — the images come down ~40% and
nothing moves out of alignment. It also raises the showcase from four
pieces to six, which a portfolio wants anyway.

`SHOWCASE` is therefore `[Project, Project, Project]` per row, and the
same rule still holds: every card in a row shares a pillar, so the row
squares up.

### Also removed

`components/ui/Section.tsx` — written during the token pass and never
imported by anything. Dead on arrival, deleted.

Verified: build, tsc, lint clean; **JS still 119.5 kB brotli**; zero
horizontal overflow on 8 routes x 2 widths; screenshots at 390 and 1440.

---

## 5.8 THE WORK PAGE, SAME LANGUAGE (2026-08-19)

`/our-work/` now uses the homepage's vocabulary: the 68rem `Measure`,
the shared `SectionHead`, and `ShowcaseCard`. `Measure` and
`SectionHead` moved out of the homepage into `components/ui/` — a page
heading is an `h1` and a section heading is an `h2`, and since the
treatment is identical, `SectionHead` takes `as` rather than the work
page growing a second head component that happens to look the same.

### ⚠️ Grouped by format — the editorial cadence is retired here

`lib/cadence.ts` + `WorkGrid` arranged the filtered list into an
A→B→C→D rhythm of mixed-ratio rows. Two things killed it:

1. It opened on a **full-bleed 2.39:1 frame, 602px tall at 1440** — the
   loudest thing on a page whose loudest thing is the food.
2. A 4:5 next to a 16:9 is **2.2x taller**, and no alignment closes the
   hole: bottom-aligned leaves the gap above, top-aligned below.

The page is now bands, one per pillar, each a grid of a SINGLE ratio, so
every row squares up. A work index organised by what a thing IS beats
one organised by a rhythm the reader cannot see — and it is the same
shape as the homepage showcase, which pairs its rows by pillar for
exactly this reason.

`WorkGrid`, `WorkCard` and `buildCadence` are NOT deleted: `[pillar]`
still uses them. That is now the only route on the site in the old
vocabulary and it is the obvious next candidate.

### ⚠️ Column count is a function of the ratio

Three columns in the measure puts a card at 341px — right for 2.39:1
(143px tall) and 16:9 (192px). Wrong for tall formats: **a 9:16 at
341px wide is 606px tall**, one card filling most of a laptop screen.
`stills` and `reels` get four columns, at 248px wide.

### ⚠️ Paging reveals ROWS, not items

Slicing the first nine pieces and then grouping produced bands holding
**one card** under a full-width rule and its own header, because nine
landed unevenly across five formats. A band of one is worse than no
band. `?rows=` reveals one row per format instead, so every band is
always complete or absent: 16 of 21 at rest, all 21 after one click.
`?show=` is gone.

### ⚠️ The caption row is a CONTAINER query, not a breakpoint

`ShowcaseCard` renders three-up on the homepage (341px) and four-up in
the tall bands here (248px) **at the same viewport width**, so no `sm:`
rule can tell them apart — and at 248px the client credit and the
format label collided and both wrapped. The card carries `@container`
and switches at `@[19rem]`. The card asks how wide IT is, which is the
only question with an answer.

### The skeleton had to follow

`our-work/loading.tsx` was still drawing the old full-bleed cadence — a
skeleton that guarantees the layout shift it exists to prevent. It now
mirrors the measure, the head and two three-up bands.

Verified: build, tsc, lint clean; **JS unchanged**; zero horizontal
overflow on the page, both filtered views, both locales, at 390 and
1440; band counts checked over CDP in both languages.

---

## 5.9 THE CLIENT RAIL — and a data problem it exposed (2026-08-19)

Client asked for the homepage clients as cards you can swipe, with
their logos.

### ⚠️ THE NAMES AND THE MARKS WERE TWO DIFFERENT SETS

`CLIENTS` held **14 names**. `public/media/logos/` holds **12 files**.
They overlapped on **four**: Almarai, Talabat, Nabil, Sunwhite.

- Eight brands had a mark on the live site and **no name** in the data:
  Mezete, Zalatimo, Four Seasons, Chef Deema, Thuraya, Oak Tree,
  Qabalan, Kasih.
- Ten had a name and no mark: Knorr, Durra, Al Sayad, Baker,
  AlWatanyeh, Altahooneh, Jordina, JoSweet, Skyworth, Tohfa.

**Twenty-two clients, and neither list alone told the truth.** The
roster the site has been showing was missing eight real clients.

`content/projects.ts` now has ONE array — `CLIENT_CARDS`, name plus
optional mark — and `CLIENT_LOGOS` and `CLIENTS` both derive from it, so
they cannot drift apart again. Two names were normalised off their
filenames: `Four-Seasones` and `Thuraya-` are typos in the source files,
not brand spellings.

### The rail is CSS scroll-snap. 0 kB.

`components/sections/ClientRail.tsx` — no carousel library, no state, no
autoplay timer, no dots. Touch, trackpad, shift+wheel and the arrow keys
all work because they are the browser's. `tabIndex` on the container is
what makes it keyboard-reachable at all; a scroll container is not
focusable by default. `overscroll-behavior-inline: contain` stops a
swipe past the end from triggering back-navigation.

The scrollbar is hidden (`.u-rail`) because the affordance is the card
clipped at the edge — which reads identically on a phone, where the bar
does not render.

### ⚠️ The plate is the only white left on the site

Not a relapse. Brand marks arrive in every colour and **Zalatimo's is a
JPEG** — an opaque white rectangle is baked in — so a mark on ink is
either invisible or a lie about someone else's artwork. The white is
bounded to a card-sized plate, the way a logo sheet prints, instead of
being the full-width band that made the room stop being black. The page
ground never changes.

**It is `bg-white`, not `--color-bone`.** Bone is an off-white, and most
of these files carry their own baked white background — on bone that
reads as a lighter rectangle floating inside the plate, a visible seam
around every flattened mark.

### Three defects found by screenshot, not by reading

1. **`aspect-3/2` compiled and still lost.** `aspect-ratio` only sets a
   PREFERRED size; every one of these files is taller than the box, so
   each plate grew to its own image's intrinsic height and the rail came
   out ragged. An explicit `h-24 sm:h-28` reserves space just as
   deterministically. Verified over CDP: **12 plates, one height.**
2. **`dir="ltr"` on the `<figcaption>` re-aligned the block**, so in
   Arabic every caption sat at the wrong edge of its own card. lang/dir
   belong on the `<span>` — the name is an LTR run inside a caption that
   still belongs to the page's direction.
3. The 22-name roster at `text-title` was a second headline competing
   with the marks. Stepped to `text-subtitle`; the roster is supporting
   evidence, not the claim.

Both treatments stay, and they are no longer redundant: the marks do
recognition (a logo lands in ~80ms, a name has to be read), the roster
is the **complete** list including the ten with no mark, and it is
searchable text rather than images.

Verified: build, tsc, lint clean; **JS unchanged at 119.5 kB** — the
rail is a Server Component and the interaction is the platform's; CSS
8.1 kB; no page-level horizontal overflow in either locale at 390 or
1440 (the rail contains its own).

---

## 5.10 THE SERVICE PAGES, AND THE END OF THE CADENCE (2026-08-19)

The five `[pillar]` pages were the last route in the old vocabulary.
They now use the 68rem `Measure`, the shared `SectionHead` and
`ShowcaseCard`, like every other page.

**`components/work/WorkGrid.tsx`, `components/work/WorkCard.tsx` and
`lib/cadence.ts` are deleted.** Nothing imports them.

### Why the cadence had no job left

It arranged a MIXED-ratio list into an A→B→C→D rhythm. On a pillar page
every piece shares the pillar, therefore the ratio — so it was solving a
problem that page does not have. On `/our-work/` the list is grouped by
format for the same reason. There is no longer anywhere on the site
where a row holds two different ratios, which is also why no row has a
hole in it.

### New shared module: `lib/grid.ts`

`GRID_COLUMNS` / `GRID_COLS` / `GRID_SIZES`, keyed by pillar. Both the
work index and the five service pages lay out the same cards, and a
format that is three-up on one page and four-up on the other is exactly
the drift the token work exists to stop. Wide formats get three columns
(341px), tall ones four (248px) — a 9:16 at 341px is 606px tall.

### Two corrections while in there

- **The h1 was `text-display`.** On a page with no positioning
  statement that looked defensible, but it made the service name the
  largest type on the site — larger than the statement the studio is
  built on. It is `text-title` via `SectionHead as="h1"` now, and
  `measure.mjs` on `/tv-commercials/` reports `display (unused)`.
- **`text-fraise` on the process numbers**, sitting at rest. Same leak
  as the homepage positioning label. The recording dot in the homepage
  hero is the only accent-at-rest on the site.

### Verified with the skill's loop

- `budget.mjs ar` — **119.5 kB brotli**, 0.5 kB headroom, unchanged.
- `audit.mjs` — **all 22 sitemap URLs, 390 and 1440, no overflow**, and
  `lang/dir` correct on every route.
- `measure.mjs /tv-commercials/ 1440` — root 17px (the Arabic bump is
  applying), roles at 11.7 / 13.8 / 20.2 / 21.4 / 31.1, no Arabic run
  tracked or uppercased.
- `light.mjs` on a wide pillar and a tall one — fully dark.
- Screenshots: `/tv-commercials/` (wide, full-bleed hero) and
  `/إنشاء-مقاطع-ريلز/` (tall, height-capped hero) at 1440, plus 390.

One thing that looked like a bug in the mobile screenshot — the
`PLAY FILM` pills appearing stretched on two cards — measured identical
(116x28, same tracking, same card width) on all five. A compression
artifact over busy frames, not a layout defect.

---

## 5.11 THE ABOUT CLUSTER (2026-08-19)

`/about-us/`, `/our-team/` and `/behind-the-scenes/` are the three
routes behind the About menu. All three now use the 68rem `Measure` and
the shared `SectionHead`; the whole site is one vocabulary.

### ⚠️ The cluster was three dead ends

Each page ended on its last block. A reader who finished the crew page
could reach the crew films only by reopening the menu — on the page
whose entire job is proving there is a studio behind the work. Every
one of the three now closes on the other two.

`components/ui/NextUp.tsx` is that block, and the service pages were
refactored onto it: they already ended on exactly this pattern (two
hairline rows, name at the inline start, notation at the end) as a
private copy. One component now, three call sites.

### Type corrections

- **`text-display` on `/our-team/` and `/behind-the-scenes/`.** Both
  led with an 11px mono `h1` and a display-sized sentence under it — a
  caption pretending to be a title, above the largest type on the site.
  `measure.mjs` on `/our-team/` now reports `display (unused)`.
- **`/about-us/` moved its `h1` off the hero.** It sat over the film
  competing with it for the same 200px. The frame's job is to be the
  frame, not a title card.
- **Two `text-fraise` leaks** — the reason numbers on `/about-us/` and
  the crew roles on `/our-team/`, both sitting at rest. The recording
  dot in the homepage hero is the only accent-at-rest on the site.
- **`BtsCard`'s play triangle mirrored in RTL**, with a comment saying
  it should. `ShowcaseCard` was corrected first; a transport control is
  tied to a timeline, not to reading direction.

### ⚠️ The Latin label is a translation, not a slot name

`SectionHead`'s `latin` sits above the Arabic heading and has to mean
the same thing. First pass labelled the figures block `BY THE NUMBERS`
— but `figuresTitle` is *"ليه تختار استوديو فريز شريكاً في النجاح؟"*,
a why-us question, and `reasonsTitle` is *"أنواع الأعمال اللي نقدمها"*,
which is what-we-make. The two labels were describing each other's
sections. Read the copy, do not name the variable.

### The client rail is on `/about-us/` too

Same pairing as the homepage: marks for recognition, roster for
completeness. `light.mjs` therefore reports 12 white grounds here as
well — those are the logo plates, the documented standing exception.
Anything else bright on this route is a bug.

Verified: build, tsc clean; **119.5 kB brotli**, unchanged; `audit.mjs`
across all 22 URLs at 390 and 1440, no overflow; `measure.mjs` roles
ascending and no Arabic run tracked or uppercased; `light.mjs` on
`/our-team/` and `/behind-the-scenes/` fully dark; screenshots of all
three at 1440 and the crew page at 390.

---

## 5.12 THE CREW CARDS (2026-08-19)

Rebuilt to a reference the studio supplied: a circular portrait
overhanging the top edge of a rounded card, centred, bilingual name,
role in the accent, bio, index at the foot.

### ⚠️ THREE LOCKED RULES REVERSED, ON INSTRUCTION

Recorded here because they are one-line reverts and because a future
reader will otherwise think they are bugs:

1. **`border-radius: 0. Always.`** — the portrait is a circle and the
   card is `rounded-3xl`.
2. **`--color-fraise` is interactive state only** — the role sits in
   the accent at rest.
3. **Separation is hairlines and whitespace, never a raised surface** —
   the card has a `bg-ink-raised` ground.

**One part of the reference was NOT carried over: it is a LIGHT page.**
The studio asked two changes earlier to take the white out of the site,
and a white card here would undo that on the page where it is loudest.
`bg-ink-raised` is the same lift the loading skeleton already uses.

### ⚠️ The page's own language goes FIRST in the DOM

In an RTL paragraph the first inline child is laid out at the **right**.
Putting the Latin name first therefore rendered `Ahmad Aqraa` on the
right and `أحمد أقرع` on the left — the mirror image of the reference.
Locale-first fixes it and is the honest reading order: primary name,
then the other. English gets the natural mirror for free.

### ⚠️ Centring: `inset-x-0` + `justify-center`, never a translate

The avatar overhangs the card top. `start-1/2` plus `-translate-x-1/2`
is the usual recipe and it is wrong here — `translate-x` is a PHYSICAL
property and pushes the circle the wrong way in Arabic. A full-width
absolutely-positioned flex row has no direction.

### Two reserved heights, both measured

Same class of bug twice, both invisible in the JSX:

- `min-h-[3em]` on the **role** — "FOUNDER · VISUAL CREATIVE DIRECTOR"
  wraps, "EDITOR" does not.
- `min-h-[2.56em]` on the **name** — "Ahmad Al Sbaihat — أحمد الصبيحات"
  wraps, "Omar Aqraa — عمر أقرع" does not, and the role under it sat
  27px below its neighbours.

Both are expressed in `em` of the element's OWN font-size (3em = 2 lines
at the label's 1.5 line-height; 2.56em = 2 lines at the subtitle's
1.28), so neither drifts with the Arabic root bump. `mt-auto` on the
index puts it at the card foot, which is what makes the grid's stretch
do something.

### Note for whoever owns the assets

The grayscale build was quietly solving a real problem: the six
portraits are shot against six unrelated backgrounds — a blue studio
wall, a red seamless, autumn foliage, grey. In colour that is visible
again. **It is a retouching job, not a CSS one** — a common background
or a common grade would fix properly what the filter was masking.

Verified: build/tsc clean; **119.5 kB brotli unchanged** — all of this
is CSS and markup; no horizontal overflow across all 22 URLs; page
fully dark; screenshots in BOTH locales at 1440 plus 390.

---

## 5.13 RESPONSIVE, ACROSS NINE WIDTHS (2026-08-19)

Everything had been verified at **390 and 1440 only**. Sweeping
`320, 360, 414, 768, 1024, 1280, 1440, 1920, 2560` across all 22 URLs
found three real problems, none of which either of those two widths
could show.

### ⚠️ 1. The English homepage overflowed at 320 and 360

`+51px` at 320. The capability row puts "TVC & Cinematography" beside a
2.39:1 frame that must keep its ratio, and **a flex item defaults to
`min-width: auto`** — it refuses to shrink below its content, so the
row simply pushed past the viewport.

Fix: `min-w-0` on the text group, and `[overflow-wrap:anywhere]` on the
name. `anywhere` rather than `break-word` because only `anywhere` also
lowers the element's min-content width, which is the thing that
actually lets a flex row shrink.

**Arabic never showed this bug** — its words are shorter. A single-locale
check would have shipped it.

### ⚠️ 2. The measure was marooned at 2560

A flat `max-w-[68rem]` is right at 1440 and wrong at 2560, where it left
a 1088px column in the middle of the screen with **730px of empty black
on either side**.

`max-w-[clamp(68rem,60vw,96rem)]` — the same reasoning as the fluid type
scale. It holds 68rem to about 1815px and then grows to a 96rem ceiling:
no breakpoint, no jump. Paragraphs stay readable regardless because
`max-w-lead` and `max-w-body` are in `ch`, not in container width.

### ⚠️ 3. Tall formats were 568px tall at tablet

`stills` and `reels` were `sm:grid-cols-2`. At 768 that makes a 9:16
card 320px wide and **568px tall** — one card taller than half the
screen, which is the exact mistake the desktop grid already avoids by
giving tall formats four columns. Now `sm:grid-cols-3 lg:grid-cols-4`,
which brings it to 370px. `GRID_SIZES` updated to match, or the browser
fetches the wrong encode.

### Also: the capability row stopped pinning to the edges

Once the measure could reach 96rem, `justify-between` put the name and
the frame **1500px apart with nothing between them**. Above `sm` the row
is now a 12-column grid (5 / 3 / 4), so the three anchors sit at
proportional positions at every width. Below `sm` it stays a flex row —
there is no middle to place anything in.

### ⚠️ THE 320px FIX WAS WORSE THAN THE BUG — and the audit passed

`[overflow-wrap:anywhere]` on the capability row's name did stop the
overflow. It stopped it by breaking the name to **one character per
line**. In Arabic that is not merely ugly: the script is CONNECTED, so
breaking mid-word shatters a word into isolated letterforms. The
homepage's `ما نصنعه` section rendered as a vertical column of single
glyphs on a phone.

**`audit.mjs` reported `ok` the entire time**, because the text
collapsed rather than overflowed — the tool measures escape, not
crushing. Fixing the thing the tool can see created one it cannot.

Two things came out of it:

- **The row STACKS below `sm`.** Number and name get the full width on
  one line; the frame sits underneath. `overflow-wrap: anywhere` is
  gone and should never come back to make a row fit — stack the row.
- **`scripts/squeeze.mjs`** is a new standing check: it counts rendered
  lines against character count and fails anything at ~1-3 chars per
  line. Self-tested by loosening its threshold until it fires, because
  a detector that only ever prints `ok` proves nothing.

### The standing check is now nine widths

```bash
node .claude/skills/fraise-frontend/scripts/audit.mjs   http://localhost:3100 sitemap 320,360,414,768,1024,1280,1440,1920,2560
```

plus `squeeze.mjs` on `/` and `/en/` at `320,360,390,768,1440`.

**22 routes x 9 widths x 2 locales, no horizontal overflow and no
squeezed text.** Budget unchanged at 119.5 kB brotli — every fix is
CSS.

---

## 5.14 THE MOBILE MENU WAS CLIPPED BY ITS OWN HERO (2026-08-19)

On every route with `overlay`, `Header` renders INSIDE a hero section
carrying `overflow-hidden` for the media crop. The mobile disclosure
panel was `absolute end-0 top-7 min-w-40` — laid out inside that header,
therefore inside that hero, therefore **clipped by it**. On a phone the
menu opened as a 160px stub with its items cut off and the film's slate
showing through beside it.

### The fix: `fixed`, and full width

`fixed` takes the panel out of that containing block entirely, so no
ancestor's `overflow` can reach it, and `inset-x-0` gives it the screen
instead of 160px. `pt-20` clears the header bar; the summary is `z-40`
so CLOSE stays above the panel it opens.

Measured with the disclosure actually opened, on an overlay route and a
non-overlay one, in both locales:

```
390px  /tv-commercials/     panel 390x340 at 0,0   links 14, offscreen 0
414px  /en/reels-.../       panel 414x320 at 0,0   links 14, offscreen 0
360px  /our-work/           panel 360x340 at 0,0   links 14, offscreen 0
320px  /                    panel 320x340 at 0,0   links 14, offscreen 0
```

The probe also walks up from the panel reporting the nearest clipping
ancestor. It still says `section (hidden)` on overlay routes — which is
the point: the ancestor is unchanged and no longer matters.

### ⚠️ Why nothing caught this

`audit.mjs` never opens the menu, and a screenshot of a page with a
CLOSED disclosure looks perfect. **A component that only misbehaves in
an interactive state needs a probe that enters that state** — the same
lesson as the crew-card hover, which needed a real
`Input.dispatchMouseEvent` rather than a forced pseudo-state.

---

## 5.15 THE CLIENT MARQUEE (2026-08-19)

Rebuilt from a studio reference: rounded white squares, auto-scrolling.
Still 0 kB — one CSS keyframe over a track holding the logo set twice
and sliding exactly -50%, so the moment the first copy leaves the
second is already in its place.

### ⚠️ THE GAP GOES ON THE CARD, NOT ON THE TRACK

The first build used flex `gap`, and it was wrong in a way no
screenshot could show. A track of **2N cards holds 2N-1 gaps**, so half
the track is N cards + N-0.5 gaps — **half a gap short of one set**.
Translating -50% therefore lands 12px off on every cycle and the loop
hitches once every 44 seconds.

Measured, not guessed: half-track **1926px** against a **1938px** set.
Moving the spacing to `me-*` on each card makes every unit card+gap, so
2N units halve to exactly N. `me` and not `mr`, so it mirrors.

After: half-track **1938px**, set **1938px**. Exact, in both locales.

### ⚠️ Direction is not decorative

`translateX` is physical, so a single keyframe would run the marquee
the same way on an Arabic page as on an English one — against the
reading direction on one of them. A `[dir="rtl"]` branch swaps to a
mirrored keyframe. `dir` is server-rendered on `<html>`, so it is right
on first paint with no flash.

### ⚠️ Reduced motion cannot simply stop it

Killing the animation would freeze half the logos outside a container
with `overflow: hidden` — unreachable, permanently. That branch also
hands the container its scrollbar back, turning the marquee into the
manual rail it used to be. Same content, no movement. Hover and focus
pause it so a mark can be looked at.

### The probe, and a bug inside the probe

`scratchpad/marquee.mjs` reads the animation name, play state, samples
`translateX` twice 2.5s apart, and checks half-track against one set.

Its first version computed the set as card widths plus the computed
`gap` — which silently read **zero** the moment the spacing moved onto
the card, and reported a working marquee as broken. It now measures
`clone.offsetLeft - first.offsetLeft`, which includes the spacing
however it is produced. **A probe that measures the implementation
rather than the behaviour breaks when the implementation changes.**

```
1440px  dir=rtl  u-marquee-rtl  44s running   track 3876  set 1938  seamless: yes
 390px  dir=ltr  u-marquee      44s running   track 3072  set 1536  seamless: yes
```

`.u-rail` is deleted; nothing used it after this.

Verified: build/tsc/lint clean; **119.5 kB brotli unchanged** — the
whole marquee is CSS; no horizontal overflow at 320/768/1440/2560.

---

## 5.16 THE HERO, REBUILT TO THE LIVE SITE (2026-08-19)

The studio pointed at its own live `fraise.studio/en/`: statement
centred on the film, a line under it, a filled red call to action.

### ⚠️ TWO LOCKED RULES REVERSED, on instruction

1. **"One `h1` per page and it is SMALL — the work is the hero, not the
   title."** The `h1` was an 11px mono line in the corner. It is now the
   display statement, centred. This is the single most load-bearing
   sentence in the original analysis, and it is the studio's own live
   site that overrules it.
2. **"`--color-fraise` is interactive state only, never a background."**
   The CTA is a filled accent button.

Both are one-line reverts. What did not change: the film still runs
full-bleed and the type is made legible by a scrim, not by a colour
panel behind it.

### The old section 02 is gone

It was a standalone positioning band carrying the same statement, the
same tagline and the same two actions that now sit on the hero.
Repeating them one screen apart read as a template.

### ⚠️ THE SCRIM DID NOT REACH THE MIDDLE

`u-scrim` fades to zero at 62% from the bottom and `u-scrim-top` covers
only the first 30% — **the middle band is bare video**. That was fine
for four years of this build because the type lived in the corners. The
moment it moved to the centre, the subline over a pale cheese frame was
close to invisible.

Fixed with a flat `bg-ink/45` wash across the frame — flat, not a third
gradient stacked on the two existing ones — and the subline lifted from
`text-bone-dim` to `text-bone/85`.

**The lesson is not "add a scrim". It is that a scrim is designed for
WHERE the type sits**, and moving type into a region the scrim was
never shaped for is a legibility change, not a layout one.

### One thing that would have broken silently

The centred block covers the whole film. Without `pointer-events-none`
on the wrapper — restored on the buttons — the video's own play/pause
surface would have been unreachable everywhere except the two links.

Verified: build/tsc/lint clean; **119.5 kB brotli unchanged**; no
overflow at 320/768/1440/2560; no squeezed text; hero screenshot in
both locales at 1440 and at 390.

---

## 5.17 PROJECT PAGES, WORK DESCRIPTION, OG IMAGES (2026-08-19)

Three items from the remaining-work brief, in order.

### 1. `/our-work/` had no `description`

The only page missing one. Added to the `work` shape in
`types/content.ts` and authored per locale — the Arabic leads with the
format names because that is what a client searches for.

### 2. Project pages — 58 of them

`app/[locale]/our-work/[project]/page.tsx`. Every card on the site used
to land on a PILLAR page, so clicking one film took you to a list that
contained it.

- `Project` gained `slug` and `vimeoId?`; `lib/content-schema.ts`
  validates both and **fails the build on a duplicate slug**, because a
  duplicate is two pieces fighting over one URL and surfaces as a 404
  long after the build passed.
- Slugs generated from client + title (`knorr-chicken-stroganoff`), all
  29 unique, checked before they were written.
- `Route` gained `{ kind: "project"; slug }`, nested under `/our-work/`
  — the root already hosts `[pillar]`, and two dynamic segments at one
  level is an ambiguity with no rule to settle it.
- `ShowcaseCard` repointed. Sitemap derives project URLs from
  `PROJECTS`, so a new row is indexed the same build it ships.

⚠️ **NO FULL FILM PLAYS YET, and that is data, not code.** `vimeoId` is
wired end to end and the watch link renders the moment it is set — but
no project film in this repo has a published Vimeo id. Only the BTS
films do. Inventing ids would ship dead links from every page.

⚠️ Two credit labels shipped hardcoded English on the first pass —
"Format" and "Year" sat beside two Arabic labels on the Arabic page.
Every label is authored per locale now; the VALUES stay Latin where
they are notation, like the slate.

### 3. OG images

`lib/og.tsx` renders one card design for every route: 8 static plus 10
pillar plus 58 project. Server-rendered at build, so **zero client
bytes**.

⚠️ **THE ARABIC FONT HAD TO BE VENDORED.** `next/font/google` returns a
className, not font bytes, and satori needs bytes. The fallback inside
`@vercel/og` is Geist — Latin only — so every Arabic title would have
rendered as empty boxes on this site's PRIMARY locale. IBM Plex Sans
Arabic now lives in `assets/fonts/`, so the build never depends on a
network call.

⚠️ **`alignItems`, not `textAlign`.** The first render set
`direction: rtl` and `textAlign: right` and every Arabic card still sat
hard against the left edge — these are flex items, and text-align does
not move one.

⚠️ **The og:image URL carried `/ar/`.** Next builds it from the
FILESYSTEM route, so it emitted
`https://…/ar/our-work/al-sayad/opengraph-image` — the exact prefix the
proxy exists to hide, meaning every scraper would take a 308 before
getting a pixel. `ogUrl()` in `lib/routes.ts` now supplies it, and all
ten sampled routes emit the canonical form.

⚠️ The project card's meta line mixed Latin and Arabic in one string and
satori's bidi spaced it wrongly. It is Latin-only now — the kicker
already names the format.

### ⚠️ THE BUDGET IS AT THE CEILING: 119.9 kB of 120

Up from 119.5. Diffed chunk by chunk: **only the Turbopack runtime
changed, 3.3 → 3.8 kB.** Every other chunk is byte-identical. Adding
116 routes grew the runtime's chunk MAP, not any feature code — so
there is no feature to trim and no dead import to find.

**0.1 kB of headroom remains.** The next client-side addition of any
size breaks the budget. The two levers that exist are both dev-only
surfaces inflating the same map: `/style/` (a `"use client"` reference
page, noindex, unlinked) and the `components/studio/*` dashboard
leaves. Removing either is a decision, not a cleanup.

Verified: build clean, **29 → 87 static pages** (the 58 project
pages); tsc and lint clean; no
horizontal overflow across all sitemap routes at 390 and 1440; no
squeezed text; project page fully dark; OG cards rendered and inspected
in both locales.

---

## 5.18 THE ASPECT RATIO IS NO LONGER COPY (2026-08-19)

The studio asked why `2.39:1` appeared all over the app, and whether the
documentation called for it.

**It does not.** The Stage 1 brief names aspect ratio exactly twice, both
times as an asset spec — "a square or 16:9 poster frame for the thumbnail
state" (§9) and poster-frame delivery (§10). Never as something a
visitor reads. What §2 and §6 ask for is the opposite: *"a clear project
name on every video"*, *"Client — Campaign"*, *"minimal text
throughout"*.

The notation came from `docs/01-predev-analysis.md` — "the ratio is the
service taxonomy" — which was our reasoning, not the client's
requirement. It was printing in **seven places**:

| Where | Now |
|---|---|
| `Slate`, on every frame on the site | removed; the prop is gone too |
| Header → services dropdown | removed |
| Homepage capability rows | removed; the name column takes the span |
| `/our-work/` format band headers | count only |
| Project page credit block | client · service · year |
| `[pillar]` adjacent rows | name only |
| `/style/` | KEPT — it documents the system for developers |

**What did not change:** `PILLAR_RATIO` and `RATIO_CLASS` still decide
every layout, every CLS box and every `sizes` attribute. The ratio was
always engineering. It is simply no longer copy.

Verified with a probe that reads every rendered `\d+:\d+` string on a
page: home, work index, a project page, a pillar page and `/en/` all
report **none**. Build clean, tsc and lint clean, budget unchanged at
119.9 kB, no horizontal overflow across every sitemap route at 390 and
1440.

### Worth noting

The capability section's own caption already made the argument better
than the notation did — *"لكل صيغة شكلها الأصلي. الإطار نفسه يخبرك أي
نوع تشاهد قبل أن تقرأ اسمه"* / "Each format has its native shape; the
frame tells you which one before you read the label." With the numbers
gone that line is now literally true rather than a caption competing
with the thing it describes.

---

## 6. ROADMAP

| Step | Scope | Status |
|---|---|---|
| **1** | Project, tokens, fonts, types, `Slate` | **DONE, verified** |
| **2** | `app/[locale]/` — AR + EN side by side, correct server-rendered `dir` | **DONE, verified** |
| **3** | `proxy.ts` rewrite so Arabic sits at `/` instead of `/ar` | **DONE, verified** |
| **4** | Media system — `Poster`, `Preview`, concurrency manager | **DONE, verified** |
| **5** | Homepage, 7 sections | **BUILT on placeholders — awaiting art-direction go/no-go** |
| **6** | Work page — editorial cadence, `<Link>` filters, load-more | **DONE, verified** |
| **7** | Pillar template `[pillar]` — Reels is the money page | **DONE, verified** |
| **8** | Metadata, JSON-LD, sitemap, robots, 301 map | **DONE, verified** (OG images deferred) |

**MVP was three routes.** It is now five route files: Homepage, `/our-work/`,
`[pillar]` (ten pages), `/about-us/`, and `/style/` (noindex dev reference).
The studio page was added on an explicit request. Still **not** built: case
studies, a contact backend, a CMS, per-client pages.

### Target folder structure

```
app/[locale]/{page,work,services/[pillar]}/...
components/{primitives,media,work,sections,chrome}/
content/{projects,pillars,clients,team,bts,redirects}.ts  +  copy/{ar,en}.ts
lib/{routes,i18n,seo,video-manager}.ts  +  lib/hooks/
types/content.ts
proxy.ts                          (NOT middleware.ts — renamed in Next 16)
```

`lib/routes.ts` is the highest-leverage file in the project — it owns
`localizedHref()`, the slug↔locale mapping and the alternates builder. Nothing
constructs an href by hand, or `/ar/...` leaks into the URL bar once the
middleware rewrite lands.

---

## 7. OPEN QUESTIONS

### BLOCKING (blocks launch, not development)

- ~~**B1**~~ — **ANSWERED 2026-08-18.** Arabic is at the root, English at
  `/en/`, canonical host is **`www.fraise.studio`**. Confirmed two ways: the
  developer walked the live language switcher, and the live site's own
  `hreflang` tags declare it:
  `hreflang="ar" → https://www.fraise.studio/`,
  `hreflang="en" → https://www.fraise.studio/en/`.
  **Decision: preserve AR at root.** Step 3 proceeds as planned.
  **Carry the `www` forward** — `metadataBase`, every canonical and the whole
  redirect map are on `www`. Writing them non-www adds a 301 hop in front of
  every page. Note the analysis doc still says `fraise.studio` without `www`;
  the header check above supersedes it.
- ~~**B2**~~ — **ANSWERED BY EVIDENCE 2026-08-19.** The live site already uses
  `/our-work/` in **both** locales, so that is what the new site uses. The
  earlier recommendation of `/work/` was a preference (shorter) dressed as a
  reason; decision D1 had already settled the principle — the cheapest
  migration is the one where URLs do not move. Keeping it costs two fewer
  redirects and zero ranking risk.
  ⚠️ This is the ONE slug that cannot live in `lib/routes.ts` alone: a static
  route's **folder name IS its URL**, so `app/[locale]/our-work/` must change
  with it. Every other slug is data, because the pillars go through `[pillar]`.
- ~~**B3**~~ — **ANSWERED 2026-08-18.** Yes. `GET /en` → **301** → `/en/`, and
  every internal link on the live homepage ends in `/`.
  **`trailingSlash: true` is now set in `next.config.ts`.**
  Consequence already hit and fixed: a redirect `destination` must carry the
  slash itself (`/ar/`, not `/ar`), or it 307s to `/ar` and then 308s to
  `/ar/` — the two-hop chain named in risk #2, sitting on the site entry
  point. Verified single-hop against a running server.
- **B4** — Asset inventory by pillar: how many finished pieces at premium
  quality, with permission to publish?

### 7.1 RECOVERED URL INVENTORY (Arabic / root locale)

Crawled from the live homepage on 2026-08-18. **This is the source of the
redirect map** — every one of these is a live, indexed URL today.

Nine service pages, all at **root level** — there is no `/services/` segment
on the live site:

| Live URL | Pillar it maps to |
|---|---|
| `/إنشاء-مقاطع-ريلز/` | **reels** ← MVP, strongest organic asset |
| `/tv-commercials/` | tvc |
| `/recipe-videography/` | recipes |
| `/food-photography-service/` | stills |
| `/product-photography/` | stills |
| `/commercial-photography/` | stills |
| `/food-decorations/` | menu |
| `/إنتاج-الأفلام-القصيرة/` | tvc (short films) |
| `/إنتاج-وتصوير-فيديو-احترافي-للطعام-وال/` | tvc or recipes — **needs a decision** |

Note the last slug is truncated mid-word (`-وال`) by WordPress. Copy it
verbatim into the redirect map; do not "correct" it.

Non-service pages: `/` · `/حكاية-استوديو-فريز/` · `/our-work/` ·
`/our-team/` (+ `#backstage`) · `/clients/` · `/contact-us/`

Confirms the nine→five consolidation: **five of the nine collapse into
`stills`/`tvc`**, so several old URLs 301 to the same new page. That is fine
and expected.

**Not yet recovered: the English URL set.** `/en/` serves a bot-protection
interstitial ("One moment, please…") to non-browser clients, so it cannot be
curled. Get it from Search Console or by hand from a real browser before
writing the redirect map.

### D1 — DECIDED 2026-08-18

**a) Pillar pages sit at root level. There is no `/services/` segment.**
Route file: `app/[locale]/[pillar]/page.tsx`.

**b) Slugs are per-locale.** `lib/routes.ts` holds
`Record<Pillar, Record<Locale, string>>`, not one shared slug.

```
AR   /إنشاء-مقاطع-ريلز/     ← unchanged from the live site, no 301, no risk
EN   /en/reels/
```

Implementation notes for Step 3:

- `generateStaticParams` for `[pillar]` must return the **Arabic** slug for
  `ar` and the Latin one for `en`. Set `dynamicParams = false` there too, or
  `/anything/` renders a pillar page.
- Static sibling routes (`/work/`, `/contact/`) take precedence over the
  `[pillar]` dynamic segment, so root-level pillars do not collide with them.
  Any future top-level route must still be checked against the slug list.
- The `params` value arrives **percent-decoded** — compare against the raw
  Arabic string, not the encoded form. Encode only when building an href.
- `next/link` handles encoding for `href`; do not hand-encode on top of it or
  you get double-encoded `%25D8`.

The reasoning that produced this decision is kept below.

### D1 — the reasoning (resolved)

Two coupled URL decisions, both cheaper to make now than after launch:

**a) Keep the `/services/` segment?** The planned tree is
`app/[locale]/services/[pillar]`, so Reels becomes `/services/reels/`. The
live URL has no such segment. Dropping it keeps the new URLs closer to the
old ones and shorter.

**b) Per-locale slugs?** *Recommended: yes.* Keeping `/إنشاء-مقاطع-ريلز/` for
Arabic means **zero redirect and zero ranking risk on the single most
valuable page**, and an Arabic keyword in the URL is a genuine Arabic-SEO
asset. The cost is real but contained: `lib/routes.ts` must hold a
`Record<Locale, string>` of slugs per pillar rather than one shared slug, and
percent-encoded paths need care in tests and logs.

The alternative — moving Reels to `/reels/` — buys tidiness and costs weeks
of volatility on the page that earns the most. **Recommendation: keep the
Arabic slug, drop `/services/`.** Awaiting an explicit decision.

### HIGH PRIORITY

- **H2** — Do preview encodes exist, or must they be produced from masters?
  Blocks Step 4.
- **H3** — IBM Plex Sans Arabic (free, currently used) or budget for 29LT Bukra
  / Greta Sans Arabic (~$300–800)?

### ASSUMPTIONS (flag if wrong)

- ~~**A1**~~ — **WRONG, and it matters.** The live Arabic site does not use
  Latin slugs. It uses a **mix**, and the most valuable page is the Arabic one:
  `/إنشاء-مقاطع-ريلز/` is the live Reels URL. See §7.1 for the recovered
  inventory and the decision it forces (**D1**).
- **A2** — Header has no scroll-state behaviour in MVP.
- **A3** — Lightbox and full-film playback are out of MVP.

---

## 8. TOP RISKS

1. **B1 answered wrong** → every URL and the whole redirect map is wrong.
2. **Trailing-slash mismatch** → a 308 chain in front of every 301 on the
   highest-value page.
3. **Asset thinness** → full-bleed rows look *emptier* than the current small
   grid. Mitigation is fewer + larger rows, never padding with weak work.
4. **9 kB JS headroom** → one careless `"use client"` on a section blows it.
5. **Team roster works against the positioning** — three of six share a surname
   and one is an e-commerce consultant, on the page whose job is proving "not
   one person with a camera." Restructure around production departments.
   *Client conversation, not a code change.*

---

## 9. HOW TO RESTART

```bash
cd f:\work\fraise-studio
npm run dev        # http://localhost:3000
```

Then say: **"Read docs/02-handoff.md and continue from Step 3."**

`/` currently 307s to `/ar`. Step 3 replaces that redirect with a `proxy.ts`
rewrite so Arabic is served **at** `/` with no redirect at all, and `/ar`
stops appearing in the URL bar. That is also the point at which
`lib/routes.ts` must exist — nothing may build an href by hand after it.

Full pre-development analysis (24 sections, A–X) is in
`docs/01-predev-analysis.md`. The same document, designed and readable in a
browser, is `docs/01-predev-analysis.html` — open it directly, it needs no
server.

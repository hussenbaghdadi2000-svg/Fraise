# FRAISE STUDIO — PRE-DEVELOPMENT ANALYSIS

Premium food & beverage production studio · Amman, Jordan
Redesign & replatform: WordPress → Next.js
Bilingual AR / EN

Status: **pre-implementation. No code to be written until approved.**

---

## A. EXECUTIVE SUMMARY

### What I verified before writing this

I did not take the brief at face value. I crawled the live domain and the preview build. Findings that change the plan:

| Finding | Evidence | Consequence |
|---|---|---|
| Live site is **WordPress** | `robots.txt` contains the standard `wp-admin` / `wp-includes` / `wp-content` block | Migration is a replatform, not a redesign. Media currently lives in `/wp-content/uploads/`. |
| **No sitemap exists** | `robots.txt` declares no `Sitemap:` line; `/sitemap.xml` returns 404 | The ~52 indexed URLs were discovered by crawl alone. A correct sitemap is an immediate, free win. |
| **Arabic is almost certainly the root locale** | The brief's canonical URL is `fraise.studio/en/`. WordPress multilingual plugins put the *default* language at root and secondary at `/xx/`. | The strongest organic page (Arabic Reels) is on a root-level URL. This is the single highest-risk item in the project. |
| **`/work/` is not a portfolio** | On the preview, `/work/` renders five *service* tiles linking to `/services/*`. Actual projects live at `/projects/` labelled "قصص النجاح" (success stories). | The "portfolio feels fragmented" complaint has a structural cause, not a visual one. |
| Real client roster is recoverable | BTS page names Jordina, Baker, Sunwhite, JoSweet, UMIC; contact page names Zaity, KFC, Thuraya Halloumi | Eight nameable brands — enough for a credible client wall today. |
| An editorial numbering motif already exists | `01/05`, `06`, `01 / PEOPLE`, `02 / PROCESS` on preview pages | The one genuinely editorial device in the current brand. Keep and systematise it rather than invent a new motif. |

### The actual problem

The current site's weakness is **not** that it is ugly. It is that **the information architecture argues against the positioning.**

A visitor who clicks "Work" — the single highest-intent action on a production studio site — is shown five service tiles with descriptive copy. The work is structurally prevented from ever being the hero. Every downstream symptom the brief lists (small thumbnails, four-per-row, click-to-play, pagination, too much text, "feels like a freelancer") is a consequence of a site organised around *what the studio sells* rather than *what the studio made*.

### The three jobs, in priority order

1. **Structural — make "Work" mean work.** Projects become the primary content type. Services become filtered views over projects, not a parallel hierarchy. This alone fixes most of the brief.
2. **Positional — convert a six-person roster into a production company.** This is a *content* problem more than a design problem, and it needs an honest conversation (see §V, risk 5).
3. **Technical — replatform without dropping the Arabic Reels page.** Everything else is recoverable. That page is not, cheaply.

### What "success" looks like

Not "the most technically impressive website." A visitor lands, sees moving food photography at scale within 400ms of paint, understands within one scroll that this is a crew with a client roster and a facility, and can name three brands Fraise has shot for without reading a paragraph.

---

## B. CORE DESIGN DIRECTION

### Direction: **"Black Room, Warm Plate"**

The interface has **no colour of its own.** The UI is achromatic — near-black ground, bone-white type, hairline rules, mono metadata. Every pixel of chroma on the page comes from the food.

This is not a stylistic preference. It is the operative argument of the whole design, and it is what will keep this from looking AI-generated:

- It **forbids** gradients, glassmorphism, coloured blobs, tinted shadows, and duotone overlays — not by taste, but because they would be the interface asserting colour it isn't entitled to.
- It makes food photography look **more saturated** than it is, by contrast. A hero plate against `#0B0B0C` reads richer than the same plate against white or grey.
- It matches the physical truth of the work: a grading suite, a blacked-out food studio, a cinema. The site should feel like the room where the work is finished.

Every generic-portfolio reflex is answered by one question: *does the interface earn colour here?* The answer is no, except for one accent restricted to interactive state (§K).

### Positioning device: **the slate**

A film slate is the production industry's own metadata object. Every piece of media on this site carries a slate:

```
JORDINA          TVC        2023        2.39:1
```

Set in mono, small, uppercase, tracked, bottom-inline-start of the frame.

This is doing four jobs at once:

1. It satisfies the client's explicit requirement — **project and client name visible on every video** — without captions that read like a portfolio.
2. It reads as *production infrastructure*, not portfolio decoration. Freelancers write captions; productions write slates.
3. It is **locale-independent.** Client names, years, and format notations are Latin/numeric in both AR and EN — so the slate system survives RTL untouched (a real and underrated advantage; see §J).
4. It gives every frame a typographic anchor, which is what stops a full-bleed video grid from feeling like a moodboard.

### Structural device: **aspect ratio as taxonomy**

This is the strongest single idea in this proposal and I want to argue for it explicitly.

The five pillars each have a native shape in the real world. Encode it:

| Pillar | Ratio | Why |
|---|---|---|
| TVC / Cinematography | **2.39:1** | Anamorphic. Broadcast/cinema. |
| Recipes | **16:9** | The format recipe content is actually delivered in. |
| Reels | **9:16** | Vertical, native. |
| Stills | **4:5** | The editorial/print portrait crop. |
| Menu Plate Design | **1:1** | Overhead plate, menu tile. |

Consequences:

- The work grid becomes **self-organising and asymmetric for a reason.** A row containing a 2.39:1 and a 9:16 is visually dynamic *and* semantically legible. This is how we get the "editorial, asymmetric, not-a-uniform-grid" quality the brief asks for without arbitrary art direction.
- A visitor learns the service taxonomy **without reading service names.** After one scroll, vertical = reels.
- It is a hard constraint that makes every future layout decision easier and prevents the grid drifting into generic card soup.

No card chrome. No rounded corners on media. Media is a **frame** — a sharp rectangle. Radius `0` on all media, `2px` maximum on controls only.

Separation is achieved with **1px hairline rules and whitespace**, never shadows. Shadows imply floating cards; rules imply print.

---

## C. VISUAL LANGUAGE

**Ground.** Near-black `#0B0B0C`, not `#000`. Pure black crushes against the letterboxed black of 2.39:1 video and makes the frame edge disappear; it also renders as a hard OLED cutoff that looks cheap during fades. `#0B0B0C` keeps the frame edge readable and lets true black video content sit *inside* it.

**Full-bleed is the default; margins are the exception.** This is the inverse of a normal portfolio. Media goes edge to edge unless there is a compositional reason to inset it. Text is the thing that gets a container.

**One h1 per page, and it is small.** On a video-first site, the largest typographic element should almost never be the page title. The work is the hero; the h1 is a label that happens to be semantically important. This is where most "premium studio" attempts fail — they put 120px type over the hero video and instantly look like a template.

**Numbering as structure.** Keep the existing `01 / PEOPLE`, `02 / PROCESS` motif and apply it consistently: sections, projects, team members, BTS items. It gives editorial pacing, it is free, it is already in the brand, and it is culturally neutral across AR/EN.

**Scrims, not opacity.** Slate text over video sits on a bottom-anchored linear gradient scrim (`transparent → rgba(0,0,0,0.55)`), never on a reduced-opacity overlay across the whole frame. Reducing the whole frame's opacity dulls the food, which contradicts the entire direction.

**Motion is the only decoration.** No illustration, no iconography beyond a minimal set (arrow, play, close, language), no textures, no grain overlays, no noise. Grain in particular is the current AI-portfolio tell.

---

## D. HOMEPAGE INFORMATION ARCHITECTURE

### The fold decision (opinionated)

The client asked for "more videos visible when the page opens." The generic response is a 100vh hero video — which shows **exactly one video** and is the single most common move on every studio site referenced.

**Recommendation: hero occupies `88vh`, not `100vh`.**

The remaining ~12vh reveals the top edge of the first Selected Work row. This:
- literally satisfies "more videos visible on open" (two, sometimes three)
- proves scrollability without a bouncing chevron
- is a deliberate compositional choice rather than a default
- costs nothing in performance

On mobile, hero is `82svh` (using `svh`, not `vh`, so mobile browser chrome doesn't crop it).

### Section order

| # | Section | Content | Rationale |
|---|---|---|---|
| 01 | **Hero reel** | Full-bleed 2.39:1 showreel, autoplay muted loop, poster-first. Slate bottom-start. Logo + nav overlaid. | Video-first, immediate. |
| 02 | **Positioning line** | One sentence, ≤12 words, set large in a full-width editorial band. | "Minimal copy" means *one* line, not a short paragraph. |
| 03 | **Selected Work** | 5–6 projects in the editorial cadence (§F). Every piece slated. | The core of the page. |
| 04 | **Capabilities** | Five pillars, each represented by a looping clip **in its own aspect ratio**. | Teaches the taxonomy visually. Replaces the nine-service navigation. |
| 05 | **Clients** | Eight brand names **set in type**, large. | See below. |
| 06 | **The Studio** | Combined team + BTS teaser. Crew stills, on-set footage, 3–4 hard numbers. | This is the studio-not-freelancer proof. It must be a real section, not a footer link. |
| 07 | **CTA** | One line, one action, contact details visible. | |

### Client wall — set names in type, not logos

**Do not build a logo grid.** Reasons, in order of weight:

1. A grid of greyscale client logos is *the* SaaS "Trusted by" pattern. It is the fastest way to make a cinema-grade site look like a startup landing page.
2. Logo quality will be inconsistent — KFC's mark is a full-colour illustrated portrait; Thuraya Halloumi's is likely a local wordmark. Normalising them to greyscale flattens KFC's recognition value and makes the small brands look like placeholders.
3. Names set at 48–72px in the site's own display face read as *editorial credit*, like a film's end titles, and stay on-brand.

```
KFC        ZAITY        JORDINA        BAKER
SUNWHITE   JOSWEET      THURAYA        UMIC
```

If the client insists on logos, the fallback is logos on hover-reveal over the typographic name — but argue for type first.

### What is deliberately NOT on the homepage

- No testimonial carousel.
- No "our process" step diagram (that belongs on service pages).
- No awards badges row (link `#awards` from nav instead, as today).
- No blog/news teaser.
- No stats counting up on scroll. Numbers are set, not animated — animated counters are a startup tell.

---

## E. SERVICE PAGE INFORMATION ARCHITECTURE

One shared template, art-directed per pillar by its **aspect ratio** and its **hero asset**. Do not build five bespoke layouts; the consistency *is* the studio signal.

| # | Block | Notes |
|---|---|---|
| 01 | Hero | Full-bleed film **in the pillar's native ratio**. Immediately signals the format. |
| 02 | H1 + one line | ≤20 words. |
| 03 | **Capability tags** | This is where the old nine granular services go. Rendered as a text set, crawlable, keyword-bearing, non-navigational. Solves the SEO consolidation problem (§Q). |
| 04 | Work grid | Filtered to this pillar, native ratio dominant, hover previews. |
| 05 | Process strip | 3–4 steps, text + one still each. **This is production-credibility content** — pre-production, on-set food styling, grade. Freelancers don't publish process. |
| 06 | Case study | One linked deep-dive. |
| 07 | Adjacent pillars | Two links. Internal link equity + genuine cross-sell. |
| 08 | CTA | Pre-filled project type in the contact form. |

### Reels gets special handling

Per the brief, the Arabic Reels page is the strongest organic page in Search Console. Therefore:

- It is the **most copy-rich** of the five pillar pages. It is the one page where I will argue *against* minimal text — it needs enough crawlable Arabic body copy to hold its rankings. Target 350–500 Arabic words, structured under real h2s, placed *below* the visual fold so it costs the visual experience nothing.
- Its 9:16 wall is also the most visually distinctive layout on the site — a horizontally-scrolling or 4-up vertical wall of phone-shaped video. Good SEO and good art direction happen to coincide here.
- Its URL must be the 301 target for every reels-related legacy URL, and its content must not be materially reduced at launch (§Q).

---

## F. WORK / PORTFOLIO INTERACTION MODEL

### Kill pagination

Numbered pagination is a listing-page convention (e-commerce, blogs). It fragments a body of work into arbitrary chunks and signals "there is a lot of this, sorted."

**Replace with an explicit "Load more" button — not infinite scroll.** Reasoning:
- Infinite scroll makes the footer unreachable, which is where contact details live.
- Infinite scroll reads as a *feed*. A feed is the opposite of a curated studio reel.
- A button is a user-initiated network request — better INP, better data-cost behaviour on mobile, better crawlability (the first N are in the server-rendered HTML).

### The editorial cadence

Not a uniform grid, and not random asymmetry. A **repeating four-row rhythm** — a system, which is precisely the argument against "AI-generated template":

```
ROW A   ████████████████████████████   1 × full-bleed 2.39:1
ROW B   ███████████████ ██████████████  2 × 16:9
ROW C   ████████████████    ███         1 × large offset + 1 × 9:16, whitespace inline-end
ROW D   ██████ ██████ ██████            3 × 4:5 stills
```

Then repeat. Rules:
- **Never four videos in a row.** Maximum three, and only for 4:5 stills.
- Maximum **two** moving-image pieces per row.
- Row C's whitespace is mandatory, not optional — it is the breathing room the brief asks for, scheduled rather than sprinkled.

### Filters

A horizontal rail: `ALL · TVC · RECIPES · REELS · STILLS · MENU`.

Filtering updates the URL via shallow routing (`/work?service=reels`) so a filtered view is shareable, **but `<link rel="canonical">` always points to `/work`.** The five pillar pages are the indexable filtered views. This avoids creating five thin, near-duplicate parameterised pages competing with the pillar pages.

### Labelling

Every piece, always visible (not hover-revealed) — the client asked for this explicitly and they are right:

```
SUMMER CAMPAIGN
COCA-COLA · TVC · 2024
```

Title in display face, credit line in mono. Visible at rest, at 100% opacity over a scrim. Hover raises contrast and reveals the arrow affordance; it does not *introduce* the label.

---

## G. VIDEO INTERACTION STRATEGY

This is the section that determines whether the site feels premium or broken. Detail matters here.

### Asset strategy — two encodes per project, minimum

| Encode | Purpose | Spec |
|---|---|---|
| **Preview loop** | Grid hover / in-view autoplay | 6–8s, silent, **audio track stripped entirely**, ~720p max (640px wide for grid tiles), H.264 MP4 baseline + optional AV1/WebM, target **< 600 KB**, faststart atom at head |
| **Full film** | Lightbox / project page | Adaptive HLS via streaming provider, with audio, captions |

Stripping the audio track is not cosmetic: it saves real bytes, removes autoplay-policy edge cases entirely, and prevents a muted-video-unmutes bug class.

**Poster images must be extracted from the preview loop's own first frame.** If the poster is a separate art-directed still, the poster→video transition visibly jumps and the whole effect reads as cheap. This is the single most common failure mode of hover-preview grids.

### Desktop

```
poster (next/image, no <video> src yet)
  → pointerenter
  → 120ms intent delay          ← prevents thrash on fast mouse sweeps across the grid
  → attach src, load, play()
  → crossfade poster → video over 240ms
  → pointerleave
  → pause, currentTime = 0, crossfade back over 300ms
  → keep src attached for ~30s   ← re-hover is instant
  → detach src when scrolled out of viewport
```

The 120ms intent delay is not optional. Without it, dragging the cursor diagonally across a 6-tile grid fires six `load()` calls and the browser thrashes.

**Concurrency cap: maximum 2 decoding videos at any time** (hero + one preview). A tiny module-level manager pauses the least-recent when a third starts. Mobile Safari has a hard limit on simultaneous decoders and degrades unpredictably past it.

**Hero pauses when scrolled out of viewport** via IntersectionObserver. A hero looping off-screen for the whole session is pure battery and decode cost.

### Mobile

**Recommendation: autoplay in viewport, but exactly ONE at a time — whichever card is nearest viewport centre.**

Rejected alternatives and why:
- *Tap-to-preview:* on a site whose entire complaint is "not enough video visible," a mobile experience where the default state is zero motion actively defeats the brief. Most mobile users would never tap.
- *Autoplay everything in view:* three or four simultaneous decoders on a mid-range Android is jank plus real data cost — a meaningful concern for the Jordan market.

One-at-a-time centred autoplay gives the *feeling* of a live, motion-rich page at the cost of a single decoder. Implementation: IntersectionObserver with multiple thresholds, pick the entry with the greatest intersection ratio whose centre is nearest viewport centre, play it, pause all others.

**Bail out to posters only when:**
- `prefers-reduced-motion: reduce`
- `navigator.connection.saveData === true`
- `navigator.connection.effectiveType` is `2g` / `slow-2g`

### Keyboard parity

The hover preview **must also fire on `:focus-visible`.** A keyboard user tabbing through the grid should get the same preview a mouse user gets. This is a one-line addition that almost every site with this pattern gets wrong.

The preview `<video>` is decorative and carries `aria-hidden="true"`; the wrapping link carries the accessible name (`"Summer Campaign — Coca-Cola, TVC 2024"`).

---

## H. DESKTOP VS MOBILE BEHAVIOUR

| | Desktop (≥1024px) | Mobile (<768px) |
|---|---|---|
| Hero | 88vh, 2.39:1 source | 82svh, **separate portrait-cropped encode** |
| Hero text | Overlaid, bottom-start | Overlaid, bottom-start, one size down |
| Nav | Inline, overlaid on hero | Full-screen overlay drawer |
| Work grid | Editorial cadence, up to 3 across | Single column, full-bleed, ratios preserved |
| Video trigger | Hover / focus-visible | Nearest-to-centre in-view autoplay, one at a time |
| Concurrent videos | Max 2 | Max 1 |
| Slate | Always visible | Always visible, mono steps down to 11px |
| Load more | Button | Button |
| Filters | Horizontal rail | Horizontally scrollable rail, no dropdown |

**Art-directed hero sources.** The mobile hero must be a genuinely different crop — a 4:5 or 9:16 encode — not a 2.39:1 letterboxed into a phone. A letterboxed anamorphic hero on a phone is ~30% black bars and destroys the "big video" impression the entire brief is about. This is delivered with `<video>` + `<source media="...">`, which is well-supported and free.

---

## I. DESIGN SYSTEM PROPOSAL

```
COLOUR
  --ink            #0B0B0C   ground
  --ink-raised     #131315   elevated surfaces, filter rail
  --bone           #F2EFE9   primary type (warm, not #FFF)
  --bone-dim       #A8A49C   secondary type, slate metadata
  --hairline       rgba(242,239,233,0.14)
  --fraise         #C8402F   INTERACTIVE STATE ONLY

TYPE
  --font-display   Latin grotesk        headings, project titles
  --font-arabic    Arabic sans          all Arabic text
  --font-mono      Geist Mono / JetBrains Mono   slate metadata, numbering

RATIO (the taxonomy)
  --ratio-tvc      2.39 / 1
  --ratio-recipe   16 / 9
  --ratio-reel     9 / 16
  --ratio-still    4 / 5
  --ratio-menu     1 / 1

SPACE  (4px base, editorial jumps — deliberately sparse)
  1:4  2:8  3:12  4:16  6:24  8:32  12:48  16:64  24:96  32:128  48:192

RADIUS
  media    0        always
  control  2px      maximum

MOTION
  --ease-cine      cubic-bezier(0.16, 1, 0.3, 1)
  --dur-fast       240ms    crossfades
  --dur-base       400ms    hover states
  --dur-slow       800ms    section reveals

BREAKPOINTS
  sm 480   md 768   lg 1024   xl 1440   2xl 1920
```

Rules that keep it intentional:
- **No arbitrary Tailwind values in feature code.** `[13px]`, `[#1a1a1a]`, `mt-[27px]` are review-blockers. Extend the theme instead.
- **No shadow utilities anywhere.** Separation is hairlines and space.
- **No `rounded-*` on media.** Ever.
- Every media element declares `aspect-ratio` from the ratio tokens. No exceptions — this is also the CLS strategy.

---

## J. TYPOGRAPHY RECOMMENDATION

### Do not use one font for both scripts

A "supports Arabic and Latin" superfamily is the lazy answer and it always compromises one script. Arabic and Latin have different optical requirements. Choose two faces deliberately and match them optically.

### Latin — display & body

**Recommended (paid):** *Söhne* or *Suisse Int'l* — neo-grotesks with editorial authority and no startup connotation.
**Recommended (free, production-viable):** **Geist Sans**. Clean, well-hinted, genuinely neutral, ships via `next/font`, has a matching mono.
**Avoid:** Inter (unmistakably SaaS at this point), Poppins, Montserrat, DM Sans, anything geometric with a single-storey `a`.

### Arabic — the more important decision

Arabic is the strongest organic market. It cannot get a fallback face.

**Recommended (paid):** **29LT Bukra** or **TPTQ Greta Sans Arabic**. Both are contemporary Arabic sans faces with genuine weight ranges and are what serious regional studios actually license. Budget roughly $300–800 for a web licence.
**Recommended (free, production-viable):** **IBM Plex Sans Arabic**. Real weight range, properly drawn, pairs credibly with a neutral Latin grotesk.
**Avoid:** Noto Kufi Arabic and Cairo — both read as "default Arabic web font" to an Arabic-speaking audience, which is exactly the freelancer signal we are removing.

### Mono — the slate

**Geist Mono** or **JetBrains Mono**, used only for slate metadata, section numbering, and filter labels.

There is no Arabic monospace convention, and it doesn't matter: **slate content is Latin/numeric in both locales** (client names, years, `2.39:1`, `TVC`). The slate system is therefore locale-invariant — a genuine architectural convenience that falls out of the design.

### Arabic typesetting rules — non-negotiable

These are where "Arabic as first-class" is actually proven:

1. **Arabic runs ~8–12% larger** than Latin at the same optical size. Set `--font-size-multiplier: 1.1` on `[lang="ar"]` and apply it in the type scale.
2. **Arabic needs more line-height** — roughly `+0.15` over the Latin value, to clear ascenders and diacritics.
3. **Never uppercase Arabic.** There is no case in the script. Every `text-transform: uppercase` in the system must be gated: `[lang="en"] .u-caps { text-transform: uppercase }`.
4. **Never letter-space Arabic.** Arabic is a connected script; positive tracking breaks the joins and looks like a rendering bug. Every `letter-spacing` rule must be equally gated.
5. Arabic numerals: use **Western Arabic numerals (0–9)** throughout, including in AR. This is standard commercial practice in Jordan and keeps years and slate data consistent across locales.

### Type scale (fluid, `clamp()`)

Deliberately **gapped** — a large jump from body to display with nothing in between. Mid-sizes are what make a page feel like a template.

```
display-xl   clamp(2.75rem, 6vw,  5.5rem)     hero, section openers
display-l    clamp(2rem,   4vw,   3.25rem)    project titles
display-m    clamp(1.5rem, 2.5vw, 2rem)       subsection
body-l       1.125rem                          positioning line only
body         1rem                              running copy
slate        0.75rem                           mono, tracked +0.08em (EN only)
```

---

## K. COLOUR STRATEGY

**The palette is achromatic plus one accent, and the accent is never decorative.**

`--fraise: #C8402F` — derived from the brand name (*fraise* = strawberry) so it carries brand logic rather than being arbitrary.

**Permitted uses, exhaustively:**
- `:focus-visible` ring
- active filter state
- link hover underline
- the "recording" dot in the live-showreel indicator (one instance, homepage hero)

**Forbidden:** backgrounds, buttons at rest, borders at rest, headings, icons at rest, hover fills, any gradient.

This restriction is the guardrail. The moment the accent becomes a button fill, the site starts sliding toward a landing page. Enforce it in review.

**Contrast:**
- `--bone #F2EFE9` on `--ink #0B0B0C` → ~17:1. Passes AAA comfortably.
- `--bone-dim #A8A49C` on `--ink` → ~8.5:1. Passes AA for the 12px mono slate.
- `--fraise #C8402F` on `--ink` → ~4.6:1. Passes AA for non-text UI and large text. **Do not use it for body copy.** For the focus ring this is fine and the ring additionally uses a 2px offset for shape contrast.

**Warm, not neutral, white.** `#F2EFE9` rather than `#FFFFFF`. Pure white adjacent to food photography reads clinical and slightly blue; a warm bone sits with the food and makes the whole page feel lit rather than printed.

---

## L. GRID AND SPACING STRATEGY

**12 columns, and every rule written in logical properties.**

```
padding-inline   not padding-left/right
margin-inline    not margin-left/right
inset-inline-start  not left
border-inline-start not border-left
text-align: start   not text-align: left
```

Tailwind's `ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*` utilities map to these directly. **A single `pl-*` in the codebase is an RTL bug**, so this is a lint-enforceable rule, not a convention (§S).

**Containers:**

| Token | Width | Used for |
|---|---|---|
| `full` | 100vw | media, hero, work rows |
| `wide` | 1600px | grid sections, client wall |
| `text` | 720px | running copy, process steps, legal |

Text never exceeds 720px — roughly 70 Latin characters, comfortable Arabic measure.

**Gutters:** `24px` mobile → `48px` md → `64px` lg. Deliberately generous; the whitespace is load-bearing.

**Vertical rhythm between sections:** `96px` mobile → `192px` desktop. Large section spacing is one of the cheapest and most reliable premium signals — it is what separates "editorial pacing" from "sections stacked."

---

## M. MOTION STRATEGY

### Recommendation: no animation library in v1. CSS + IntersectionObserver only.

The complete motion vocabulary this site needs:

| Behaviour | Implementation |
|---|---|
| Poster ↔ video crossfade | CSS `opacity` transition |
| Section reveal on enter | IntersectionObserver + CSS class |
| Media hover scale | CSS `transform: scale(1.02)` |
| Nav overlay open/close | CSS `transform` + `opacity` |
| Filter state change | CSS |

None of that needs a library. Framer Motion costs ~35–45 KB gzip *and* forces `"use client"` onto layout-level components, which directly conflicts with the Server-Components-by-default requirement in §O. GSAP is ~50 KB+ and is justified only by timeline-sequenced or scroll-scrubbed animation, which this direction explicitly rejects as gimmicky.

**The one case that would justify revisiting:** a shared-element transition from a work card to the project detail page. If we want that, use the **native View Transitions API** (`document.startViewTransition`, `view-transition-name`) before reaching for a library. Progressive enhancement is automatic — unsupported browsers get an instant navigation.

### Motion principles

- **Slow.** 600–800ms for reveals. Fast animation reads as UI; slow reads as cinema.
- **One curve.** `cubic-bezier(0.16, 1, 0.3, 1)` for everything entering. Never `ease-in-out` on entrances, never a spring, never a bounce.
- **Opacity + 16px translate. That is the entire reveal.** No scale-in, no blur-in, no rotate, no clip-path wipes.
- **Stagger ≤60ms and ≤3 items.** Longer staggers make a grid feel like it is loading badly.
- **Nothing animates twice.** Reveals fire once; the observer unobserves.
- **Nothing animates on scroll position.** No parallax, no scroll-scrub, no pinned sections. These are the current AI-portfolio signature and they wreck INP.

### Reduced motion

```
@media (prefers-reduced-motion: reduce) {
  *  { animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important; }
}
```
Plus, in JS: reveals apply their end state immediately, and **all video autoplay is disabled — posters only, with an explicit play control on each.** Reduced motion on a video-first site must be handled in JS, not just CSS; the CSS media query does not stop a `<video autoplay>`.

---

## N. COMPONENT ARCHITECTURE

### The server/client boundary is the key decision

The naïve approach makes `WorkCard` a client component because it needs hover. That drags the poster `<Image>`, the slate markup, and the title into the client bundle — multiplied by every card on the page.

**Use the children-as-props pattern.** A thin client wrapper receives already-rendered server markup:

```
<HoverPreview          ← "use client", ~1.5 KB, holds ONLY the video element + handlers
  src={project.previewSrc}
  ratio={project.ratio}
>
  <WorkCardContent />  ← Server Component: <Image> poster, slate, title, link
</HoverPreview>
```

The server component is serialised as an RSC payload, never shipped as JS. The client bundle contains the interaction logic and nothing else.

### Component inventory

**Primitives** — `Container`, `Rule`, `Slate`, `SectionNumber`, `Eyebrow`, `LinkArrow`

**Media** — `Poster` (next/image wrapper, enforces ratio token), `HoverPreview` (client), `InViewVideo` (client, mobile autoplay), `HeroReel` (client, art-directed sources + IO pause), `Lightbox` (client, dynamic import — not in the initial bundle)

**Composites** — `WorkCard`, `WorkGrid` (owns the four-row cadence), `FilterRail` (client), `PillarCard`, `TeamCard`, `BTSCard`, `ClientWall`, `ProcessStrip`, `CTABand`

**Chrome** — `Header` (client, scroll state), `NavOverlay` (client), `LocaleSwitcher`, `Footer` (server)

**Shared logic** — `useVideoConcurrency` (module-level manager, max N decoders), `useInView`, `useReducedMotion`, `useIntentDelay`

### Rules

- Data shape is defined once in `types/content.ts` and every component consumes it. No prop-drilling of loose strings.
- No component takes a `variant` prop with more than three values — beyond that, it should be two components.
- No barrel `index.ts` re-export files. They defeat tree-shaking and slow the compiler.
- If a component is used once, it lives beside its route, not in `components/`.

---

## O. NEXT.JS ARCHITECTURE

**Next.js (latest stable) · App Router · React Server Components by default · TypeScript strict · Tailwind CSS**

### Rendering

Everything is **static** (`generateStaticParams` over locales, project slugs, pillar slugs). There is no user-specific content and no real-time data. Full SSG gives us CDN-edge HTML, which is most of the performance story before we optimise anything.

The only dynamic surface is the contact form's server action.

### Content layer — v1

Typed TS data modules, not MDX and not a CMS yet:

```
content/
  projects.ts     Project[]
  pillars.ts      Pillar[]
  team.ts         TeamMember[]
  clients.ts      Client[]
  bts.ts          BTSItem[]
  copy/en.ts  copy/ar.ts
```

Rationale: fully typed, zero runtime cost, tree-shakeable, trivially diffable in git, and it lets us build the entire site with realistic mock data immediately. **This is explicitly a v1 decision** — see §V risk 6, the client will want to add work themselves and this must migrate to a CMS in phase 2. Designing `Project` as a clean interface now makes that migration mechanical.

### Video hosting — do not serve MP4 from `/public`

Serving video files from `/public` on Vercel means paying full bandwidth rates for every byte, with no adaptive bitrate, no per-device rendition, and no analytics.

**Recommendation:**
- **Full films → Mux** (or Cloudflare Stream). Gives HLS adaptive streaming, automatic poster/thumbnail extraction at any timestamp, per-title encoding, and playback analytics. Mux's automatic frame extraction is what guarantees the poster→video seamlessness described in §G.
- **Preview loops → static assets on a CDN** (Vercel Blob or the same provider). At <600 KB each, adaptive streaming is overhead; a plain MP4 with a faststart atom is faster to first frame.

This is a genuine cost and quality decision that should be made before build, not after launch.

### Dependency policy

Justify every addition. Expected total:

| Dependency | Justification |
|---|---|
| `next`, `react`, `react-dom`, `typescript` | — |
| `tailwindcss` | Design-token enforcement, and logical-property utilities for RTL |
| `sharp` | Build-time image optimisation |
| *(conditional)* `next-intl` | Only if copy volume or formatting needs justify it — see §P |
| *(phase 2)* `@mux/mux-player-react` | Only for the full-film lightbox, dynamically imported |

**Not using:** Framer Motion, GSAP, Lenis/smooth-scroll, Swiper, a UI kit, a form library, a state manager.

---

## P. INTERNATIONALIZATION ARCHITECTURE (EN / AR)

### The URL decision — the highest-stakes call in the project

The brief says Arabic Reels is the strongest organic page and must not be damaged. The live canonical is `fraise.studio/en/`, which on a WordPress multilingual setup means **Arabic is served from the root** and English from `/en/`.

**Two options:**

| | Option A — preserve current shape | Option B — explicit `/ar` + `/en` |
|---|---|---|
| AR URLs | **unchanged** (`/reels/`) | all change (`/ar/reels/`) |
| EN URLs | unchanged (`/en/reels/`) | unchanged |
| hreflang | works fine | slightly cleaner |
| Implementation | middleware rewrite `/x` → `/ar/x`, public URL stays `/x` | trivial, out of the box |
| SEO risk | **near zero on the crown-jewel page** | 301s on every AR URL; typically weeks of ranking volatility |

**Recommendation: Option A.** Accept ~half a day of extra middleware and routing complexity to avoid changing a single URL on the highest-value pages in the estate. The "cleaner" URL structure is an engineering aesthetic; the ranking is revenue.

> **This recommendation is conditional on verifying that Arabic is in fact at root today.** That verification is question W1 and must be answered before implementation starts. If English turns out to be at root, the calculus inverts and Option B is correct.

Implementation shape under Option A:

```
app/[locale]/...        internal routing, locale ∈ {ar, en}
middleware.ts           rewrites  /reels        → /ar/reels   (URL unchanged)
                        passes    /en/reels     → /en/reels
```

### Locale mechanics

- `app/[locale]/layout.tsx` sets `<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>`. Both attributes, server-rendered, never set by client JS.
- `generateStaticParams` returns both locales — full SSG for both.
- **Both locales are built from the same route tree**, so structural drift between languages is impossible. Content equivalence is guaranteed by construction, which is what hreflang reciprocity requires.

### i18n library — probably none

**Recommendation: a hand-rolled typed dictionary for v1.**

```ts
// ~40 lines total
const dictionaries = { en: () => import('@/content/copy/en'),
                       ar: () => import('@/content/copy/ar') };
export const getDictionary = async (locale: Locale) =>
  (await dictionaries[locale]()).default;
```

With `as const` on the dictionaries, TypeScript catches a missing translation key at compile time — better DX than most i18n libraries provide.

**Adopt `next-intl` only if** we need per-locale plural rules, date/number formatting, or rich-text interpolation in translated strings. A marketing site whose most complex dynamic value is `2023` does not. Revisit if the client adds a blog or case-study CMS with formatted dates.

### RTL beyond direction

`dir="rtl"` is the easy 20%. The rest:

- **Logical properties everywhere** (§L), lint-enforced.
- **Mirror directional icons** — arrows, chevrons, the "next project" indicator — via `[dir="rtl"] .icon-directional { transform: scaleX(-1) }`.
- **Do not mirror:** media, logos, play buttons, the slate block, Latin brand names, numerals.
- The **language switcher must swap to the equivalent page**, never to the homepage. `/en/services/reels/` ↔ `/services/reels/`. Dropping the user on the homepage is the most common bilingual failure and it is a conversion killer.
- Arabic copy must be **written**, not translated. A machine-translated Arabic version of a premium studio site is immediately obvious to a Jordanian client and destroys the positioning. Budget for a copywriter (§W).

---

## Q. SEO ARCHITECTURE

### Baseline is weak, which is good news

No sitemap declared, no sitemap at `/sitemap.xml`, WordPress default robots rules. The estate ranks on ~52 URLs essentially without technical support. Correct fundamentals alone should produce measurable gain.

### Metadata

- `generateMetadata` per route, per locale. Unique title and description on every page, authored — never templated from a slug.
- Title pattern: `{Page} — Fraise Studio` / `{Page} — استوديو فريز`. Homepage gets a positioning title, not a keyword stuff.
- `metadataBase` set once; all canonicals absolute and self-referencing.
- `alternates.languages` on every route — Next emits reciprocal hreflang automatically. Include `x-default` → the English URL.
- OG image: **per-project, using the project's own poster frame**, generated at build via `next/og` with the slate baked in. A Fraise-branded still of the actual work shared into WhatsApp — the dominant sharing channel in Jordan — is worth considerably more than a generic OG card.

### The redirect map — the critical work

**Method (must happen before implementation):**

1. Export Search Console → Pages, **16-month window**, both locales. This is the authoritative list of URLs with earned equity.
2. Crawl the live site with Screaming Frog for the complete inventory including orphans.
3. Pull server access logs if available, for URLs with traffic but no impressions.
4. Union, dedupe, and map **every** URL to a target. No URL is left unmapped.

**The consolidation trap.** Nine granular services collapse to five pillars. Many of those are many-to-one redirects — and **a 301 to a page that does not discuss the old topic is treated by Google as a soft 404, passing little or no equity.**

Therefore the consolidation only works if the pillar pages *absorb the content*. This is exactly what the "capability tags" block in §E is for: each retired granular service becomes a named, crawlable section or tag on its pillar page, so the query still has a legitimate target. **The redirect map and the pillar page content must be designed together**, not sequenced.

**Reels is priority zero.** Every reels-related legacy URL 301s to the Arabic Reels pillar. That page ships in phase 1 with content that is equal or richer than today's. Do not change its URL, do not reduce its copy, do not launch it in the same release as any other AR structural change.

### Structured data (JSON-LD)

| Type | Where | Why |
|---|---|---|
| `Organization` + `LocalBusiness` | Root layout | Amman address, `sameAs` Instagram/LinkedIn, logo. Feeds the knowledge panel. |
| `WebSite` | Root layout | |
| **`VideoObject`** | **Every project and BTS item** | The biggest opportunity here. Requires `name`, `description`, `thumbnailUrl`, `uploadDate`, `duration`, `contentUrl`/`embedUrl`. Unlocks video rich results and Google Video indexing — a video-first studio should be competing there and currently isn't. |
| `BreadcrumbList` | Work, service, project pages | |
| `Person` | Team page, per member | Supports the studio-not-freelancer signal in the SERP too. |
| `Service` | Each pillar page | |

### Sitemaps & robots

- `app/sitemap.ts` — both locales, `alternates.languages` per entry (natively supported), sensible `priority` weighting toward pillar pages and top projects.
- Consider a **video sitemap** extension for the project inventory. Few regional competitors will have one.
- `app/robots.ts` — allow all, declare the sitemap (which the current site fails to do).
- `noindex` on `/work` filter parameter URLs; canonical to `/work`.

---

## R. PERFORMANCE STRATEGY

### The LCP strategy — the poster is the LCP element, never the video

This is the whole trick to a video hero with good Core Web Vitals:

1. Hero **poster** ships as `next/image` with `priority` and `fetchPriority="high"`, AVIF with WebP fallback, correctly sized per breakpoint. It paints as the LCP element.
2. Hero `<video>` renders with `preload="none"` and **no `src` attribute**.
3. After the load event / on `requestIdleCallback`, attach `src` and `play()`.
4. Crossfade video over the poster in 240ms.

LCP therefore never waits on a video byte. The user sees a full-bleed cinematic frame immediately, and it starts moving a beat later — which, incidentally, reads as *more* premium than a video that stutters into existence.

### Budgets (enforced in CI)

| Metric | Target |
|---|---|
| LCP (mobile, 4G throttled) | **< 2.0s** |
| CLS | **< 0.05** |
| INP | **< 200ms** |
| JS transferred, homepage | **< 120 KB gzip** |
| Total transferred, homepage, before hover | **< 1.2 MB** |

### Tactics

**CLS → zero by construction.** Every media element declares `aspect-ratio` from the ratio tokens (§I). This is why the taxonomy doubles as the layout-stability strategy.

**Fonts.** Self-hosted via `next/font`. Subset aggressively — Arabic fonts are large, and subsetting to the Arabic block plus Latin plus punctuation cuts them substantially. Preload only the two faces used above the fold. Use `size-adjust`/`ascent-override` fallback metrics so the swap does not shift layout. `font-display: swap` for Latin; for Arabic, verify the fallback metric match carefully — a badly matched Arabic fallback causes visible reflow.

**Images.** `next/image` throughout, AVIF primary. Explicit `sizes` on every instance — a missing `sizes` on a full-bleed image is the most common cause of a 3× oversized download.

**JS.** Server Components by default. `Lightbox` and the Mux player are `next/dynamic` with no SSR — they must not exist in the initial bundle. Client components are leaves, never layout.

**Video.** Concurrency cap (§G). `preload="none"` universally. Detach `src` when a card leaves the viewport. Respect `saveData` and `effectiveType`.

**Third parties.** Analytics only, loaded with `next/script` `strategy="lazyOnload"`. No chat widget, no heatmap tool, no tag manager — each of those alone can cost more than our entire JS budget.

### CI gate

Lighthouse CI on every PR against the budgets above. A PR that regresses LCP or the JS budget fails. On a video-heavy site, performance decays silently unless it is gated.

---

## S. ACCESSIBILITY STRATEGY

Target **WCAG 2.2 AA**.

**Semantics.** One `<h1>` per page. `<header>`, `<nav>`, `<main>`, `<footer>` landmarks. Work grid is a `<ul>`; each card is an `<li>` containing one link that wraps the whole card. Skip-to-content link, first in tab order, visible on focus.

**Focus.** `:focus-visible` ring in `--fraise` with a 2px offset. It must be visible over both the near-black ground *and* over video content — the offset provides shape contrast where colour contrast alone might fail against a bright frame.

**Keyboard parity for previews.** Hover preview fires on `:focus-visible` too (§G). Non-negotiable.

**Video.**
- Preview loops: `aria-hidden="true"`, decorative, no controls. The link carries the name.
- Full films in the lightbox: native controls, keyboard-operable, focus trapped, `Esc` to close, focus returned to the trigger on close.
- **Captions.** WCAG 1.2.2 requires captions for prerecorded audio content. Fraise's TVCs will have Arabic voiceover and music. Full films need caption tracks — Arabic and English. **This is a content deliverable with a real cost and must be raised with the client now, not discovered at launch** (§W).

**Reduced motion.** Handled in CSS *and* JS (§M). Under `prefers-reduced-motion`, all autoplay is off and every card exposes an explicit play control.

**Contrast.** Verified in §K. Slate text over video is protected by the gradient scrim; the scrim opacity is validated against the brightest frame of each preview, not assumed.

**RTL correctness is an accessibility issue,** not just a visual one. Enforce with `eslint-plugin-tailwindcss` plus a custom rule banning physical-direction utilities (`pl-`, `pr-`, `ml-`, `mr-`, `left-`, `right-`, `text-left`, `text-right`) outside an explicit allowlist.

**Testing.** `eslint-plugin-jsx-a11y` in CI, axe-core on key routes, and one full manual keyboard pass per route in **both** directions before launch.

---

## T. RECOMMENDED PROJECT FOLDER STRUCTURE

```
fraise-studio/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx                 <html lang dir>, fonts, JSON-LD
│   │   ├── page.tsx                   home
│   │   ├── work/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx        project detail
│   │   ├── services/[pillar]/page.tsx five pillars, one template
│   │   ├── studio/page.tsx            about / the studio
│   │   ├── team/page.tsx
│   │   ├── behind-the-scenes/page.tsx
│   │   ├── case-studies/[slug]/page.tsx
│   │   └── contact/page.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── opengraph-image.tsx
│   └── globals.css
│
├── components/
│   ├── primitives/    Container Rule Slate SectionNumber Eyebrow LinkArrow
│   ├── media/         Poster HoverPreview InViewVideo HeroReel Lightbox
│   ├── work/          WorkCard WorkGrid FilterRail
│   ├── sections/      ClientWall PillarGrid ProcessStrip StudioTeaser CTABand
│   └── chrome/        Header NavOverlay LocaleSwitcher Footer
│
├── content/
│   ├── projects.ts  pillars.ts  team.ts  clients.ts  bts.ts
│   └── copy/  en.ts  ar.ts
│
├── lib/
│   ├── i18n.ts            getDictionary, locales, dir()
│   ├── video-manager.ts   global concurrency cap
│   ├── seo.ts             metadata + JSON-LD builders
│   └── hooks/             useInView useReducedMotion useIntentDelay
│
├── types/content.ts
├── middleware.ts          locale rewrite (§P)
├── next.config.ts         301 redirect map lives here
└── tailwind.config.ts     design tokens (§I)
```

The redirect map lives in `next.config.ts` as a typed array imported from `content/redirects.ts` — reviewable in a PR, diffable, and testable.

---

## U. DEVELOPMENT PHASES

| Phase | Scope | Gate to exit |
|---|---|---|
| **0 — Discovery** *(before any code)* | Asset audit. GSC 16-month export. Screaming Frog crawl. Verify AR/EN URL structure. Confirm nine→five service mapping. Font licensing decision. Video host decision. | Redirect map drafted; asset count confirmed sufficient (§V risk 2) |
| **1 — Foundation** | Repo, tokens, fonts (both scripts), `[locale]` routing, middleware, RTL harness, `Container`/`Rule`/`Slate` primitives, Lighthouse CI | A blank page renders correctly in AR-RTL and EN-LTR with correct `lang`/`dir` and both fonts |
| **2 — Media system** | `Poster`, `HoverPreview`, `InViewVideo`, `HeroReel`, concurrency manager, reduced-motion + saveData paths | A 12-card grid holds LCP < 2.0s and never exceeds 2 decoders |
| **3 — Homepage** | All seven sections, real assets, both locales | **Art-direction review (§critical review). Go/no-go on the direction.** |
| **4 — Work & project detail** | Grid cadence, filters, load-more, project pages, lightbox | |
| **5 — Service pillars & studio** | Five pillars from one template, team, BTS, case studies, contact + server action | |
| **6 — SEO & migration** | Metadata, JSON-LD, sitemaps, robots, **full redirect map**, OG images, staging crawl validation | Screaming Frog on staging: zero 404s from the legacy URL list, zero redirect chains |
| **7 — Launch** | Deploy, GSC resubmission, redirect monitoring | Daily GSC coverage checks for 14 days, weekly for 8 weeks, **with the Arabic Reels page tracked individually** |

Phase 3 is the real decision point. If the homepage does not look like a production studio with real assets in place, we change direction there — not at phase 6.

---

## V. RISKS AND POTENTIAL PROBLEMS

Ranked by expected damage.

**1 — Arabic URL migration damages the Reels page.**
The single highest-stakes item. *Mitigation:* preserve AR at root (§P Option A); 1:1 redirect mapping; do not change that page's content, title, or URL in the launch release; monitor it individually in GSC daily for two weeks.

**2 — Insufficient high-quality footage. `[MOST LIKELY TO ACTUALLY BITE]`**
This entire direction — full-bleed frames, big video, editorial cadence — depends on having enough excellent assets. Eight nameable clients and five BTS films is a *thin* inventory for a grid built on 2.39:1 full-bleed rows. If there are only 12–15 genuinely premium pieces, a big-video grid will look **emptier and weaker** than the current small-thumbnail grid. *Mitigation:* asset audit is the first task in phase 0. If the count is low, we **reduce the number of grid rows and increase the size of each** rather than padding, and lean harder on BTS and process content to carry the page. Better to show eight pieces beautifully than twenty at three quality tiers.

**3 — Video bandwidth cost.**
Serving MP4 from `/public` on Vercel at studio-site traffic can produce a surprising invoice. *Mitigation:* Mux/Cloudflare Stream decision made in phase 0 (§O), not after launch.

**4 — Many-to-one redirects become soft 404s.**
Nine services → five pillars. *Mitigation:* pillar pages must absorb the retired services' content as capability sections (§E, §Q). Redirect map and pillar copy designed together.

**5 — The team roster undermines the studio positioning. `[CONTENT, NOT CODE]`**
Three of six members share the surname Aqraa, and one is listed as an *e-commerce consultant and entrepreneur*. On a page whose explicit job is to prove "this is a production company, not one person with a camera," a non-production business role on the crew list works directly against the goal, and a visibly family-weighted roster reads as a small family business rather than a studio. This is an honest observation, not a criticism of the people. *Mitigation options, in order of preference:* (a) restructure the page around **production roles and departments** — Direction, Cinematography, Food Styling, Post — with people listed under capabilities, so the roster reads as a crew structure; (b) move the commercial/consulting role to a separate "Studio / Leadership" block rather than the crew roster; (c) add freelance collaborators regularly worked with, credited as such. **This needs a client conversation and it is more important to the "studio vs freelancer" objective than any design decision in this document.**

**6 — No CMS in v1.**
The client will want to add work without a developer. *Mitigation:* be explicit that v1 is developer-updated; design `Project` as a clean interface; scope a CMS (Sanity or Payload) as phase 8. Do not let this quietly become an unmanaged expectation.

**7 — Arabic copy quality.**
Translated-sounding Arabic destroys premium positioning with the primary audience faster than any design flaw. *Mitigation:* budget an Arabic copywriter; Arabic is authored, not translated (§P).

**8 — Mobile data cost in the local market.**
A video-first site is expensive to browse on mobile data. *Mitigation:* one decoder maximum, `saveData` honoured, `<600 KB` preview budget, posters-only on 2G.

**9 — Arabic font licensing.**
Good Arabic type is genuinely expensive and web licences are often traffic-tiered. *Mitigation:* decide in phase 0; IBM Plex Sans Arabic is a credible zero-cost fallback that will not embarrass the design.

**10 — Client requests that erode the direction.**
"Can we add a gradient here?" "Can the button be red?" "Can we add a testimonial slider?" *Mitigation:* §K's forbidden-uses list and §M's motion principles exist to be cited in review. Written constraints are easier to defend than taste.

---

## W. QUESTIONS THAT MUST BE RESOLVED BEFORE IMPLEMENTATION

**Blocking — cannot start without these**

- **W1.** Is Arabic served from the root today (`fraise.studio/` = AR, `fraise.studio/en/` = EN)? This determines the entire URL strategy (§P). *Answerable in five minutes with GSC or by loading the root URL.*
- **W2.** **Asset audit:** exactly how many finished pieces exist at premium quality, broken down by pillar? How many have BTS coverage? How many have client permission to publish? This determines whether the grid design is viable as specified (§V risk 2).
- **W3.** GSC export (Pages, 16 months, both locales) + a full crawl of the live site. Without these the redirect map is guesswork.
- **W4.** What are the **nine** current granular services, verbatim, with their URLs? The nine→five mapping cannot be drafted without them.

**High priority — needed before phase 2**

- **W5.** Budget for video hosting (Mux/Cloudflare Stream) — or is static hosting mandated?
- **W6.** Budget for Arabic display type (~$300–800), or do we use IBM Plex Sans Arabic?
- **W7.** Do source masters exist for re-encoding, or only web-compressed exports? Re-encoding from an already-compressed file will look noticeably worse full-bleed.
- **W8.** Which clients may be **named** publicly, and which logos may be used? KFC in particular will have brand-usage terms.

**Needed before launch**

- **W9.** Who writes the Arabic copy? Is there budget for a native copywriter?
- **W10.** Do full films have caption tracks, or is captioning in scope (§S)? Real cost, WCAG requirement.
- **W11.** Is there professional photography of the **crew on set**? The studio-not-freelancer argument is carried more by one great on-set crew photograph than by any layout decision. If it doesn't exist, commission it.
- **W12.** Case studies — do written narratives exist, or is that a content deliverable?
- **W13.** Contact form destination: email, CRM, WhatsApp handoff? Given `+962 7 9372 4731` is already a primary channel, should the form offer a WhatsApp deep-link as the primary action on mobile? *(I'd recommend yes — it matches how business actually gets done in this market.)*
- **W14.** Confirm the studio's "hard numbers" for the credibility block: years active, productions delivered, brands served, awards.

**Design decisions I need a call on**

- **W15.** Client wall as **type** (recommended) or logos? (§D)
- **W16.** Hero: a cut showreel, or a single sustained hero shot? A sustained shot is more confident and more cinematic; a cut reel shows more range. *I lean sustained shot for the hero, with the cut reel available in the lightbox.*
- **W17.** Does an `#awards` section survive into the new IA, or does it merge into Studio?

---

## X. RECOMMENDED MVP SCOPE FOR THE DESIGN TEST

The goal of the test is to prove the **direction**, not the site. Three routes, executed immaculately, beat eight routes at 70%.

### Build exactly this

| # | Route | Why this one |
|---|---|---|
| 1 | **Homepage** | Carries the direction. Hero, positioning line, Selected Work in the editorial cadence, client wall, five pillars, studio teaser, CTA. |
| 2 | **Work** | Proves the grid cadence, the filter rail, load-more, and the hover model at density. This is the route that answers every complaint in the brief. |
| 3 | **Reels pillar page** | Highest-value SEO page, most distinctive layout (9:16 wall), and it proves the pillar template. |

Plus one **project detail** page only if time allows — it is the least risky to defer.

### Build it in Arabic RTL as the primary demo

This is the recommendation I'd defend hardest, and it is deliberately contrarian.

1. Arabic is the **strongest organic market** — the demo should be in the language of the audience that actually converts.
2. It **proves the hardest technical requirement** on day one. Anyone can demo an English studio site; a genuinely well-set RTL cinematic site with correct Arabic typography, mirrored chrome, and unmirrored media is a much stronger competence signal.
3. **Every competing pitch will demo in English.** Demoing in Arabic, with English one click away, says "we understood the actual brief."

Ship both locales — but present Arabic first.

### Must be real, not placeholder

- **Real footage** from the actual client roster. Lorem-ipsum video kills this entire direction; the design's whole thesis is that the work is the hero. If the work is stock, there is nothing to evaluate.
- **Real client names.**
- **Real hover behaviour**, with the concurrency cap and intent delay working.
- **Deployed to Vercel** with a real Lighthouse score visible.

### Explicitly out of scope for the test

Team, BTS, case studies, contact form backend, CMS, the full redirect map, and the other four pillar pages. Note them as scoped-and-costed rather than silently omitted.

### The bar to judge it against

Open the deployed URL cold on a phone and ask: **within three seconds and zero reading, is it obvious that this is a production company that shoots food?** If the answer needs a caption, the direction has failed and we change it at phase 3, not at launch.

---

## CRITICAL REVIEW CHECKPOINTS

To be applied at the end of phases 3, 4, and 5. Answered honestly, in writing.

1. Does this look like a premium production studio, or a portfolio template with good photos?
2. Would this survive next to `thegoldminefilms.com` on the same screen?
3. Is there any element on the page whose only justification is "sites like this have one"?
4. Is the interface asserting colour it hasn't earned?
5. Is the largest typographic element competing with the work?
6. Is the whitespace scheduled, or sprinkled?
7. Are the videos actually big, or just bigger than before?
8. Is the project label legible at rest, on the brightest frame in the loop?
9. Does the Arabic version look designed, or translated?
10. Does the motion say cinema, or does it say website?

If any answer is weak, name it and change it. Do not defend it.

---

*End of pre-development analysis. No implementation until explicitly approved.*

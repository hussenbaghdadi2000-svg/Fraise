---
name: fraise-frontend
description: Build and verify UI for Fraise Studio — the Next.js 16 / Tailwind v4 / RTL-Arabic site in this repo. Use for ANY change to app/, components/ or app/globals.css: new sections, layout or spacing edits, type-token work, Arabic/RTL typography, motion, media ratios, or "does this look right". Also use when asked to screenshot the site, check the JS budget, hunt a layout bug, or confirm a UI change actually works. Triggers: "homepage", "section", "layout", "spacing", "type", "font size", "RTL", "Arabic", "screenshot", "looks broken", "overflow", "budget", "kB", ".tsx" or "globals.css" in context.
---

# Fraise Studio — frontend

`CLAUDE.md` holds the design and engineering law; `docs/02-handoff.md` holds the
reasoning behind it. This skill is the **verification loop** — how you find out
whether the change you just made is real.

The rule that generated everything below: **five UI bugs so far were invisible
in the JSX and visible in a screenshot**, and one was invisible in a screenshot
and visible only in computed style. Reading the diff is not verification.

## The loop

```bash
S=.claude/skills/fraise-frontend/scripts

npm run build                                  # never claim it works without this
node $S/fresh.mjs http://localhost:3100 --kill # kill whatever still holds the port
npx next start -p 3100 &                       # then serve THIS build
node $S/fresh.mjs                              # assert the server is serving it

node $S/budget.mjs ar                          # JS budget, the one correct way
node $S/audit.mjs                              # overflow, every sitemap route x 390/1440
node $S/measure.mjs http://localhost:3100/     # computed type per token role
node $S/light.mjs  http://localhost:3100/      # no light grounds
node $S/shot.mjs   http://localhost:3100/ shots/home 1440 900 4
node $S/shot.mjs   http://localhost:3100/ shots/home-390 390 844 4
```

Then **open the PNGs**. A script that exits 0 has only proved the page did not
break a rule it knows how to check.

## The scripts

| script | answers |
|---|---|
| `fresh.mjs [origin] [--kill]` | is the server serving the build I just made? |
| `budget.mjs [page=ar] [kB=120]` | brotli JS weight, `noModule` correctly excluded |
| `audit.mjs [origin] [routes\|sitemap] [widths]` | does anything overflow horizontally? |
| `measure.mjs <url> [width]` | what size did the browser actually resolve, per role? |
| `light.mjs <url> [width] [threshold]` | is the room still black? |
| `squeeze.mjs <url> [widths]` | did any text get crushed to ~1 char per line? |
| `shot.mjs <url> <prefix> [w] [h] [frames]` | what does it look like, scrolled? |
| `cdp.mjs` | shared Chrome/DevTools driver — the others import it |

Zero dependencies; Node 24 and Chrome only. Set `CHROME_PATH` if Chrome is not
in the default Windows location. Every script exits non-zero on a violation, so
they chain with `&&`.

## Five traps, all of which have already cost a session

1. **Stale server.** A `next start` from an earlier session keeps the port; the
   new one dies with `EADDRINUSE` in a backgrounded shell and you photograph a
   *dead build* — the page comes back completely unstyled and reads as a
   migration failure. `pkill` does not kill it on Windows. Run `fresh.mjs`
   before believing any measurement.
2. **`noModule`.** The legacy polyfill chunk is ~112 kB and no modern browser
   fetches it. Counting it reports ~145 kB and looks like a blown budget when
   nothing is wrong. `budget.mjs` excludes it and prints what it skipped.
3. **`--screenshot` lies.** Chrome's flag uses `captureBeyondViewport`, which
   renders at scroll 0, so every `animation-timeline: view()` reveal is still at
   opacity 0 and the page looks blank. `shot.mjs` drives CDP and scrolls for
   real.
4. **Specificity beats intent.** `.u-display:lang(ar) { font-size }` is (0,2,0)
   and outranks every Tailwind size utility (0,1,0) — it *replaced* the size
   rather than adjusting it, and every Arabic display heading rendered at
   14.6px for months while the JSX still read `text-display`. Never set
   `font-size` in a rule with more than one class-level selector; scale
   `--optical` instead. `measure.mjs` is the sentinel.
5. **Overflow is only half the failure.** `audit.mjs` sees a box that
   escapes the viewport. It cannot see the opposite: a flex item with
   `min-w-0` shrinking to **one character per line** instead of pushing
   past the edge. That shipped once — the homepage capability rows at
   320px, in Arabic, where breaking mid-word shatters a connected script
   into isolated letterforms — and the overflow sweep reported `ok` the
   whole time. Run `squeeze.mjs` beside `audit.mjs`, and never reach for
   `overflow-wrap: anywhere` to make a row fit; stack the row instead.
6. **Git Bash rewrites arguments starting with `/`** into Windows paths, so
   `node audit.mjs ... "/,/our-work/"` navigates to `C:/Program Files/...`.
   Prefix `MSYS_NO_PATHCONV=1`, or use sitemap mode (the default), which reads
   the route set from `/sitemap.xml` — `<loc>` plus the hreflang alternates, so
   all 22 URLs in both locales — and cannot drift from `lib/routes.ts`.

## What "verified" means here

Before saying a UI change works, all of these:

- `npm run build` clean, and the page served is that build (`fresh.mjs`).
- **Screenshotted at 390px AND 1440px.** Mobile is where this site breaks —
  the header once collided with itself and nobody had looked.
- **Both locales.** `/` is Arabic RTL, `/en/` is English LTR. A layout that
  only works in one direction is half-built. Bare `audit.mjs` sweeps all 22
  URLs and prints `lang/dir` per route, so an `ar/rtl` where you expected
  `en/ltr` shows up immediately.
- `budget.mjs` still under budget — it is currently **within 1 kB of the
  ceiling**, so any client-side addition needs the number, not an estimate.
- `measure.mjs` shows every role at a distinct ascending size and no Arabic run
  carrying `letter-spacing` or `text-transform: uppercase`.

## Reading the output

- **`light.mjs` on `/` currently reports 12 white tiles** —
  `components/sections/ClientRail.tsx` sets `bg-white` on the logo plates so
  client marks read. That is a standing exception to "no light grounds", not a
  fresh regression; confirm with the developer before touching it. Anything
  *else* bright is a bug.
- **`audit.mjs` only flags an element if every ancestor lets it reach the edge.**
  Children of a rail (`overflow-x:auto`) or a clipped hero are contained by
  design — in RTL a rail's off-screen items sit at negative `left`, which would
  otherwise flood the report.
- **`measure.mjs` prints root font-size.** Under `:lang(ar)` it should be 17px,
  the +6.25% optical bump. If it reads 16px on an Arabic page, the bump is not
  applying and every token is 6% small.

## Working style

The developer is new to Next.js and learning deliberately: small steps, one
concept at a time, something visible on screen at the end of each. Explain the
*why* briefly before the code, and flag what is core Next.js worth learning
versus a project-specific choice. Answer in Arabic or English, whichever they
used.

Next 16 has real breaking changes against older training data — read
`node_modules/next/dist/docs/` before implementing a framework feature rather
than recalling it.

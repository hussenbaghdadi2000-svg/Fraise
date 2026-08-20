import type { Pillar } from "@/types/content";

/**
 * ⚠️ COLUMN COUNT IS A FUNCTION OF THE RATIO, not a fixed grid.
 *
 * Three columns inside the 68rem measure puts a card at 341px. That is
 * right for the wide formats — a 2.39:1 lands at 143px tall and a 16:9
 * at 192px. It is wrong for the tall ones: a 9:16 at 341px wide is
 * **606px tall**, one card filling most of a laptop screen. Four
 * columns drops it to 248px wide and 441px tall.
 *
 * This lives here rather than in a page because BOTH the work index and
 * the five service pages lay out the same cards, and a card that is
 * three-up on one and four-up on the other for the same format is the
 * kind of drift the token work exists to stop.
 */
export const GRID_COLUMNS: Record<Pillar, string> = {
  tvc: "sm:grid-cols-3",
  recipes: "sm:grid-cols-3",
  menu: "sm:grid-cols-3",
  /* ⚠️ THREE at tablet, not two. At 768 a two-column 9:16 card is
     320px wide and **568px tall** — one card taller than half the
     screen, which is the same mistake the desktop grid avoids by
     giving tall formats four columns. Three brings it to 370px. */
  stills: "sm:grid-cols-3 lg:grid-cols-4",
  reels: "sm:grid-cols-3 lg:grid-cols-4",
};

/** How many cards fill one row at the widest breakpoint. */
export const GRID_COLS: Record<Pillar, number> = {
  tvc: 3,
  recipes: 3,
  menu: 3,
  stills: 4,
  reels: 4,
};

/** Must track GRID_COLUMNS, or the browser fetches the wrong encode. */
export const GRID_SIZES: Record<Pillar, string> = {
  tvc: "(min-width: 640px) 24vw, 92vw",
  recipes: "(min-width: 640px) 24vw, 92vw",
  menu: "(min-width: 640px) 24vw, 92vw",
  stills: "(min-width: 1024px) 18vw, (min-width: 640px) 24vw, 92vw",
  reels: "(min-width: 1024px) 18vw, (min-width: 640px) 24vw, 92vw",
};

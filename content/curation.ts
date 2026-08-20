import type { Pillar } from "@/types/content";

/**
 * THE ART DIRECTION, AS IDS AND NOTHING ELSE.
 *
 * Which piece opens the site, which six carry the homepage, which shape
 * each row of Selected Work takes — these are decisions with reasons,
 * and they stay in code where the reasons can sit beside them. The
 * dashboard edits the CATALOGUE; it does not edit the edit.
 *
 * WHY THE IDS LIVE HERE AND NOT IN content/projects.ts.
 *
 * That module resolves each id to a real Project and THROWS if one is
 * missing — which is the correct behaviour for a build, and exactly the
 * wrong behaviour for the page whose job is to report that a curated
 * piece has gone missing. /studio/ importing content/projects.ts would
 * mean deleting the hero crashed the very screen that was about to warn
 * you not to.
 *
 * Strings cannot throw. So the ids sit here, content/projects.ts turns
 * them into projects, and lib/studio/health.ts checks them against what
 * is actually on disk.
 */

/**
 * The hero. A cut from the studio's own 2023 showreel — flames under a
 * grill, which is the direction's argument in one shot: the interface
 * has no colour, and every bit of colour on screen is the food burning.
 */
export const HERO_ID = "reel-hero";

/**
 * The homepage showcase — two rows of THREE.
 *
 * ⚠️ EVERY PIECE IN A ROW SHARES THE ROW'S PILLAR, therefore its ratio.
 * That is not a preference: a 4:5 stills frame beside a 16:9 recipe
 * frame is 2.2× taller, and no alignment closes the hole — top-aligned
 * leaves the gap below, bottom-aligned leaves it above. Pairing by
 * pillar makes each row square up while the ROWS still differ, so the
 * ratio taxonomy is still being taught.
 */
export const SHOWCASE_IDS: { pillar: Pillar; ids: [string, string, string] }[] = [
  { pillar: "tvc", ids: ["alsayad-tvc", "sunwhite-tvc", "nabil-tvc"] },
  { pillar: "recipes", ids: ["knorr-recipes", "durra-recipes", "watanyeh-rec"] },
];

/**
 * The editorial cadence, as rows.
 *
 *   A   one full-bleed 2.39:1
 *   B   two 16:9
 *   C   one large + one 9:16, whitespace inline-end
 *   D   three 4:5 stills
 *
 * Row D runs on /our-work/, where there is enough density to earn it.
 * The arity of each row is enforced by the `WorkRow` union in
 * types/content.ts once these ids are resolved.
 */
export const SELECTED_WORK_IDS: { row: "A" | "B" | "C" | "D"; ids: string[] }[] = [
  { row: "A", ids: ["alsayad-tvc"] },
  { row: "B", ids: ["reel-recipes", "durra-recipes"] },
  { row: "C", ids: ["durra-stills", "reel-reels"] },
];

/**
 * The capability strip — one frame per pillar, ALL SIX cut from the
 * showreel so every frame on that row actually moves. It is the section
 * that teaches the taxonomy, and a moving frame teaches "we shoot this"
 * far faster than a still of it does.
 *
 * ⚠️ THESE ARE MEDIA STEMS, NOT PROJECT IDS. The page builds
 * `/media/{stem}.jpg` and `.mp4` directly — `reel-tvc` and `reel-menu`
 * are files in public/media with no row in projects.json, because a
 * two-second cut from a compilation reel is not a piece of work with a
 * client and a year. Health checks them as FILES, not as rows.
 */
export const PILLAR_MEDIA = {
  tvc: "reel-tvc",
  recipes: "reel-recipes",
  reels: "reel-reels",
  stills: "reel-stills",
  menu: "reel-menu",
} as const satisfies Record<Pillar, string>;

import { cache } from "react";
import {
  HERO_ID,
  PILLAR_MEDIA,
  SELECTED_WORK_IDS,
  SHOWCASE_IDS,
} from "@/content/curation";
import { getAwards, getClients, getProjects } from "@/lib/db/queries";
import type { ClientCard, Pillar, Project, WorkRow } from "@/types/content";

/**
 * ALL FRAISE STUDIO. NO STOCK.
 *
 * ⚠️ THE ROWS LIVE IN POSTGRES NOW, NOT IN THIS FILE AND NOT IN JSON.
 *
 * They moved to content/data/*.json so the studio dashboard could write
 * them, and then to the database so the studio could write them from
 * the DEPLOYED site rather than from a developer's laptop. The JSON is
 * still in the repo — it is the seed, the offline backup and the record
 * of what the site shipped with. `npm run db:seed` reloads it.
 *
 * ⚠️ EVERY EXPORT HERE IS ASYNC NOW. That is the real cost of the move,
 * and it is unavoidable: a module-scope `const` cannot await a query.
 * The pages were already async Server Components, so the change is one
 * `await` at each call site — but it IS a change at every call site,
 * which is why the names went from `PROJECTS` to `getProjects()` rather
 * than staying the same and lying about what they do.
 *
 * The parsers still run on every read (lib/db/queries.ts), so a bad row
 * is still caught in one place regardless of where it came from.
 *
 * Two sources, both the studio's own:
 *
 * ┌─ SHOWREEL ────────────────────────────────────────────────────────
 * │ `imgdata/2023-reel_without-logos-1.mp4` — 1920×1080, 51s, supplied
 * │ by the studio and, per its filename, free of burned-in graphics.
 * │ The hero and all five capability frames are cut from it, so those
 * │ carry REAL MOTION rather than a push generated from a still.
 * │
 * ├─ VIMEO FRAMES ────────────────────────────────────────────────────
 * │ Poster frames from the studio's own films at 2560px, with the real
 * │ titles, clients and years the API carries (docs/02-handoff.md §5.3).
 * │ These still have no motion of their own — the films are behind a
 * │ 403 from this machine — so their loops remain a slow camera push.
 * └───────────────────────────────────────────────────────────────────
 *
 * The showreel is a compilation across many clients, so its segments
 * are NOT attributed to one. They carry the studio's own name and the
 * year of the reel. Attributing a two-second cut to a specific brand
 * would be a guess printed as a fact.
 */
export { getProjects };

/**
 * ⚠️ THROWS, ON PURPOSE.
 *
 * The curation names pieces by id. Deleting a project without noticing
 * it was the homepage hero would otherwise render an empty section;
 * this makes it a loud failure instead. /studio/ runs the same check as
 * a warning BEFORE you delete, so this is the backstop rather than the
 * first line of defence.
 */
function pick(projects: Project[], id: string): Project {
  const project = projects.find((candidate) => candidate.id === id);
  if (!project) throw new Error(`Unknown project: ${id}`);
  return project;
}

/**
 * The HOMEPAGE showcase — two rows of THREE, contained.
 *
 * At the page's 68rem measure three-up lands each card at 341px, which
 * is where the studio's own reference runs them; two-up made them 562px
 * and the frames read as too big.
 *
 * The pillar rule that makes each row square up is documented on
 * SHOWCASE_IDS in content/curation.ts. The TUPLE is what enforces the
 * count here: a flat array would let the next edit drop a fourth card
 * in and the build would happily ship it.
 */
export const getShowcase = cache(
  async (): Promise<{ pillar: Pillar; projects: [Project, Project, Project] }[]> => {
    const projects = await getProjects();
    return SHOWCASE_IDS.map(({ pillar, ids }) => ({
      pillar,
      projects: [
        pick(projects, ids[0]),
        pick(projects, ids[1]),
        pick(projects, ids[2]),
      ],
    }));
  },
);

/**
 * Resolve one curated row, checking its arity as it goes.
 *
 * The `WorkRow` union encodes the editorial rules in the type system —
 * there is no row shape that holds four pieces. Ids arrive as a plain
 * `string[]`, which has no length in its type, so the count has to be
 * re-asserted here for the union to be constructible at all. That is
 * the point rather than a nuisance: an art-direction edit that puts two
 * pieces in a row A fails loudly instead of rendering a second
 * full-bleed frame nobody asked for.
 */
function workRow(
  projects: Project[],
  row: "A" | "B" | "C" | "D",
  ids: string[],
): WorkRow {
  const picked = ids.map((id) => pick(projects, id));
  const expected = { A: 1, B: 2, C: 2, D: 3 }[row];
  if (picked.length !== expected) {
    throw new Error(
      `Selected Work row ${row} takes ${expected} piece(s), got ${picked.length}`,
    );
  }
  switch (row) {
    case "A":
      return { row, projects: [picked[0]] };
    case "B":
      return { row, projects: [picked[0], picked[1]] };
    case "C":
      return { row, projects: [picked[0], picked[1]] };
    case "D":
      return { row, projects: [picked[0], picked[1], picked[2]] };
  }
}

export const getSelectedWork = cache(async (): Promise<WorkRow[]> => {
  const projects = await getProjects();
  return SELECTED_WORK_IDS.map(({ row, ids }) => workRow(projects, row, ids));
});

/**
 * The hero. It MOVES, which is the difference between a mockup and a
 * site. Which piece it is, and why, is on HERO_ID in content/curation.ts.
 */
export const getHero = cache(async (): Promise<Project> =>
  pick(await getProjects(), HERO_ID),
);

/**
 * The capability strip. Re-exported from content/curation.ts so the
 * pages that already import it from here keep working — the stems moved
 * next to the rest of the art direction, not away from it.
 */
export { PILLAR_MEDIA };

/**
 * Set in type, not as a greyscale logo grid.
 *
 * ⚠️ THE NAMES AND THE MARKS WERE TWO DIFFERENT SETS. Fourteen names
 * and twelve logo files overlapped on **four** — Almarai, Talabat,
 * Nabil, Sunwhite. Eight brands had a mark and no name; ten had a name
 * and no mark. Twenty-two clients, and neither list alone told the
 * truth. One table now, and everything else derives from it.
 *
 * ORDER IS THE RAIL'S ORDER, which is why the query sorts by `position`
 * and /studio/ gives this collection move-up and move-down rather than
 * sorting it by name.
 */
export const getClientCards = cache(async (): Promise<ClientCard[]> => getClients());

/**
 * The marks only — what the rail can actually show.
 *
 * The empty string rather than `undefined` is a consequence of the
 * column being NOT NULL DEFAULT '': "no mark" is a known state for ten
 * of the twenty-two, not missing information.
 */
export const getClientLogos = cache(async () =>
  (await getClients()).filter((client) => client.logo !== ""),
);

/** The full roster, as text. Derived, so the two can never drift. */
export const getClientNames = cache(async (): Promise<string[]> =>
  (await getClients()).map((client) => client.name),
);

/**
 * RECOVERED FROM THE LIVE SITE AND DELIBERATELY NOT YET PLACED.
 *
 * Silver Lion is a Cannes Lions award, Dubai Lynx its regional
 * equivalent, Gourmand the food-media award. The pre-development
 * analysis never mentioned any of them because they are stated nowhere
 * in the site's copy — they exist only as logo image files, which makes
 * them invisible to search engines and to anyone skimming.
 *
 * ⚠️ THE WINNING WORK AND YEAR BEHIND EACH ONE ARE STILL UNCONFIRMED,
 * which is why these are names and not a relation to projects yet.
 */
export const getAwardCards = cache(async () => getAwards());

/** The names alone — what the page and the JSON-LD both render. */
export const getAwardNames = cache(async (): Promise<string[]> =>
  (await getAwards()).map((award) => award.name),
);

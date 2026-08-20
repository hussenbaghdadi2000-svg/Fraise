import { getBtsFilms } from "@/lib/db/queries";
import type { BtsFilm, Locale } from "@/types/content";

/**
 * Behind the scenes.
 *
 * ⚠️ THE ROWS LIVE IN POSTGRES so /studio/ can edit them from the
 * deployed site. content/data/bts.json is the seed and the backup.
 * `BtsFilm` moved to types/content.ts for the same reason — the parser
 * has to know the shape, and this module imports the parser. It is
 * re-exported below, so `import type { BtsFilm } from "@/content/bts"`
 * still resolves exactly as before.
 *
 * Every entry LINKS OUT to the finished film. That is not a shortcut —
 * it is the honest architecture. The studio's films live on Vimeo and
 * YouTube; re-hosting them would mean encoding, storing and paying for
 * bandwidth on video that is already served, cached and playable
 * somewhere else. The site's job is to make them findable and to say
 * what they are.
 *
 * So each card is a poster frame plus a play affordance, and the click
 * goes where the film is. `target="_blank"` with `rel="noopener"`,
 * because leaving the site to watch and coming back is the behaviour
 * people expect from a showreel.
 *
 * ⚠️ THE POSTER IS DERIVED, NOT STORED. components/work/BtsCard.tsx
 * builds it as `/media/{id}.jpg`. The dashboard uploads straight to
 * that path rather than keeping a second copy of a string the code
 * already knows how to construct — so renaming the id and forgetting
 * the poster is not a state this data can reach.
 *
 * Titles, years and IDs are the studio's own, from its Vimeo API
 * listing and the YouTube oEmbed. Nothing here is invented.
 */
export type { BtsFilm };

export { getBtsFilms };

/** The section line, from the studio's own preview. */
export const BTS_LINE: Record<Locale, string> = {
  ar: "كل لقطة عظيمة تبدأ بما لا يراه الجمهور.",
  en: "Every great shot begins with what the audience never sees.",
};

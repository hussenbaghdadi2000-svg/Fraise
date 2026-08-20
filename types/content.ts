/**
 * Domain models for Fraise Studio.
 *
 * Everything the UI renders is typed from here. No loose strings are
 * passed between components — if a value has a fixed set of options,
 * it gets a union type so a typo becomes a build error.
 */

export type Locale = "ar" | "en";

export const LOCALES = ["ar", "en"] as const satisfies readonly Locale[];

/** Arabic is the primary market, so it is the default locale. */
export const DEFAULT_LOCALE: Locale = "ar";

/** The five service pillars. Replaces the old nine-service navigation. */
export type Pillar = "tvc" | "recipes" | "reels" | "stills" | "menu";

/**
 * Aspect ratio doubles as the service taxonomy: a visitor learns which
 * pillar a piece belongs to from the shape of its frame, without
 * reading a label. It is also the CLS strategy — every media box
 * declares its ratio up front, so nothing reflows when media loads.
 */
export type Ratio = "2.39:1" | "16:9" | "9:16" | "4:5" | "1:1";

export const PILLAR_RATIO: Record<Pillar, Ratio> = {
  tvc: "2.39:1",
  recipes: "16:9",
  reels: "9:16",
  stills: "4:5",
  menu: "1:1",
};

/**
 * The pillar list, DERIVED from the ratio map rather than written
 * out again. A hand-written array is a second place to forget a
 * pillar; this one cannot fall out of step with the taxonomy.
 *
 * It exists because the content is JSON now: a validator has to
 * check `pillar` against the real set at runtime, and the studio
 * form needs the same set to build its select.
 */
export const PILLARS = Object.keys(PILLAR_RATIO) as Pillar[];

/** Slate labels. Latin in BOTH locales — a slate is production notation. */
export const PILLAR_KIND: Record<Pillar, string> = {
  tvc: "TVC",
  recipes: "Recipes",
  reels: "Reels",
  stills: "Stills",
  menu: "Menu",
};

/**
 * Tailwind scans your source as plain text, so a class name can never
 * be assembled at runtime — `aspect-[${ratio}]` compiles to nothing.
 * This static map is the bridge from data to utility class.
 */
export const RATIO_CLASS: Record<Ratio, string> = {
  "2.39:1": "aspect-tvc",
  "16:9": "aspect-recipe",
  "9:16": "aspect-reel",
  "4:5": "aspect-still",
  "1:1": "aspect-menu",
};

/**
 * The shape of a copy dictionary.
 *
 * Both locales must satisfy this interface, so a string that exists in
 * English and not in Arabic is a build error rather than a blank space
 * discovered in review. Arabic copy here is authored, not translated —
 * the English is not the source text, it is a sibling.
 */
export interface Copy {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  intro: string;
  sections: {
    colour: string;
    typography: string;
    arabic: string;
    ratio: string;
    state: string;
  };
  paletteNote: Record<
    "ink" | "ink-raised" | "bone" | "bone-dim" | "bone-faint" | "fraise",
    string
  >;
  displaySample: string;
  bodySample: string;
  arabicNote: string;
  ratioNote: string;
  hoverNote: string;
  stateNote: { before: string; key: string; after: string };
  focusLabel: string;

  /** Homepage — the seven sections. */
  home: {
    nav: {
      work: string;
      services: string;
      studio: string;
      contact: string;
      about: string;
      awards: string;
      menu: string;
      close: string;
    };
    /** The About dropdown — three anchors into /about-us/. */
    aboutMenu: { team: string; backstage: string; story: string };
    tagline: string;
    positioning: string;
    sections: {
      work: string;
      capabilities: string;
      clients: string;
      studio: string;
      awards: string;
    };
    pillar: Record<Pillar, string>;
    capabilitiesNote: string;
    clientsNote: string;
    /** Inline routes out of the page. The homepage used to dead-end in
        every section and offer its first action in the footer. */
    seeWork: string;
    viewAll: string;
    /** Latin in both locales, like every other production credit. */
    playFilm: string;
    moreStudio: string;
    awardsNote: string;
    studioBody: string;
    ctaLine: string;
    ctaAction: string;
    rights: string;
    skip: string;
    heroControls: { pause: string; play: string; sound: string; mute: string };
    clientsLabel: string;
  };

  /** The Contact page. */
  contact: {
    title: string;
    line: string;
    body: string;
    emailLabel: string;
    phoneLabel: string;
    whatsappLabel: string;
    addressLabel: string;
    city: string;
    directions: string;
    social: string;
  };

  /** The Work page. */
  work: {
    title: string;
    /** The meta description. Authored per locale, never translated. */
    description: string;
    intro: string;
    all: string;
    count: string;
    /** The project page. */
    clientLabel: string;
    serviceLabel: string;
    yearLabel: string;
    watchFilm: string;
    filmSoon: string;
    moreIn: string;
    backToWork: string;
    loadMore: string;
    empty: string;
  };
}

/** A single piece of work. `client` is Latin — it appears in the slate. */
export interface Project {
  id: string;
  /**
   * The public URL segment, under `/our-work/`.
   *
   * Separate from `id` on purpose: `id` is how the rest of the codebase
   * refers to a piece and must never change, while a slug is a promise
   * to the outside world that may need to change without breaking every
   * internal reference. One Latin slug for both locales — a project is
   * named after a client and a piece of work, and neither is translated.
   */
  slug: string;
  /**
   * Vimeo id for the finished film, where the studio has published one.
   *
   * ⚠️ EMPTY FOR ALL 29 PIECES TODAY. The BTS films carry real Vimeo
   * URLs (content/data/bts.json); the project films do not, and none
   * exist anywhere in this repo. The project page renders its watch
   * link only when this is set, so filling it in is the entire remaining
   * step for full-film playback. Inventing ids would ship dead links.
   */
  vimeoId?: string;
  client: string;
  title: Record<Locale, string>;
  pillar: Pillar;
  year: number;
  poster: string;
  preview: string;
}

/**
 * One row of the editorial cadence.
 *
 * The four row types repeat as a rhythm — a system, which is the actual
 * argument against "this looks AI-generated". Encoding them as a union
 * rather than a loop over a flat array makes the design rules
 * unbreakable at the type level: there is no row shape that holds four
 * pieces, and no row that holds more than two moving-image pieces,
 * because no such variant exists to construct.
 *
 *   A   one full-bleed 2.39:1
 *   B   two 16:9
 *   C   one large + one 9:16, whitespace inline-end (mandatory, not optional)
 *   D   three 4:5 stills
 */
export type WorkRow =
  | { row: "A"; projects: [Project] }
  | { row: "B"; projects: [Project, Project] }
  | { row: "C"; projects: [Project, Project] }
  | { row: "D"; projects: [Project, Project, Project] };

/* ============================================================
   THE REMAINING COLLECTIONS

   These interfaces used to live in the content module that
   exported the data — `BtsFilm` in content/bts.ts, `Member` in
   content/team.ts, and the client card as an inline literal
   type inside content/projects.ts.

   They moved here when the data moved to content/data/*.json,
   for one structural reason: lib/content-schema.ts has to
   validate them, and content/bts.ts has to call that validator.
   A type declared in content/bts.ts and imported by the
   validator that content/bts.ts imports is a cycle.

   The old modules still re-export each name, so nothing that
   imported `BtsFilm` from "@/content/bts" had to change. This
   is also just where CLAUDE.md says domain models live.
   ============================================================ */

/**
 * A client, and its mark if we have one.
 *
 * ⚠️ `id` is NEW, and it exists because identity used to be the
 * NAME — which is also the field most likely to be corrected
 * (`Four-Seasones` and `Thuraya-` are typos carried in from
 * filenames). Keying on the name means a spelling fix reads as
 * a delete plus an insert, and the row loses its place in the
 * rail. The slug is stable; the name is editable.
 *
 * ORDER IS MEANINGFUL. This array is the order the logo rail
 * shows the marks in, so the studio can move a row.
 */
export interface ClientCard {
  id: string;
  name: string;
  /** Empty string, not undefined — a JSON row has every key. */
  logo: string;
}

/**
 * An award. A one-field record rather than a bare string, so it
 * has a stable id to edit and reorder against.
 */
export interface Award {
  id: string;
  name: string;
}

/**
 * A behind-the-scenes film.
 *
 * ⚠️ THERE IS NO POSTER FIELD, and that is deliberate:
 * components/work/BtsCard.tsx derives it as `/media/{id}.jpg`.
 * The studio uploads to that derived path rather than storing a
 * second copy of a string the code already knows how to build.
 */
export interface BtsFilm {
  id: string;
  title: Record<Locale, string>;
  client: string;
  year: number;
  href: string;
}

/**
 * One of the crew.
 *
 * ⚠️ Same derived-asset rule as BtsFilm — the portrait is
 * `/media/team-{id}.jpg`, built by the team page, not stored.
 * `role` is Latin in both locales; it sits on a slate-like line.
 */
export interface Member {
  id: string;
  name: Record<Locale, string>;
  role: string;
  bio: Record<Locale, string>;
}

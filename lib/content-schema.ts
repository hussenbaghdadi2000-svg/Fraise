import {
  LOCALES,
  PILLARS,
  type Award,
  type BtsFilm,
  type ClientCard,
  type Locale,
  type Member,
  type Pillar,
  type Project,
} from "@/types/content";

/**
 * The bridge from JSON back to the type system.
 *
 * WHY THIS FILE EXISTS AT ALL.
 *
 * Content used to be TypeScript array literals, and that bought
 * something valuable for free: `pillar: "recipies"` was a compile error,
 * not a blank page discovered in review. Moving the data to
 * content/data/*.json so a dashboard can write it throws that away —
 * `resolveJsonModule` types every string in a JSON file as `string`, so
 * `pillar` widens to `string` and a typo sails straight through.
 *
 * These parsers put the guarantee back, one layer down. They run at
 * MODULE SCOPE in content/*.ts, which means they run during
 * `next build` — so a malformed row is still a failed build with a
 * message that names the file, the row and the field. The check moved
 * from the compiler to the bundler; it did not disappear.
 *
 * ⚠️ THE STUDIO WRITES THROUGH THESE SAME FUNCTIONS. That is the whole
 * safety story of the dashboard: lib/studio/actions.ts builds the next
 * version of a collection, runs the exact parser the build will run,
 * and only writes the file if it passes. There is no second, laxer
 * definition of "valid" that the form could satisfy and the build
 * could reject.
 */

/**
 * A content error, distinguishable from a programming error.
 *
 * The studio catches this to show the message in the form. Anything
 * that is NOT a ContentError is a bug in the dashboard and should keep
 * propagating to the error overlay rather than being rendered to the
 * user as "invalid input".
 */
export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}

function fail(where: string, message: string): never {
  throw new ContentError(where + " — " + message);
}

/* ---------- primitives -------------------------------------------- */

/** Lowercase kebab. Ids reach the URL bar and the filesystem. */
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * The same check, callable before a row exists.
 *
 * The studio needs this EARLY: an id is also the filename an upload
 * lands on, so it has to be known good before any bytes are written.
 * Discovering the id was malformed at parse time — after the upload —
 * would leave a stray file named after a typo.
 */
export function isValidId(value: string): boolean {
  return ID.test(value);
}

function rows(raw: unknown, where: string): Record<string, unknown>[] {
  if (!Array.isArray(raw)) fail(where, "expected a JSON array at the top level");
  return raw.map((row, i) => {
    if (typeof row !== "object" || row === null || Array.isArray(row)) {
      fail(where, "row " + i + " is not an object");
    }
    return row as Record<string, unknown>;
  });
}

function text(row: Record<string, unknown>, key: string, where: string): string {
  const value = row[key];
  if (typeof value !== "string") fail(where, key + " must be a string");
  const trimmed = value.trim();
  if (trimmed === "") fail(where, key + " is empty");
  return trimmed;
}

/** Present but allowed to be empty — an absent client logo, say. */
function optional(row: Record<string, unknown>, key: string, where: string): string {
  const value = row[key];
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") fail(where, key + " must be a string");
  return value.trim();
}

function id(row: Record<string, unknown>, where: string): string {
  const value = text(row, "id", where);
  if (!ID.test(value)) {
    fail(where, 'id must be lowercase kebab-case (got "' + value + '")');
  }
  return value;
}

/**
 * A year, bounded on both sides.
 *
 * The ceiling is next year rather than this one: a campaign is often
 * dated to the year it airs, which can run ahead of the shoot.
 */
/** A URL segment. Same shape as an id, and checked just as hard. */
function slug(row: Record<string, unknown>, where: string): string {
  const value = text(row, "slug", where);
  if (!ID.test(value)) {
    fail(where, 'slug must be lowercase kebab-case (got "' + value + '")');
  }
  return value;
}

function year(row: Record<string, unknown>, where: string): number {
  const value = row["year"];
  if (typeof value !== "number" || !Number.isInteger(value)) {
    fail(where, "year must be a whole number");
  }
  const ceiling = new Date().getFullYear() + 1;
  if (value < 1990 || value > ceiling) {
    fail(where, "year must be between 1990 and " + ceiling + " (got " + value + ")");
  }
  return value;
}

/**
 * A string in every locale.
 *
 * Both languages are required, always. A missing Arabic title is not a
 * blank on the Arabic page — it is the site silently falling back to
 * Latin text in the middle of an RTL paragraph, which reads as broken
 * rather than as untranslated. Arabic copy here is authored, not
 * machine-translated, so "not written yet" has to fail loudly.
 */
function bilingual(
  row: Record<string, unknown>,
  key: string,
  where: string,
): Record<Locale, string> {
  const value = row[key];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(where, key + " must be an object with one key per locale");
  }
  const bag = value as Record<string, unknown>;
  const out = {} as Record<Locale, string>;
  for (const locale of LOCALES) {
    const entry = bag[locale];
    if (typeof entry !== "string" || entry.trim() === "") {
      fail(where, key + "." + locale + " is missing or empty");
    }
    out[locale] = entry.trim();
  }
  return out;
}

function oneOf<T extends string>(
  row: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
  where: string,
): T {
  const value = text(row, key, where);
  if (!(allowed as readonly string[]).includes(value)) {
    fail(
      where,
      key + " must be one of " + allowed.join(", ") + ' (got "' + value + '")',
    );
  }
  return value as T;
}

/**
 * A path into public/. Not a URL — these are served from our own
 * origin, and an absolute https:// here would mean the studio had
 * hot-linked someone else's asset without anyone noticing.
 */
function asset(
  row: Record<string, unknown>,
  key: string,
  where: string,
  { allowEmpty = false } = {},
): string {
  const value = allowEmpty ? optional(row, key, where) : text(row, key, where);
  if (value === "") return value;
  if (!value.startsWith("/media/")) {
    fail(where, key + ' must start with /media/ (got "' + value + '")');
  }
  if (value.includes("..")) fail(where, key + " may not contain '..'");
  return value;
}

/** An off-site film. Vimeo and YouTube today; the check is the scheme. */
function externalUrl(
  row: Record<string, unknown>,
  key: string,
  where: string,
): string {
  const value = text(row, key, where);
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return fail(where, key + ' is not a valid URL (got "' + value + '")');
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    fail(where, key + " must be an http(s) URL");
  }
  return value;
}

/**
 * Ids are the join key between collections AND the filename of the
 * asset in several cases, so a duplicate is not a cosmetic problem —
 * two rows would fight over /media/team-omar-aqraa.jpg.
 */
function unique(ids: string[], where: string): void {
  const seen = new Set<string>();
  for (const value of ids) {
    if (seen.has(value)) fail(where, 'duplicate id "' + value + '"');
    seen.add(value);
  }
}

/* ---------- the collections --------------------------------------- */

export function parseProjects(raw: unknown, where = "projects.json"): Project[] {
  const out = rows(raw, where).map((row, i) => {
    const at = where + "[" + i + "]";
    return {
      id: id(row, at),
      slug: slug(row, at),
      client: text(row, "client", at),
      title: bilingual(row, "title", at),
      pillar: oneOf<Pillar>(row, "pillar", PILLARS, at),
      year: year(row, at),
      poster: asset(row, "poster", at),
      preview: asset(row, "preview", at),
      /* Optional: no project film has a published Vimeo id yet. */
      vimeoId: optional(row, "vimeoId", at) || undefined,
    };
  });
  unique(
    out.map((project) => project.id),
    where,
  );
  /* Slugs are URLs. A duplicate is two pieces fighting over one page,
     which fails as a 404 for one of them long after the build passed. */
  unique(
    out.map((project) => project.slug),
    where + " slug",
  );
  return out;
}

export function parseClients(raw: unknown, where = "clients.json"): ClientCard[] {
  const out = rows(raw, where).map((row, i) => {
    const at = where + "[" + i + "]";
    return {
      id: id(row, at),
      name: text(row, "name", at),
      /* A client with no mark is normal — ten of the twenty-two are
         named on the live site and have no logo file anywhere. */
      logo: asset(row, "logo", at, { allowEmpty: true }),
    };
  });
  unique(
    out.map((client) => client.id),
    where,
  );
  return out;
}

export function parseAwards(raw: unknown, where = "awards.json"): Award[] {
  const out = rows(raw, where).map((row, i) => ({
    id: id(row, where + "[" + i + "]"),
    name: text(row, "name", where + "[" + i + "]"),
  }));
  unique(
    out.map((award) => award.id),
    where,
  );
  return out;
}

export function parseBts(raw: unknown, where = "bts.json"): BtsFilm[] {
  const out = rows(raw, where).map((row, i) => {
    const at = where + "[" + i + "]";
    return {
      id: id(row, at),
      title: bilingual(row, "title", at),
      client: text(row, "client", at),
      year: year(row, at),
      href: externalUrl(row, "href", at),
    };
  });
  unique(
    out.map((film) => film.id),
    where,
  );
  return out;
}

export function parseTeam(raw: unknown, where = "team.json"): Member[] {
  const out = rows(raw, where).map((row, i) => {
    const at = where + "[" + i + "]";
    return {
      id: id(row, at),
      name: bilingual(row, "name", at),
      /* Latin in both locales, like every other production credit —
         so it is a plain string, not a bilingual pair. */
      role: text(row, "role", at),
      bio: bilingual(row, "bio", at),
    };
  });
  unique(
    out.map((member) => member.id),
    where,
  );
  return out;
}

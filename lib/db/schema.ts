import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { PILLARS, type Pillar } from "@/types/content";

/**
 * The database, as tables.
 *
 * This replaces content/data/*.json as the place the rows live. It does
 * NOT replace lib/content-schema.ts: that still parses whatever comes
 * back out, so the domain types are still enforced in one place and the
 * app cannot be handed a row the site does not understand.
 *
 * THREE CHOICES WORTH THE WORDS.
 *
 * 1. **Text primary keys, not serial integers.** `id` is already the
 *    stable, human-meaningful identity in this project — it is the
 *    filename an asset lands on and the key content/curation.ts points
 *    at. Swapping it for an autoincrementing number would mean the
 *    curation had to reference something a person cannot read, and a
 *    reseed would renumber everything.
 *
 * 2. **Bilingual fields are two columns, not one JSON blob.** `title_ar`
 *    and `title_en` can be indexed, searched and constrained NOT NULL
 *    individually — which is how "a missing Arabic title is a hard
 *    error" survives the move to a database. A jsonb column would make
 *    that a runtime check again.
 *
 * 3. **`position` exists on every table.** SQL has no inherent row
 *    order, and order is load-bearing here: content/projects.ts derives
 *    the homepage logo rail from the client list IN SEQUENCE. Without
 *    an explicit column the rail would reshuffle on any query the
 *    planner felt like reordering.
 */

/**
 * The pillar enum, derived from the taxonomy rather than retyped.
 *
 * Postgres rejects a bad value at the database level, which restores at
 * the storage layer the guarantee the TypeScript union gave before the
 * content became data. The cast is because `pgEnum` wants a non-empty
 * tuple and `PILLARS` is derived from a Record's keys.
 */
export const pillarEnum = pgEnum("pillar", PILLARS as [Pillar, ...Pillar[]]);

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  /** The public URL segment under /our-work/. Unique or two pieces
      fight over one page — a 404 discovered long after the deploy. */
  slug: text("slug").notNull().unique(),
  client: text("client").notNull(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  pillar: pillarEnum("pillar").notNull(),
  year: integer("year").notNull(),
  poster: text("poster").notNull(),
  preview: text("preview").notNull(),
  /** Nullable: no project film has a published Vimeo id yet. */
  vimeoId: text("vimeo_id"),
  position: integer("position").notNull().default(0),
});

export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  /** Empty string, not null — ten of the twenty-two have no mark, and
      "no logo" is a known state rather than missing information. */
  logo: text("logo").notNull().default(""),
  position: integer("position").notNull().default(0),
});

export const btsFilms = pgTable("bts_films", {
  id: text("id").primaryKey(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  client: text("client").notNull(),
  year: integer("year").notNull(),
  href: text("href").notNull(),
  position: integer("position").notNull().default(0),
});

export const team = pgTable("team", {
  id: text("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  /** Latin in both locales — it sits on a slate-like line. */
  role: text("role").notNull(),
  bioAr: text("bio_ar").notNull(),
  bioEn: text("bio_en").notNull(),
  position: integer("position").notNull().default(0),
});

export const awards = pgTable("awards", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  position: integer("position").notNull().default(0),
});

export const schema = { projects, clients, btsFilms, team, awards };

import { asc } from "drizzle-orm";
import { cache } from "react";
import {
  parseAwards,
  parseBts,
  parseClients,
  parseProjects,
  parseTeam,
} from "@/lib/content-schema";
import { db, schema } from "@/lib/db";
import type {
  Award,
  BtsFilm,
  ClientCard,
  Member,
  Project,
} from "@/types/content";

/**
 * Reading the content out of the database.
 *
 * ⚠️ EVERY QUERY ENDS IN THE SITE'S OWN PARSER. The database enforces a
 * lot — the pillar enum, NOT NULL, the unique slug — but it cannot know
 * that a title must be non-empty after trimming, or that a poster path
 * has to start with /media/ and must not contain "..". Those rules live
 * in lib/content-schema.ts and they still run on every read, so there is
 * one definition of a valid row whether it arrived from JSON, from a
 * form, or from someone typing SQL into the Neon console at midnight.
 *
 * ⚠️ ORDER IS ALWAYS EXPLICIT. SQL gives no row order without ORDER BY,
 * and order is load-bearing here: content/projects.ts derives the
 * homepage logo rail from the client list IN SEQUENCE. A query without
 * `orderBy` works fine until the planner picks a different scan and the
 * rail silently reshuffles.
 *
 * ⚠️ `cache()` IS PER-REQUEST, NOT A CACHE IN THE ORDINARY SENSE. It
 * dedupes within a single render: the homepage asks for the projects in
 * three different sections, and this makes that one query instead of
 * three. It does NOT persist between requests — that job belongs to the
 * static render, which is regenerated on demand by revalidatePath when
 * the studio writes.
 */

/** DB columns are snake_case and flat; the app wants nested bilingual objects. */
export const getProjects = cache(async (): Promise<Project[]> => {
  const rows = await db()
    .select()
    .from(schema.projects)
    .orderBy(asc(schema.projects.position));

  return parseProjects(
    rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      client: row.client,
      title: { ar: row.titleAr, en: row.titleEn },
      pillar: row.pillar,
      year: row.year,
      poster: row.poster,
      preview: row.preview,
      /* The column is nullable and the domain type is optional, which
         are not the same thing — `null` would fail the parser. */
      ...(row.vimeoId ? { vimeoId: row.vimeoId } : {}),
    })),
    "projects table",
  );
});

export const getClients = cache(async (): Promise<ClientCard[]> => {
  const rows = await db()
    .select()
    .from(schema.clients)
    .orderBy(asc(schema.clients.position));

  return parseClients(rows, "clients table");
});

export const getBtsFilms = cache(async (): Promise<BtsFilm[]> => {
  const rows = await db()
    .select()
    .from(schema.btsFilms)
    .orderBy(asc(schema.btsFilms.position));

  return parseBts(
    rows.map((row) => ({
      id: row.id,
      title: { ar: row.titleAr, en: row.titleEn },
      client: row.client,
      year: row.year,
      href: row.href,
    })),
    "bts_films table",
  );
});

export const getTeam = cache(async (): Promise<Member[]> => {
  const rows = await db()
    .select()
    .from(schema.team)
    .orderBy(asc(schema.team.position));

  return parseTeam(
    rows.map((row) => ({
      id: row.id,
      name: { ar: row.nameAr, en: row.nameEn },
      role: row.role,
      bio: { ar: row.bioAr, en: row.bioEn },
    })),
    "team table",
  );
});

export const getAwards = cache(async (): Promise<Award[]> => {
  const rows = await db()
    .select()
    .from(schema.awards)
    .orderBy(asc(schema.awards.position));

  return parseAwards(rows, "awards table");
});

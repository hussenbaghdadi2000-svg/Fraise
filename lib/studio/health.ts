import {
  HERO_ID,
  PILLAR_MEDIA,
  SELECTED_WORK_IDS,
  SHOWCASE_IDS,
} from "@/content/curation";
import { ContentError } from "@/lib/content-schema";
import type { Severity } from "@/lib/studio/form";
import {
  COLLECTIONS,
  assetFields,
  assetPath,
  type AssetField,
  type Collection,
  type Row,
} from "@/lib/studio/collections";
import { describeRatio, probePublicPath, ratioMatches } from "@/lib/studio/media";
import type { Probe } from "@/lib/studio/probe";
import { readRows } from "@/lib/studio/repository";
import { PILLAR_RATIO, type Locale, type Pillar, type Ratio } from "@/types/content";

/**
 * What a JSON editor cannot tell you.
 *
 * Typing valid JSON into five files is the easy half. The half that
 * actually breaks this site is the part no single file can see:
 *
 *   - a poster that is 16:9 on a row whose pillar says 9:16, so the
 *     taxonomy the whole design teaches is quietly wrong;
 *   - a `poster` path pointing at a file nobody ever copied in, which
 *     renders as a black box because the ratio container reserved its
 *     space perfectly;
 *   - deleting the one project that content/curation.ts names as the
 *     homepage hero.
 *
 * Every check here is one that has a real failure behind it, and each
 * is graded honestly: an ERROR is something that breaks a page or the
 * build, a WARNING is something a person should look at and may
 * legitimately decide to keep.
 */

export type { Severity };

export interface Finding {
  severity: Severity;
  /** Where to look: "projects · newland-stills". */
  where: string;
  message: Record<Locale, string>;
  /** A link into the studio, when the finding is about an editable row. */
  href?: string;
}

export interface HealthReport {
  findings: Finding[];
  counts: { name: string; rows: number }[];
  errors: number;
  warnings: number;
}

function rowId(row: Row): string {
  return typeof row["id"] === "string" ? row["id"] : "?";
}

export async function health(): Promise<HealthReport> {
  const findings: Finding[] = [];
  const counts: { name: string; rows: number }[] = [];
  const loaded = new Map<string, Row[]>();

  for (const collection of COLLECTIONS) {
    let rows: Row[];
    try {
      rows = await readRows(collection);
    } catch (error) {
      findings.push({
        severity: "error",
        where: collection.file,
        message: both(
          `${collection.file} could not be read: ${message(error)}`,
        ),
      });
      counts.push({ name: collection.name, rows: 0 });
      continue;
    }

    loaded.set(collection.name, rows);
    counts.push({ name: collection.name, rows: rows.length });

    /* The site's own parser, run as a report instead of as a throw.
       Whatever this says is exactly what `next build` would say. */
    try {
      collection.validate(rows);
    } catch (error) {
      findings.push({
        severity: "error",
        where: collection.file,
        message: both(
          error instanceof ContentError ? error.message : message(error),
        ),
        href: `/studio/${collection.name}`,
      });
    }

    findings.push(...(await checkAssets(collection, rows)));
  }

  findings.push(...checkCuration(loaded.get("projects") ?? []));
  findings.push(...(await checkPillarMedia()));
  findings.push(
    ...checkRoster(loaded.get("projects") ?? [], loaded.get("clients") ?? []),
  );

  return {
    findings,
    counts,
    errors: findings.filter((f) => f.severity === "error").length,
    warnings: findings.filter((f) => f.severity === "warning").length,
  };
}

/* ---------- assets ------------------------------------------------- */

/**
 * One asset field on one row, measured against what it claims to be.
 *
 * ⚠️ THIS IS THE ONLY IMPLEMENTATION. The edit form renders it beside
 * the file input so a wrong crop is visible while you are looking at
 * the row, and the health page rolls it up across every collection. Two
 * copies of "is this poster the right shape" would eventually disagree,
 * and the one that disagreed quietly would be the form.
 */
export interface AssetStatus {
  field: AssetField;
  path: string;
  measured: Probe | null;
  problems: { severity: Severity; message: Record<Locale, string> }[];
}

export async function inspectAsset(
  field: AssetField,
  row: Row,
): Promise<AssetStatus> {
  const path = assetPath(field, row);

  /* An absent optional asset is a fact, not a fault — ten of the
     twenty-two clients have no mark anywhere. */
  if (path === "") {
    return { field, path, measured: null, problems: [] };
  }

  const measured = await probePublicPath(path);
  if (!measured) {
    return {
      field,
      path,
      measured: null,
      problems: [
        {
          severity: "error",
          message: {
            ar: `الملف ${path} غير موجود أو غير قابل للقراءة.`,
            en: `${path} is missing or unreadable.`,
          },
        },
      ],
    };
  }

  const problems: AssetStatus["problems"] = [];
  const expected = expectedRatio(field.expect.ratio, row);
  if (expected && !ratioMatches(measured, expected)) {
    problems.push({
      severity: "warning",
      message: {
        ar: `النسبة ${describeRatio(measured)} (${measured.width}×${measured.height}) بينما المتوقع ${expected}. الكادر سيُقتطع.`,
        en: `${describeRatio(measured)} (${measured.width}×${measured.height}) where ${expected} is expected. The frame will be cropped.`,
      },
    });
  }
  if (measured.width < field.expect.minWidth) {
    problems.push({
      severity: "warning",
      message: {
        ar: `العرض ${measured.width}px، دون الحد ${field.expect.minWidth}px — الأرجح أنه مصغّرة لا ملف أصلي.`,
        en: `${measured.width}px wide, under the ${field.expect.minWidth}px floor — likely a thumbnail rather than a master.`,
      },
    });
  }
  return { field, path, measured, problems };
}

/** Every asset on one row, probed in parallel. */
export async function inspectRow(
  collection: Collection,
  row: Row,
): Promise<AssetStatus[]> {
  return Promise.all(
    assetFields(collection).map((field) => inspectAsset(field, row)),
  );
}

async function checkAssets(
  collection: Collection,
  rows: Row[],
): Promise<Finding[]> {
  if (assetFields(collection).length === 0) return [];

  const perRow = await Promise.all(
    rows.map(async (row) => {
      const id = rowId(row);
      const where = `${collection.name} · ${id}`;
      const href = `/studio/${collection.name}/${encodeURIComponent(id)}`;
      const statuses = await inspectRow(collection, row);
      return statuses.flatMap((status) =>
        status.problems.map((problem) => ({
          severity: problem.severity,
          where,
          href,
          /* The row view says "the ratio is wrong"; the report has to
             say WHICH FILE, because it is read away from the row. */
          message: {
            ar: `${status.path} — ${problem.message.ar}`,
            en: `${status.path} — ${problem.message.en}`,
          },
        })),
      );
    }),
  );

  return perRow.flat();
}

function expectedRatio(
  expected: Ratio | "pillar" | undefined,
  row: Row,
): Ratio | null {
  if (!expected) return null;
  if (expected !== "pillar") return expected;
  const pillar = row["pillar"];
  if (typeof pillar !== "string") return null;
  return PILLAR_RATIO[pillar as Pillar] ?? null;
}

/* ---------- curation ----------------------------------------------- */

/**
 * The checks that only exist because the catalogue is editable now.
 *
 * content/projects.ts resolves every id below and throws if one is
 * missing, so all of these are build failures rather than silent
 * breakage. Reporting them HERE is what turns "the build broke after I
 * deleted something" into "do not delete this, it is the hero".
 */
function checkCuration(projects: Row[]): Finding[] {
  const byId = new Map(projects.map((row) => [rowId(row), row]));
  const findings: Finding[] = [];

  const missing = (id: string, role: Record<Locale, string>): Finding => ({
    severity: "error",
    where: `curation · ${id}`,
    href: "/studio/projects",
    message: {
      ar: `«${id}» مذكور في content/curation.ts (${role.ar}) لكنه غير موجود في projects.json. البناء سيفشل.`,
      en: `"${id}" is named in content/curation.ts (${role.en}) but is not in projects.json. The build will fail.`,
    },
  });

  if (!byId.has(HERO_ID)) {
    findings.push(missing(HERO_ID, { ar: "بطل الصفحة الرئيسية", en: "homepage hero" }));
  }

  for (const { pillar, ids } of SHOWCASE_IDS) {
    for (const id of ids) {
      const row = byId.get(id);
      if (!row) {
        findings.push(missing(id, { ar: "عرض الصفحة الرئيسية", en: "homepage showcase" }));
        continue;
      }
      /* Same-pillar is the whole reason the showcase has this shape:
         mixed ratios in one row leave a hole no alignment can close. */
      if (row["pillar"] !== pillar) {
        findings.push({
          severity: "error",
          where: `curation · ${id}`,
          href: `/studio/projects/${encodeURIComponent(id)}`,
          message: {
            ar: `«${id}» في صف ${pillar} من العرض، لكن خدمته الآن ${String(row["pillar"])} — أي نسبة مختلفة داخل صف واحد.`,
            en: `"${id}" sits in the ${pillar} showcase row but its pillar is now ${String(row["pillar"])} — a different ratio inside one row.`,
          },
        });
      }
    }
  }

  for (const { row, ids } of SELECTED_WORK_IDS) {
    const expected = { A: 1, B: 2, C: 2, D: 3 }[row];
    if (ids.length !== expected) {
      findings.push({
        severity: "error",
        where: `curation · row ${row}`,
        message: {
          ar: `صف ${row} في Selected Work يأخذ ${expected} عنصراً، وفيه ${ids.length}.`,
          en: `Selected Work row ${row} takes ${expected} piece(s) and has ${ids.length}.`,
        },
      });
    }
    for (const id of ids) {
      if (!byId.has(id)) {
        findings.push(missing(id, { ar: `صف ${row} من الأعمال المختارة`, en: `Selected Work row ${row}` }));
      }
    }
  }

  return findings;
}

/**
 * The capability strip's files.
 *
 * These are media stems with no row anywhere — `reel-tvc` is a
 * two-second cut from a compilation reel, not a piece of work with a
 * client and a year. So they cannot be checked as rows, and they are
 * also the only assets on the site that no collection would ever
 * notice had gone missing.
 */
async function checkPillarMedia(): Promise<Finding[]> {
  const checks = Object.entries(PILLAR_MEDIA).flatMap(([pillar, stem]) =>
    [".jpg", ".mp4"].map(async (extension): Promise<Finding[]> => {
      const publicPath = `/media/${stem}${extension}`;
      const measured = await probePublicPath(publicPath);
      if (!measured) {
        return [
          {
            severity: "error",
            where: `capabilities · ${pillar}`,
            message: {
              ar: `${publicPath} مفقود — شريط القدرات على الصفحة الرئيسية يبنيه من content/curation.ts.`,
              en: `${publicPath} is missing — the homepage capability strip builds it from content/curation.ts.`,
            },
          },
        ];
      }
      const expected = PILLAR_RATIO[pillar as Pillar];
      if (!ratioMatches(measured, expected)) {
        return [
          {
            severity: "warning",
            where: `capabilities · ${pillar}`,
            message: {
              ar: `${publicPath} نسبته ${describeRatio(measured)} بينما ${pillar} يعني ${expected}.`,
              en: `${publicPath} is ${describeRatio(measured)} where ${pillar} means ${expected}.`,
            },
          },
        ];
      }
      return [];
    }),
  );
  return (await Promise.all(checks)).flat();
}

/**
 * A project credited to a client who is not on the roster.
 *
 * A warning rather than an error, because the roster feeds the logo
 * rail and the JSON-LD `knowsAbout` list, and a piece may legitimately
 * be credited to a brand the studio does not list publicly. But the two
 * lists drifting apart is exactly the failure documented in
 * content/projects.ts — twenty-two clients across two lists that
 * overlapped on four — so it is worth saying out loud.
 */
function checkRoster(projects: Row[], clients: Row[]): Finding[] {
  const names = new Set(
    clients
      .map((row) => row["name"])
      .filter((name): name is string => typeof name === "string"),
  );
  /* The studio's own name is on the showreel cuts by design: a
     compilation across many clients is not attributed to one of them. */
  names.add("Fraise Studio");

  return projects.flatMap((row) => {
    const client = row["client"];
    if (typeof client !== "string" || names.has(client)) return [];
    const id = rowId(row);
    return [
      {
        severity: "warning" as const,
        where: `projects · ${id}`,
        href: `/studio/projects/${encodeURIComponent(id)}`,
        message: {
          ar: `العميل «${client}» غير مدرج في قائمة العملاء، فلن يظهر في شريط الشعارات ولا في بيانات JSON-LD.`,
          en: `Client "${client}" is not on the roster, so it appears in neither the logo rail nor the JSON-LD.`,
        },
      },
    ];
  });
}

/* ---------- helpers ------------------------------------------------ */

/** A technical message reads the same in both languages. */
function both(text: string): Record<Locale, string> {
  return { ar: text, en: text };
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

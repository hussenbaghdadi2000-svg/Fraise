import { getTeam } from "@/lib/db/queries";
import type { Locale, Member } from "@/types/content";

/**
 * The crew.
 *
 * ⚠️ THE ROWS LIVE IN POSTGRES so /studio/ can edit them from the
 * deployed site. content/data/team.json is the seed and the backup.
 * `Member` moved to types/content.ts and is re-exported here, so
 * existing imports from "@/content/team" are unchanged.
 *
 * An earlier version of this page listed DEPARTMENTS and no people, on
 * the analysis's reasoning that a named roster invites a reader to
 * count heads on the page whose job is proving "not one person with a
 * camera". The studio's own preview solved that better than removing
 * the people did: it leads with **"six disciplines, one visual vision"**
 * and gives every name a role in capitals above the bio.
 *
 * So both are kept. The heading counts disciplines, each card leads
 * with its discipline, and the departments section stays underneath as
 * the process. Names prove there are humans; roles prove there are six
 * different jobs being done.
 *
 * Bios are the studio's own Arabic, condensed. The English is authored
 * from the same facts rather than machine-translated — same rule as
 * every other string in this project.
 *
 * ⚠️ THE PORTRAIT IS DERIVED, NOT STORED — `/media/team-{id}.jpg`,
 * built by the team page. The dashboard uploads to that path.
 *
 * ⚠️ THE PORTRAITS ARE 600×480 SOURCES, cropped to 4:5 and scaled to
 * 600×750. That is a 1.25× upscale and it is the ceiling of what the
 * preview site published. Re-shooting the crew at 1600×2000 is in
 * docs/03-asset-spec.md — and /studio/ flags any portrait it finds
 * below 1280px wide, so a replacement that is still too small does not
 * quietly pass for a fix.
 */
export type { Member };

export { getTeam };

/** The section heading — it counts DISCIPLINES, not people. */
export const TEAM_HEADING: Record<Locale, { title: string; line: string }> = {
  ar: {
    title: "فريق العمل",
    line: "ست خبرات، ورؤية بصرية واحدة.",
  },
  en: {
    title: "The Crew",
    line: "Six disciplines, one visual eye.",
  },
};

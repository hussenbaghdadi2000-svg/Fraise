export { size, contentType } from "@/lib/og";
import { notFound } from "next/navigation";
import { ogImage } from "@/lib/og";
import { getProjects } from "@/content/projects";
import { assertLocale } from "@/lib/i18n";
import { PILLAR_KIND } from "@/types/content";

/**
 * 58 cards — one per project per locale.
 *
 * This is the set that actually matters: a project page is what gets
 * pasted into a WhatsApp thread, and until now every one of those
 * previews rendered as a bare grey link.
 */
export default async function Image({
  params,
}: PageProps<"/[locale]/our-work/[project]">) {
  const { locale: raw, project: slug } = await params;
  const locale = assertLocale(raw);
  const project = (await getProjects()).find(
    (candidate) => candidate.slug === decodeURIComponent(slug),
  );
  if (!project) notFound();

  return ogImage({
    locale,
    kicker: PILLAR_KIND[project.pillar],
    title: project.title[locale],
    /* ⚠️ LATIN ONLY, deliberately. This line first read
       "Al Sayad · 2022 · إعلانات وتصوير سينمائي" and satori's bidi
       spaced the mixed run wrongly — irregular gaps mid-phrase. The
       kicker already names the format in Latin, so the Arabic was
       redundant as well as broken. Client and year are notation, read
       the same way in both languages, exactly like the slate. */
    meta: `${project.client} · ${project.year}`,
  });
}

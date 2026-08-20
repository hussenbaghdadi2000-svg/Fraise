export { size, contentType } from "@/lib/og";
import { notFound } from "next/navigation";
import { ogImage } from "@/lib/og";
import { PILLAR_CONTENT } from "@/content/pillars";
import { assertLocale } from "@/lib/i18n";
import { pillarFromSlug } from "@/lib/routes";
import { PILLAR_KIND } from "@/types/content";

/* No generateStaticParams here: the page's own already enumerates the
   five slugs per locale, and Next renders one card per generated page.
   Duplicating the list would be a second place to forget. */
export default async function Image({
  params,
}: PageProps<"/[locale]/[pillar]">) {
  const { locale: raw, pillar: slug } = await params;
  const locale = assertLocale(raw);
  const pillar = pillarFromSlug(decodeURIComponent(slug), locale);
  if (!pillar) notFound();

  const content = PILLAR_CONTENT[pillar];
  return ogImage({
    locale,
    kicker: PILLAR_KIND[pillar],
    title: content.h1[locale],
    meta: content.line[locale],
  });
}

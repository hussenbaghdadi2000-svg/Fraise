export { size, contentType } from "@/lib/og";
import { ogImage } from "@/lib/og";
import { BTS_LINE, getBtsFilms } from "@/content/bts";
import { STUDIO } from "@/content/studio";
import { assertLocale } from "@/lib/i18n";

export default async function Image({
  params,
}: PageProps<"/[locale]/behind-the-scenes">) {
  const locale = assertLocale((await params).locale);
  return ogImage({
    locale,
    kicker: `Behind The Scenes / ${(await getBtsFilms()).length}`,
    title: STUDIO[locale].btsTitle,
    meta: BTS_LINE[locale],
  });
}

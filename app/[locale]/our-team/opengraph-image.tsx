export { size, contentType } from "@/lib/og";
import { ogImage } from "@/lib/og";
import { TEAM_HEADING, getTeam } from "@/content/team";
import { assertLocale } from "@/lib/i18n";

export default async function Image({
  params,
}: PageProps<"/[locale]/our-team">) {
  const locale = assertLocale((await params).locale);
  const heading = TEAM_HEADING[locale];
  return ogImage({
    locale,
    kicker: `The Crew / ${(await getTeam()).length}`,
    title: heading.title,
    meta: heading.line,
  });
}

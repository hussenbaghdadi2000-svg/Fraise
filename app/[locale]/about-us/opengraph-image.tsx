/* Share card. Rendered on the server at build time — 0 kB on the
   client. Everything about the design lives in lib/og.tsx. */
export { size, contentType } from "@/lib/og";
import { ogImage } from "@/lib/og";
import { STUDIO } from "@/content/studio";
import { assertLocale } from "@/lib/i18n";

export default async function Image({
  params,
}: PageProps<"/[locale]/about-us">) {
  const locale = assertLocale((await params).locale);
  const studio = STUDIO[locale];
  return ogImage({
    locale,
    kicker: "The Studio",
    title: studio.h1,
    meta: studio.lead,
  });
}

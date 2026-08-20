/* Share card. Rendered on the server at build time — 0 kB on the
   client. Everything about the design lives in lib/og.tsx. */
export { size, contentType } from "@/lib/og";
import { ogImage } from "@/lib/og";
import { COPY } from "@/content/copy";
import { assertLocale } from "@/lib/i18n";

export default async function Image({ params }: PageProps<"/[locale]">) {
  const locale = assertLocale((await params).locale);
  const copy = COPY[locale];
  return ogImage({
    locale,
    kicker: "Home",
    title: copy.home.positioning,
    meta: copy.home.tagline,
  });
}

import { COPY } from "@/content/copy";
import { getAwardNames, getClientNames } from "@/content/projects";
import { SITE_URL, routeUrl, type Route } from "@/lib/routes";
import type { Locale } from "@/types/content";

/**
 * Structured data. Server Components — the script tag is rendered HTML,
 * so this costs zero client JavaScript.
 *
 * `dangerouslySetInnerHTML` is the correct tool here and the only one:
 * React escapes text children, which would turn the JSON into HTML
 * entities and make it unparseable. The content is ours and contains no
 * user input, so there is nothing to inject.
 *
 * WHY THIS EARNS ITS PLACE: the awards. A Cannes Silver Lion stated
 * only as a logo image is invisible to a search engine. Stated in
 * `award` on an Organization it becomes a machine-readable credential —
 * the highest-value line of markup on the site.
 */

/* An async Server Component. The awards and the roster are rows now, so
   this has to await them — which is free: it renders into the static
   HTML, so the cost lands at build or revalidation, never on a visitor. */
export async function OrganizationJsonLd({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const awards = await getAwardNames();
  const clients = await getClientNames();

  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Fraise Studio",
    url: SITE_URL,
    description: copy.meta.description,
    email: "hello@fraise.studio",
    telephone: "+962793724731",
    /* Read off the live contact page. A street address is what makes
       "food production studio Amman" a search this can rank for. */
    address: {
      "@type": "PostalAddress",
      streetAddress: "Seqeleyah 24",
      addressLocality: "Amman",
      addressCountry: "JO",
    },
    /* Recovered from logo files on the live site, where they were
       stated nowhere in the copy. */
    award: awards,
    sameAs: [
      "https://vimeo.com/fraisestudio",
      "https://instagram.com/fraisestudio",
    ],
    knowsAbout: clients,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** One Service per pillar page — what that page actually offers. */
export function ServiceJsonLd({
  locale,
  route,
  name,
  description,
  tags,
}: {
  locale: Locale;
  route: Route;
  name: string;
  description: string;
  tags: string[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: routeUrl(route, locale),
    /* The old site's nine service names, machine-readable. */
    serviceType: tags,
    provider: {
      "@type": "Organization",
      name: "Fraise Studio",
      url: SITE_URL,
    },
    areaServed: { "@type": "Country", name: "Jordan" },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

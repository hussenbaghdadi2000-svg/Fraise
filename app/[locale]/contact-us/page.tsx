import type { Metadata } from "next";
import { Footer } from "@/components/chrome/Footer";
import { Header } from "@/components/chrome/Header";
import { Poster } from "@/components/media/Poster";
import { Preview } from "@/components/media/Preview";
import { Slate } from "@/components/primitives/Slate";
import { COPY } from "@/content/copy";
import { STUDIO } from "@/content/studio";
import { assertLocale } from "@/lib/i18n";
import { routeAlternates, routeUrl, type Route, ogUrl } from "@/lib/routes";
import { INSET } from "@/components/ui/Container";

/**
 * Contact.
 *
 * NO FORM, AND THAT IS THE DECISION. The live site has one — name,
 * email, phone, message, send — and reproducing it means either a mail
 * service with credentials, or a form that silently does nothing. The
 * second is worse than no form at all: it takes a real enquiry and
 * drops it.
 *
 * What replaces it is what actually converts for a studio in Amman:
 * WhatsApp and email, one tap each, both landing in a thread the studio
 * already reads. A form adds a step and a place for a message to get
 * lost. If a form is wanted later, the first decision is an email
 * provider — a service choice, not a component.
 *
 * THE LAYOUT IS THE FIX HERE. The first version was a title and four
 * small cards in a row, and it read as unfinished next to every other
 * route: no media, no anchor, no weight. It now opens on the floor like
 * the rest of the site, and the methods are stacked at display size
 * rather than shrunk into a grid — on a contact page the phone number
 * IS the content, so it gets set like content.
 */

const ROUTE: Route = { kind: "contact" };

/* Read off the live contact page. The phone is stored digits-only for
   tel: and wa.me, and formatted only for display. */
const EMAIL = "hello@fraise.studio";
const PHONE_DIGITS = "962793724731";
const PHONE_DISPLAY = "+962 79 372 4731";
const INSTAGRAM = "fraisestudio";
const STREET = "Seqeleyah 24";
const MAPS =
  "https://www.google.com/maps/search/?api=1&query=Seqeleyah+24,+Amman,+Jordan";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact-us">): Promise<Metadata> {
  const locale = assertLocale((await params).locale);
  const copy = COPY[locale].contact;
  return {
    title: `${copy.title} — Fraise Studio`,
    description: copy.line,
    openGraph: { images: [ogUrl(ROUTE, locale)] },
    alternates: {
      canonical: routeUrl(ROUTE, locale),
      languages: routeAlternates(ROUTE),
    },
  };
}

/**
 * One contact method, set at display size.
 *
 * The value carries its own `dir="ltr"` because it is always Latin or
 * numeric. A phone number left to the bidi algorithm inside an RTL
 * paragraph can render its groups in the wrong order while every digit
 * stays correct — the worst kind of bug, because it looks fine.
 */
function Method({
  label,
  value,
  href,
  external,
}: {
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <li className="u-rise">
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="group flex flex-col gap-2 border-t border-hairline py-5 transition-colors duration-300 hover:border-bone-faint"
      >
        <span className="u-caps font-mono text-label text-bone-faint">
          {label}
        </span>
        <span className="flex items-center justify-between gap-4">
          <span
            lang="en"
            dir="ltr"
            className="u-display text-subtitle font-semibold"
          >
            {value}
          </span>
          <span
            aria-hidden
            className="u-mirror shrink-0 text-bone-faint transition-colors duration-300 group-hover:text-fraise"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M5 2.5L9.5 7L5 11.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
        </span>
      </a>
    </li>
  );
}

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contact-us">) {
  const locale = assertLocale((await params).locale);
  const copy = COPY[locale].contact;
  const studio = STUDIO[locale];

  return (
    <>
      {/* Opens on the floor, like every other route. A contact page with
          no image was the one page that looked unfinished. */}
      <section className="u-scrim u-scrim-top relative w-full overflow-hidden">
        <Preview src="/media/bts-sunwhite.mp4" auto>
          <Poster
            src="/media/bts-sunwhite.jpg"
            alt={copy.title}
            ratio="2.39:1"
            sizes="100vw"
            preload
          />
        </Preview>

        <Header locale={locale} route={ROUTE} overlay />

        <div
          className={`absolute inset-x-0 bottom-0 z-10 ${INSET} pb-7 sm:pb-beat`}
        >
          <Slate client="Sunwhite" kind="BTS" year={2022} />
        </div>
      </section>

      <main className="flex flex-col">
        <section className={`${INSET} grid gap-beat py-bar sm:grid-cols-12 sm:gap-beat sm:py-movement`}>
          {/* The invitation. */}
          <div className="u-rise flex flex-col gap-7 sm:col-span-7">
            <h1 className="u-caps font-mono text-label text-bone-dim">
              {copy.title}
            </h1>
            <p className="u-display max-w-display text-display font-semibold">
              {copy.line}
            </p>
            <p className="max-w-lead text-lead text-bone-dim">
              {copy.body}
            </p>

            {/* The markets, so the reader knows before asking whether
                the studio travels to them. */}
            <div className="mt-4 flex flex-col gap-2 border-t border-hairline pt-5">
              <span className="u-caps font-mono text-label text-bone-faint">
                {studio.marketsTitle}
              </span>
              <p className="u-display text-lead font-semibold">
                {studio.markets}
              </p>
            </div>
          </div>

          {/* The methods, stacked. On a contact page the phone number is
              the content, so it is set like content rather than shrunk
              into a card. */}
          <ul className="flex flex-col sm:col-span-4 sm:col-start-9">
            <Method
              label={copy.whatsappLabel}
              value={PHONE_DISPLAY}
              href={`https://wa.me/${PHONE_DIGITS}`}
              external
            />
            <Method
              label={copy.emailLabel}
              value={EMAIL}
              href={`mailto:${EMAIL}`}
            />
            <Method
              label={copy.phoneLabel}
              value={PHONE_DISPLAY}
              href={`tel:+${PHONE_DIGITS}`}
            />
            <Method
              label={copy.social}
              value={`@${INSTAGRAM}`}
              href={`https://instagram.com/${INSTAGRAM}`}
              external
            />

            {/* The address, as text and a link — not an embedded map. An
                iframe here loads a third-party script and sets cookies
                before anyone asked, for one line of information. */}
            <li className="u-rise flex flex-col gap-2 border-t border-hairline py-5">
              <span className="u-caps font-mono text-label text-bone-faint">
                {copy.addressLabel}
              </span>
              <p className="u-display text-subtitle font-semibold">
                <span lang="en" dir="ltr">
                  {STREET}
                </span>
                {" — "}
                {copy.city}
              </p>
              <a
                href={MAPS}
                target="_blank"
                rel="noopener noreferrer"
                className="u-caps mt-2 w-fit border-b border-hairline pb-1 font-mono text-label text-bone-dim transition-colors duration-300 hover:border-fraise hover:text-bone"
              >
                {copy.directions}
              </a>
            </li>
          </ul>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}

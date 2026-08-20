import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/types/content";

/**
 * Locale primitives.
 *
 * Everything that depends on "which language is this page" resolves
 * here, so a locale can never be compared against a bare string
 * literal somewhere in a component.
 */

/**
 * Text direction is a property of the locale, not a per-component
 * decision. It is set once, on <html>, on the server — so the first
 * byte the browser receives already knows the page is RTL. Flipping
 * direction on the client would repaint the entire layout.
 */
export const DIR = {
  ar: "rtl",
  en: "ltr",
} as const satisfies Record<Locale, "rtl" | "ltr">;

/** Where the language switch points. With two locales this is total. */
export const OTHER_LOCALE = {
  ar: "en",
  en: "ar",
} as const satisfies Record<Locale, Locale>;

/** The name of each language, written in that language. Never translated. */
export const LOCALE_NAME = {
  ar: "العربية",
  en: "English",
} as const satisfies Record<Locale, string>;

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Narrows the raw `params.locale` string to our Locale union.
 *
 * `dynamicParams = false` in the root layout already makes any other
 * value a 404 at the routing layer, so notFound() here is unreachable
 * at runtime. It exists because TypeScript types `params.locale` as
 * `string` and has no way to know about that guarantee — this is the
 * bridge from the router's promise to the type system.
 */
export function assertLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}

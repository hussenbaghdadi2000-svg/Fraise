import type { Copy, Locale } from "@/types/content";
import { ar } from "./ar";
import { en } from "./en";

/**
 * The Next.js i18n guide loads dictionaries with dynamic import() so a
 * client bundle never carries every language at once. We deviate on
 * purpose: these dictionaries are only ever read by Server Components,
 * so they never reach the browser at all. Static imports keep the
 * types exact and the call sites synchronous.
 */
export const COPY: Record<Locale, Copy> = { ar, en };

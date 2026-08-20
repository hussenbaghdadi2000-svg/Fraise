import { redirect } from "next/navigation";
import { LoginForm } from "@/components/studio/LoginForm";
import { STUDIO_COPY } from "@/lib/studio/copy";
import { hasStudioSession, studioLocale } from "@/lib/studio/session";

/**
 * The one page under /studio/ that does NOT require a session.
 *
 * It renders bare — app/studio/layout.tsx only wraps children in the
 * Shell when signed in, because a nav whose every link bounces back to
 * this form is furniture pretending to be navigation.
 */
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  /* Already signed in? Then this page is a dead end. Sending them on is
     also what makes the browser's "remember password" flow not land
     someone on a login screen they have no business seeing. */
  if (await hasStudioSession()) redirect("/studio/");

  const locale = await studioLocale();
  const copy = STUDIO_COPY[locale];

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-gutter">
      <div className="flex w-full max-w-sm flex-col gap-bar">
        <div className="flex flex-col gap-2">
          <p
            lang="en"
            dir="ltr"
            className="u-caps font-mono text-label text-bone-faint"
          >
            {copy.subtitle}
          </p>
          <h1 className="u-display text-title font-semibold">{copy.brand}</h1>
          <p className="text-caption text-bone-faint">{copy.locked}</p>
        </div>

        <LoginForm locale={locale} />
      </div>
    </main>
  );
}

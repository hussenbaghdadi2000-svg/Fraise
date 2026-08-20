"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * The error boundary for everything under [locale].
 *
 * It has to be a Client Component — that is not a style choice, it is
 * how React error boundaries work: they rely on lifecycle behaviour
 * that only exists on the client. This is the one place in the project
 * where "use client" is not a budget decision.
 *
 * It is NOT wrapped in the root layout's <html>, so this file renders
 * inside it and inherits the fonts, tokens and direction. That is why
 * it can stay this small.
 *
 * The copy is bilingual and deliberately vague about the cause. An
 * error page that leaks a stack trace to a visitor is a security
 * problem; `digest` is the id to quote in a bug report, and it is the
 * only detail Next exposes to the client on purpose.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    /* In production this is where a reporter would go. Logging it keeps
       the digest reachable from the browser console in the meantime. */
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col justify-center gap-beat px-gutter py-bar sm:px-gutter-lg">
      <p lang="en" dir="ltr" className="u-caps font-mono text-label text-fraise">
        Error
      </p>

      <div className="flex flex-col gap-6">
        <p className="max-w-display text-title font-semibold">
          حدث خطأ غير متوقع.
        </p>
        <p
          lang="en"
          dir="ltr"
          className="u-display max-w-lead text-subtitle font-semibold text-bone-dim"
        >
          Something went wrong.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <button
          type="button"
          onClick={reset}
          className="u-caps cursor-pointer border-b border-hairline pb-1 font-mono text-label text-bone transition-colors duration-300 hover:border-fraise"
        >
          إعادة المحاولة · Try again
        </button>
        <Link
          href="/"
          className="u-caps border-b border-hairline pb-1 font-mono text-label text-bone-dim transition-colors duration-300 hover:border-fraise hover:text-bone"
        >
          الصفحة الرئيسية · Home
        </Link>
      </div>

      {error.digest && (
        <p lang="en" dir="ltr" className="font-mono text-label text-bone-faint">
          Reference: {error.digest}
        </p>
      )}
    </main>
  );
}

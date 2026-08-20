"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * A nav item that knows whether it is the current one.
 *
 * ⚠️ THE ONLY CLIENT COMPONENT IN THE STUDIO CHROME, and it is a leaf.
 * The alternative was threading an `active` prop from every page into a
 * layout that renders above them — the layout is what draws the nav, so
 * it cannot be told by its children which of them is showing.
 *
 * `startsWith` rather than equality, so /studio/projects/karam-menu
 * still lights up Projects. The overview is the exception: every path
 * starts with /studio, so it has to match exactly or it would be
 * permanently active.
 */
export interface NavLinkProps {
  href: string;
  label: string;
  exact?: boolean;
}

export function NavLink({ href, label, exact = false }: NavLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      /* The accent is a 2px inline-start rule, which is interactive
         state — the rule CLAUDE.md draws around --color-fraise. It is
         never the background and never the text. */
      className={`block border-s-2 py-2 ps-3 text-body transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fraise ${
        active
          ? "border-fraise text-bone"
          : "border-transparent text-bone-dim hover:border-hairline hover:text-bone"
      }`}
    >
      {label}
    </Link>
  );
}

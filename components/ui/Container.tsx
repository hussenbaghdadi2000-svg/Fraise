/**
 * The page gutter.
 *
 * This existed as `const INSET = "px-6 sm:px-10"` copy-pasted into
 * EIGHT files. A layout primitive living as a raw string means the page
 * margin can never be changed in one place — and it had already drifted
 * once, because nothing stopped it.
 *
 * It is a Server Component with no runtime cost: it renders one element
 * and reads the gutter from a token, so the margin is now a design
 * decision rather than eight independent ones.
 *
 * `full` opts a child out. Media is full-bleed by default in this
 * direction and text sits in a margin — so the gutter is something you
 * opt INTO, and this component is how.
 */
/**
 * The gutter as a string, for call sites that put the margin on an
 * element they already render. Wrapping those in <Container> would add
 * a DOM node purely to hold two classes — so the token is exported both
 * ways and there is still exactly one definition.
 */
export const INSET = "px-gutter sm:px-gutter-lg";

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Renders without the gutter, for full-bleed media rows. */
  full?: boolean;
  as?: "div" | "section" | "header" | "footer" | "nav" | "ul" | "ol";
}

export function Container({
  children,
  className = "",
  full = false,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={`${full ? "" : "px-gutter sm:px-gutter-lg"} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}

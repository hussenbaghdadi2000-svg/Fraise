/* Finds text that has been SQUEEZED rather than overflowed.
 *
 * audit.mjs only sees a box that escapes the viewport. The opposite
 * failure is invisible to it: a flex item with `min-w-0` (and worse,
 * `overflow-wrap: anywhere`) will happily shrink to one character per
 * line rather than push past the edge. The page is then catastrophically
 * broken and the overflow sweep reports "ok".
 *
 * That shipped once, on the homepage capability rows at 320px, in
 * Arabic — where it is not merely ugly: the script is connected, so
 * breaking mid-word shatters a word into isolated letterforms.
 *
 * Heuristic: count rendered lines against character count. Real prose
 * fits several characters per line at any sane width; a column broken
 * to 1-2 characters per line is always a bug.
 *
 *   Usage: node squeeze.mjs <url> [widths=320,360,390,768]
 */
import { withSession } from "./cdp.mjs";

const [, , url, widthsRaw = "320,360,390,768"] = process.argv;
if (!url) {
  console.error("usage: node squeeze.mjs <url> [widths]");
  process.exit(2);
}

const EXPR = String.raw`
(function () {
  var out = [];
  var all = document.querySelectorAll("p, h1, h2, h3, li, span, a, dt, dd");
  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    /* Only elements whose own text is the whole story. */
    if (el.children.length) continue;
    var text = (el.textContent || "").trim();
    if (text.length < 6) continue;
    var r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    var cs = getComputedStyle(el);
    var lh = parseFloat(cs.lineHeight);
    if (!lh || Number.isNaN(lh)) continue;
    var lines = Math.round(r.height / lh);
    if (lines < 2) continue;
    var perLine = text.length / lines;
    if (perLine <= 3) {
      out.push(
        Math.round(perLine * 10) / 10 + " chars/line  " +
        lines + " lines  w=" + Math.round(r.width) + "px  " +
        el.tagName.toLowerCase() + "." +
        String(el.className || "").split(" ").slice(0, 2).join(".") +
        "  [" + text.slice(0, 24) + "]"
      );
    }
  }
  return JSON.stringify(out.slice(0, 8));
})()`;

let bad = 0;
for (const width of widthsRaw.split(",").map(Number).filter(Boolean)) {
  await withSession({ width, height: 900 }, async ({ goto, evaluate }) => {
    await goto(url);
    const hits = JSON.parse(await evaluate(EXPR));
    if (!hits.length) {
      console.log(`${String(width).padStart(5)}px  ok`);
    } else {
      bad += hits.length;
      console.log(`${String(width).padStart(5)}px  SQUEEZED`);
      for (const h of hits) console.log("         " + h);
    }
  });
}

console.log(bad ? `\n!! ${bad} squeezed element(s).` : "\nNo squeezed text.");
process.exit(bad ? 1 : 0);

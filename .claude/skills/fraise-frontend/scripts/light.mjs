/* Luminance sweep — "no light grounds anywhere" is a rule that survives only if
   it is measured. Reports any painted element whose background is brighter than
   the threshold, which is how the u-invert bands were confirmed gone.
   Media is excluded: colour is supposed to come from the food.
   Usage: node light.mjs <url> [width=1440] [threshold=120] */
import { withSession } from "./cdp.mjs";

const [, , url, w = "1440", thr = "120"] = process.argv;
if (!url) { console.error("usage: node light.mjs <url> [width] [threshold]"); process.exit(1); }

/* String.raw — the page-side source must reach the browser with its backslashes
   intact. A plain template literal eats \d and \s and the regex silently
   stops matching, which reads as "the page is fully dark". */
const PROBE = String.raw`
(() => {
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.closest("img, video, svg, picture")) continue;
    const bg = getComputedStyle(el).backgroundColor;
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!m) continue;
    if ((m[4] === undefined ? 1 : parseFloat(m[4])) < 0.5) continue;
    const lum = +m[1] * 0.299 + +m[2] * 0.587 + +m[3] * 0.114;
    if (lum <= THRESHOLD) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    const cls = typeof el.className === "string" ? el.className : el.className.baseVal || "";
    out.push(el.tagName.toLowerCase() + "." + cls.split(" ").slice(0, 2).join(".") +
             "  " + bg + "  " + Math.round(r.width) + "x" + Math.round(r.height) +
             "  lum " + Math.round(lum));
  }
  return out.slice(0, 12);
})()`;

const found = await withSession({ width: +w }, async (s) => {
  await s.goto(url, 2500);
  return s.evaluate(PROBE.replace("THRESHOLD", String(+thr)));
});

if (!found.length) {
  console.log(`${url}: fully dark — no ground above luminance ${thr}.`);
  process.exit(0);
}
console.log(`${url}: ${found.length} light ground(s) —\n  ${found.join("\n  ")}`);
process.exit(1);

/* Computed type, per token role — what the BROWSER resolved, not what the class
   list promises. This is what caught the specificity bug that had every Arabic
   display heading rendering at 14.6px while the JSX still read `text-display`.
   Screenshots showed "small heading"; only computed style showed why.

   Two checks the eye cannot make:
     1. every `text-*` role resolves to a distinct, ascending size
     2. no element with lang="ar" carries letter-spacing — the script is
        connected and has no case, so tracking it is always a bug
   Usage: node measure.mjs <url> [width=1440] */
import { withSession } from "./cdp.mjs";

const [, , url, w = "1440"] = process.argv;
if (!url) { console.error("usage: node measure.mjs <url> [width]"); process.exit(1); }

const ROLES = ["label", "caption", "body", "lead", "subtitle", "title", "display"];

const PROBE = String.raw`
(() => {
  const langOf = (el) => (el.closest("[lang]") || document.documentElement).lang;
  const roles = ROLES_JSON.map((role) => {
    const els = [...document.querySelectorAll(".text-" + role)];
    const seen = new Map();
    for (const el of els) {
      const cs = getComputedStyle(el);
      const px = Math.round(parseFloat(cs.fontSize) * 10) / 10;
      const key = px + "|" + langOf(el);
      if (!seen.has(key)) seen.set(key, {
        px, lang: langOf(el), tracking: cs.letterSpacing,
        leading: cs.lineHeight, transform: cs.textTransform,
        sample: el.textContent.trim().slice(0, 26),
      });
    }
    return { role, n: els.length, hits: [...seen.values()].sort((a, b) => a.px - b.px) };
  });

  const tracked = [];
  for (const el of document.querySelectorAll("body *")) {
    if (!el.firstChild || el.firstChild.nodeType !== 3) continue;
    if (langOf(el) !== "ar") continue;
    const cs = getComputedStyle(el);
    const bad = cs.letterSpacing !== "normal" || cs.textTransform === "uppercase";
    if (!bad) continue;
    const cls = typeof el.className === "string" ? el.className : el.className.baseVal || "";
    tracked.push(el.tagName.toLowerCase() + "." + cls.split(" ").slice(0, 3).join(".") +
                 "  ls:" + cs.letterSpacing + " tt:" + cs.textTransform +
                 '  "' + el.textContent.trim().slice(0, 24) + '"');
  }

  return { roles, tracked: tracked.slice(0, 10), rootPx: getComputedStyle(document.documentElement).fontSize };
})()`;

const data = await withSession({ width: +w }, async (s) => {
  await s.goto(url, 2500);
  return s.evaluate(PROBE.replace("ROLES_JSON", JSON.stringify(ROLES)));
});

console.log(`--- ${url} @ ${w}px   root ${data.rootPx} ---`);
let prev = 0, inversions = 0;
for (const { role, n, hits } of data.roles) {
  if (!n) { console.log(`${role.padEnd(9)} (unused)`); continue; }
  const cells = hits.map((h) =>
    `${h.px}px [${h.lang}] lh:${h.leading}${h.tracking !== "normal" ? ` ls:${h.tracking}` : ""}  "${h.sample}"`);
  console.log(`${role.padEnd(9)} ${cells.join(`\n${" ".repeat(10)}`)}`);
  const top = Math.max(...hits.map((h) => h.px));
  if (top < prev) inversions++;
  prev = top;
}

if (data.tracked.length) {
  console.log(`\n!! ${data.tracked.length} Arabic run(s) carrying letter-spacing or uppercase —`);
  for (const t of data.tracked) console.log(`   ${t}`);
} else {
  console.log("\nNo Arabic run is tracked or uppercased.");
}

if (inversions) console.log(`!! ${inversions} role(s) resolve SMALLER than the role below them — check the cascade.`);
console.log("A display role landing near body size is the specificity bug — see CLAUDE.md.");
process.exit(data.tracked.length || inversions ? 1 : 0);

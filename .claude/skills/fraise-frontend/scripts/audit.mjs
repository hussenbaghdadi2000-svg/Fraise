/* Horizontal-overflow sweep across routes x widths.
   Overflow is the failure a spacing or type change produces most often and the
   one least visible in a diff — a token wider than the old literal pushes a
   fixed-width child past the viewport, and only 390px ever shows it.

   With no route list it reads /sitemap.xml, which is generated from
   lib/routes.ts and therefore cannot drift from the real route set.

   Usage: node audit.mjs [origin=http://localhost:3100] [routes|sitemap] [widths=390,1440]
     node audit.mjs                                     # every route in the sitemap
     MSYS_NO_PATHCONV=1 node audit.mjs http://localhost:3100 "/,/our-work/" 390
   NOTE Git Bash rewrites arguments that start with "/" into Windows paths.
   Pass MSYS_NO_PATHCONV=1 when naming routes explicitly, or use sitemap mode. */
import { withSession } from "./cdp.mjs";

const [, , originRaw, routesRaw, widthsRaw = "390,1440"] = process.argv;
const origin = originRaw || "http://localhost:3100";
const widths = widthsRaw.split(",").map(Number).filter(Boolean);

let routes;
if (!routesRaw || routesRaw === "sitemap") {
  const xml = await (await fetch(`${origin}/sitemap.xml`)).text();
  /* <loc> is the Arabic canonical only — English lives in the hreflang
     alternates. Take both, or the sweep silently never loads an LTR page. */
  const hrefs = [
    ...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]),
    ...[...xml.matchAll(/<xhtml:link[^>]*href="([^"]+)"/g)].map((m) => m[1]),
  ];
  routes = [...new Set(hrefs.map((h) => new URL(h).pathname))];
  if (!routes.length) { console.error("sitemap.xml listed no URLs"); process.exit(1); }
  console.log(`${routes.length} routes from ${origin}/sitemap.xml (both locales)`);
} else {
  routes = routesRaw.split(",").filter(Boolean)
    .map((r) => (r.startsWith("/") ? r : `/${r}`));
}

const PROBE = String.raw`
(() => {
  const vw = document.documentElement.clientWidth;
  const bad = [];
  /* An element only reaches the page edge if EVERY ancestor lets it: a
     horizontal rail (overflow-x:auto) or a clipped hero (overflow:hidden)
     contains its own children, and in RTL a rail's off-screen items sit at
     negative left, which otherwise floods this report with false positives. */
  const contained = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (getComputedStyle(p).overflowX !== "visible") return true;
    }
    return false;
  };
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (getComputedStyle(el).position === "fixed") continue;
    if (contained(el)) continue;
    if (r.right > vw + 1 || r.left < -1) {
      const cls = typeof el.className === "string" ? el.className : el.className.baseVal || "";
      bad.push(el.tagName.toLowerCase() + "." + cls.split(" ").slice(0, 3).join(".") +
               " [" + Math.round(r.left) + ".." + Math.round(r.right) + "]");
    }
  }
  return {
    scrollW: document.documentElement.scrollWidth, vw,
    dir: document.documentElement.dir, lang: document.documentElement.lang,
    over: bad.slice(0, 4), n: bad.length,
  };
})()`;

let failures = 0;
for (const W of widths) {
  await withSession({ width: W }, async (s) => {
    console.log(`\n--- ${W}px ---`);
    for (const route of routes) {
      await s.goto(origin + route, 1500);
      const d = await s.evaluate(PROBE);
      const over = d.scrollW > d.vw + 1;
      if (over) failures++;
      const label = decodeURIComponent(route);
      console.log(`${label.padEnd(34)} ${`${d.lang}/${d.dir}`.padEnd(8)} ` +
                  `${(over ? `OVERFLOW +${d.scrollW - d.vw}px` : "ok").padEnd(16)} ${d.n ? d.over.join("  ") : ""}`);
    }
  });
}
console.log(failures ? `\n!! ${failures} route/width combination(s) overflow.` : "\nNo horizontal overflow.");
process.exit(failures ? 1 : 0);

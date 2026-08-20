/* The JS budget, measured the one correct way.
   Sum the <script src> tags in a PRERENDERED page, brotli-compressed —
   EXCLUDING any tag carrying noModule. That tag is a ~112 kB legacy polyfill
   bundle only non-ESM browsers download; counting it reports ~145 kB and looks
   like a blown budget when nothing is wrong.
   Run `npm run build` first. Usage: node budget.mjs [page=ar] [budget-kB=120] */
import { readFileSync, existsSync, statSync } from "node:fs";
import { brotliCompressSync, gzipSync, constants } from "node:zlib";
import { join } from "node:path";

const [, , page = "ar", budgetRaw = "120"] = process.argv;
const ROOT = process.cwd();
const html = join(ROOT, ".next/server/app", `${page}.html`);
if (!existsSync(html)) {
  console.error(`No ${html}. Run \`npm run build\` first (the prerendered HTML is the source).`);
  process.exit(1);
}

const tags = readFileSync(html, "utf8").match(/<script\b[^>]*\bsrc="[^"]+"[^>]*>/g) || [];
const kB = (n) => (n / 1024).toFixed(1);

let total = 0, totalGz = 0, skipped = 0;
const rows = [];
for (const tag of tags) {
  const src = tag.match(/src="([^"]+)"/)[1];
  if (/\bnomodule\b/i.test(tag)) { skipped++; rows.push({ src, note: "noModule — legacy polyfill, NOT counted" }); continue; }
  if (!src.startsWith("/_next/")) { rows.push({ src, note: "external — not counted" }); continue; }
  const file = join(ROOT, ".next", src.slice("/_next/".length));
  if (!existsSync(file)) { rows.push({ src, note: "MISSING on disk — stale build?" }); continue; }
  const buf = readFileSync(file);
  const br = brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length;
  const gz = gzipSync(buf, { level: 9 }).length;
  total += br; totalGz += gz;
  rows.push({ src, raw: buf.length, br, gz });
}

for (const r of rows) {
  if (r.note) console.log(`  ${r.src.padEnd(46)} ${r.note}`);
  else console.log(`  ${r.src.padEnd(46)} ${kB(r.br).padStart(7)} kB br  (${kB(r.gz)} gz, ${kB(r.raw)} raw)`);
}

const budget = +budgetRaw * 1024;
const head = budget - total;
console.log(`\n/${page}  ${rows.length - skipped} module scripts counted, ${skipped} noModule skipped`);
console.log(`  ${kB(totalGz)} kB gzip`);
console.log(`  ${kB(total)} kB brotli   <- what Vercel actually serves`);
console.log(head >= 0
  ? `  budget ${budgetRaw} kB — ${kB(head)} kB of headroom remains`
  : `  budget ${budgetRaw} kB — OVER by ${kB(-head)} kB`);
process.exit(head >= 0 ? 0 : 1);

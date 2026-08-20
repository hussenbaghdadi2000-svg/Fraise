/* Assert the server is serving THIS build before believing any measurement.
   A `next start` from an earlier session holding the port cost three wrong
   measurements in one day: the new one died with EADDRINUSE, the shell
   backgrounded it so nothing surfaced, and the screenshots came back from a
   dead build whose CSS chunk no longer existed — the page photographed
   completely unstyled and nearly got filed as a migration failure.
   `pkill -f "next start"` does not kill it on Windows; taskkill does.
   Usage: node fresh.mjs [origin=http://localhost:3100] [--kill] */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const origin = args.find((a) => !a.startsWith("--")) || "http://localhost:3100";
const kill = args.includes("--kill");
const port = new URL(origin).port || "80";

/* Column parsing, not a regex on the whole line: netstat's state word is
   localised on non-English Windows, but the column layout is not. */
const listeners = () => {
  try {
    const rows = execSync("netstat -ano -p tcp", { encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.trim().split(/\s+/))
      .filter((f) => f.length >= 5 && f[1].endsWith(":" + port) && /^\d+$/.test(f[4]));
    return [...new Set(rows.map((f) => f[4]))];
  } catch {
    return [];
  }
};

if (kill) {
  const pids = listeners();
  if (!pids.length) console.log(`nothing listening on :${port}`);
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      console.log(`killed pid ${pid} on :${port}`);
    } catch {
      console.log(`could not kill pid ${pid} — check it by hand`);
    }
  }
  process.exit(0);
}

let body;
try {
  body = await (await fetch(origin)).text();
} catch {
  console.log(`!! nothing answering at ${origin} — start it: npx next start -p ${port}`);
  process.exit(1);
}

const assets = [...body.matchAll(/\/_next\/static\/[^"']+\.(?:css|js)/g)].map((m) => m[0]);
if (!assets.length) {
  console.log("!! served page references no /_next/static assets — not a Next build?");
  process.exit(1);
}

const missing = assets.filter((a) => !existsSync(join(process.cwd(), ".next", a.slice("/_next/".length))));
if (missing.length) {
  console.log(`!! STALE — ${missing.length}/${assets.length} served assets are not in .next/`);
  console.log(`   e.g. ${missing[0]}`);
  console.log(`   pids on :${port} — ${listeners().join(", ") || "none found"}`);
  console.log(`   fix: node fresh.mjs ${origin} --kill && npm run build && npx next start -p ${port}`);
  process.exit(1);
}
console.log(`fresh — all ${assets.length} served assets exist in this build (pid ${listeners().join(", ") || "?"} on :${port})`);

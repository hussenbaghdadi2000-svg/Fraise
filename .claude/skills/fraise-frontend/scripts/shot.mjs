/* Scroll-and-capture screenshots of a running page.
   Usage: node shot.mjs <url> <out-prefix> [width=1440] [height=900] [frames=4]
   Writes <out-prefix>-0.png … <out-prefix>-N.png, evenly spaced down the page.
   Always shoot 390 as well as 1440 — five real bugs so far were mobile-only. */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { withSession, wait } from "./cdp.mjs";

const [, , url, out, w = "1440", h = "900", frames = "4"] = process.argv;
if (!url || !out) {
  console.error("usage: node shot.mjs <url> <out-prefix> [width] [height] [frames]");
  process.exit(1);
}
const W = +w, H = +h, N = Math.max(1, +frames);
mkdirSync(dirname(out), { recursive: true });

await withSession({ width: W, height: H }, async (s) => {
  await s.goto(url, 2000);
  const docH = await s.evaluate("document.body.scrollHeight");

  for (let i = 0; i < N; i++) {
    const y = Math.round(Math.max(0, docH - H) * (i / Math.max(1, N - 1)));
    await s.evaluate(`window.scrollTo(0, ${y})`);
    await wait(1400); // let the view-timeline reveals settle at this position
    const shot = await s.send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${out}-${i}.png`, Buffer.from(shot.data, "base64"));
  }
  console.log(`${out}: ${N} frames at ${W}x${H}, doc ${docH}px`);
});
process.exit(0);

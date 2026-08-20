/* Shared CDP session helper.
   Chrome's --screenshot flag uses captureBeyondViewport, which renders the
   page at scroll 0 — so every `animation-timeline: view()` reveal is still at
   opacity 0 and the page photographs blank. Driving Chrome over the DevTools
   protocol is the only way to see this site: scroll for real, then capture. */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  process.env.LOCALAPPDATA && `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function browserPath() {
  const hit = CANDIDATES.find((p) => existsSync(p));
  if (!hit) throw new Error(`No Chrome found. Set CHROME_PATH. Tried:\n  ${CANDIDATES.join("\n  ")}`);
  return hit;
}

/* One debug port per process, so two of these scripts can run at once. */
const port = () => 9300 + (process.pid % 300);

/** Launch headless Chrome, attach to the page target, return a driver. */
export async function session({ width = 1440, height = 900 } = {}) {
  const P = port();
  const chrome = spawn(browserPath(), [
    "--headless=new",
    `--remote-debugging-port=${P}`,
    `--window-size=${width},${height}`,
    "--hide-scrollbars",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "fraise-cdp-"))}`,
    "about:blank",
  ], { stdio: "ignore" });

  // Poll the endpoint instead of sleeping a guessed interval.
  let target;
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${P}/json/list`)).json();
      target = list.find((t) => t.type === "page");
      if (target) break;
    } catch { /* not up yet */ }
    await wait(250);
  }
  if (!target) { chrome.kill(); throw new Error(`Chrome debug port ${P} never came up`); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error("CDP socket failed")); });

  let id = 0;
  const pending = new Map();
  const waiters = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(`${m.error.message} (${m.error.code})`)) : resolve(m.result);
    } else if (m.method && waiters.has(m.method)) {
      waiters.get(m.method).forEach((fn) => fn(m.params));
      waiters.delete(m.method);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const i = ++id;
      pending.set(i, { resolve, reject });
      ws.send(JSON.stringify({ id: i, method, params }));
    });

  const once = (method, ms) => new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms);
    waiters.set(method, [...(waiters.get(method) || []), (p) => { clearTimeout(t); resolve(p); }]);
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 1, mobile: width < 700,
  });

  /** Navigate, wait for load, then let fonts and view-timeline reveals settle. */
  const goto = async (url, settle = 1200) => {
    const loaded = once("Page.loadEventFired", 15000);
    await send("Page.navigate", { url });
    await loaded;
    await wait(settle);
  };

  /** Run an expression in the page and return its value; throws on page errors. */
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    }
    return r.result.value;
  };

  const close = () => { try { ws.close(); } catch {} chrome.kill(); };

  return { send, once, goto, evaluate, close, width, height };
}

/** Fail loudly rather than leaving a headless Chrome running. */
export async function withSession(opts, fn) {
  const s = await session(opts);
  try { return await fn(s); } finally { s.close(); }
}

/**
 * Caps how many <video> elements hold a decoder at once.
 *
 * A decoder is a real, finite hardware resource. A grid of twelve cards
 * each with an attached src will allocate twelve of them; mobile Safari
 * starts refusing to play at around four, and the failure is silent —
 * play() rejects and the card just sits there. So the cap is enforced,
 * not hoped for.
 *
 * THIS IS A MODULE, NOT A REACT CONTEXT — deliberately. A context needs
 * a Provider, a Provider is a Client Component, and it would have to sit
 * above every card in the tree. That single "use client" would pull the
 * whole page into the client bundle and blow a 5 kB budget on its own.
 * A module-level Set is shared by every importer for free, with no
 * component boundary and no re-renders.
 */

const MAX_DECODERS = 2;

interface Slot {
  el: HTMLVideoElement;
  /** The hero keeps its decoder; grid previews compete for the other. */
  pinned: boolean;
}

/** Insertion-ordered: index 0 is the least recently acquired. */
const slots: Slot[] = [];

/**
 * Frees a decoder properly.
 *
 * GOTCHA: `el.src = ""` does NOT free it. An empty string resolves
 * against the document URL, so the browser issues a real request for the
 * page's own HTML, tries to decode it as video, and keeps the decoder
 * alive the whole time. Removing the attribute and calling load() is the
 * only sequence that actually releases it.
 */
function detach(el: HTMLVideoElement): void {
  el.pause();
  el.removeAttribute("src");
  el.load();
}

/**
 * Attaches a source and starts playback, evicting the least recently
 * used unpinned video if we are already at the cap.
 */
export interface AcquireOptions {
  /** The hero keeps its decoder even under pressure. */
  pinned?: boolean;
  /** Mobile: release every other unpinned video first, so exactly one plays. */
  solo?: boolean;
}

export function acquire(
  el: HTMLVideoElement,
  src: string,
  { pinned = false, solo = false }: AcquireOptions = {},
): void {
  if (solo) {
    for (const slot of [...slots]) {
      if (slot.el !== el && !slot.pinned) release(slot.el);
    }
  }

  const existing = slots.findIndex((s) => s.el === el);
  if (existing !== -1) {
    /* Already holding a decoder — move to most-recently-used and replay. */
    slots.push(slots.splice(existing, 1)[0]);
    void el.play().catch(() => {});
    return;
  }

  while (slots.length >= MAX_DECODERS) {
    const victim = slots.findIndex((s) => !s.pinned);
    if (victim === -1) return; /* every slot is pinned; refuse rather than exceed */
    detach(slots[victim].el);
    slots.splice(victim, 1);
  }

  slots.push({ el, pinned });
  el.src = src;
  el.load();
  /* play() rejects on autoplay policy, on a detached element, and when a
     new load() interrupts it. None of those are actionable here, and an
     unhandled rejection would surface as a console error on every hover. */
  void el.play().catch(() => {});
}

/** Releases the decoder held by this element, if any. */
export function release(el: HTMLVideoElement): void {
  const i = slots.findIndex((s) => s.el === el);
  if (i === -1) return;
  slots.splice(i, 1);
  detach(el);
}

/** Pauses without giving up the decoder — a re-hover restarts instantly. */
export function pause(el: HTMLVideoElement): void {
  el.pause();
  el.currentTime = 0;
}

/** The subset of NetworkInformation we rely on. Not in lib.dom yet. */
interface Connection {
  saveData?: boolean;
  effectiveType?: string;
}

/**
 * Whether this visitor should get moving previews at all.
 *
 * Three separate refusals: an accessibility preference, an explicit user
 * request to save data, and a connection too slow for the video to
 * arrive before the pointer leaves. Each one falls back to the poster,
 * which is already on screen — so the refusal costs the visitor nothing.
 */
export function previewsAllowed(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  const connection = (navigator as Navigator & { connection?: Connection })
    .connection;
  if (connection?.saveData) return false;
  return (
    connection?.effectiveType !== "2g" && connection?.effectiveType !== "slow-2g"
  );
}

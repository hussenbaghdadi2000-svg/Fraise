"use client";

import { useEffect, useRef, useState } from "react";
import { acquire, pause, previewsAllowed, release } from "@/lib/video-manager";

/**
 * Plays a silent loop over a poster.
 *
 * A Client Component, and a LEAF — it takes the card's markup as
 * `children`. That markup is still rendered on the SERVER and handed in
 * as an already-rendered tree; this file never imports it, so none of it
 * crosses into the client bundle. Wrapping from the outside instead of
 * importing is what keeps that boundary.
 *
 * ONE COMPONENT, NOT TWO. The architecture doc listed `HoverPreview` and
 * `InViewVideo` separately. They cannot be separate: choosing between
 * them means knowing whether the visitor has a mouse, and the server
 * does not know that. Rendering one or the other would require a
 * client-side branch anyway — so the branch lives here, over a single
 * <video> and a single crossfade, instead of in two components that
 * would both have to ship regardless.
 *
 *   fine pointer   → hover, with an intent delay
 *   coarse pointer → whichever card is crossing the viewport centre
 */

/**
 * Intent delay. Sweeping a cursor diagonally across a grid crosses five
 * cards in under 100ms; without this, all five request a decoder and the
 * one you actually stopped on gets evicted by the ones you passed over.
 */
const INTENT_MS = 120;

export interface PreviewProps {
  src: string;
  /**
   * Hero only. Attaches and plays after first paint instead of waiting
   * for intent, and pins the decoder so grid previews cannot evict it.
   */
  auto?: boolean;
  /** Extra classes on the wrapper. It is always the positioning context. */
  className?: string;
  /**
   * Hero only: render pause and sound controls over the video.
   *
   * The file carries an audio track and starts MUTED — not a style
   * choice, a browser rule: autoplay is only permitted while muted.
   * The button is therefore the only way sound can ever start, which
   * is also the only acceptable way.
   */
  controls?: { pause: string; play: string; sound: string; mute: string };
  children: React.ReactNode;
}

export function Preview({
  src,
  auto = false,
  className = "",
  controls,
  children,
}: PreviewProps) {
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const [visible, setVisible] = useState(false);

  /* Coarse-pointer path: exactly one preview plays, the one crossing the
     middle of the screen. Not tap-to-play — that hides the work behind
     an interaction the brief exists to avoid. Not autoplay-everything —
     that is the jank and the data bill. */
  useEffect(() => {
    const host = hostRef.current;
    const video = videoRef.current;
    if (!host || !video) return;

    if (!previewsAllowed()) return;

    /* Hero path: the poster is the LCP element, so the video must not
       compete with it for bandwidth. Idle means "after the page has
       painted and settled", which is exactly the guarantee needed — and
       it is why the hero still carries no src in the HTML. */
    if (auto) {
      const start = () => acquire(video, src, { pinned: true });
      const supportsIdle = typeof window.requestIdleCallback === "function";
      const handle = supportsIdle
        ? window.requestIdleCallback(start, { timeout: 2000 })
        : window.setTimeout(start, 300);
      return () => {
        if (supportsIdle) window.cancelIdleCallback(handle);
        else window.clearTimeout(handle);
        release(video);
      };
    }

    /* A mouse gets the hover path below instead. */
    if (window.matchMedia("(hover: hover)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          acquire(video, src, { solo: true });
        } else {
          pause(video);
          setVisible(false);
        }
      },
      /* A zero-height band across the middle of the viewport: negative
         margins of 50% top and bottom collapse the root to a line, so an
         element "intersects" only while it crosses the centre. That
         gives nearest-to-centre for free — no scroll listener, no
         rAF throttle, no getBoundingClientRect on every frame. */
      { rootMargin: "-50% 0px -50% 0px" },
    );
    observer.observe(host);

    return () => {
      observer.disconnect();
      release(video);
    };
  }, [src, auto]);

  /* GOTCHA: clearing the intent timer on pointerleave is not enough.
     Navigating away mid-delay unmounts with the timer still pending, and
     it then fires against a detached element. */
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      window.clearTimeout(timerRef.current);
      if (video) release(video);
    };
  }, []);

  function handleEnter(event: React.PointerEvent<HTMLDivElement>) {
    /* GOTCHA: a touch tap fires pointerenter too, and never fires a
       matching pointerleave — so without this guard a tap would start a
       video on mobile that could never be stopped. */
    if (auto || event.pointerType !== "mouse" || !previewsAllowed()) return;

    timerRef.current = window.setTimeout(() => {
      if (videoRef.current) acquire(videoRef.current, src);
    }, INTENT_MS);
  }

  function handleLeave() {
    if (auto) return;
    window.clearTimeout(timerRef.current);
    setVisible(false);
    /* Paused, not released: the decoder stays so a re-hover is instant.
       The manager's cap still guarantees at most two exist. */
    if (videoRef.current) pause(videoRef.current);
  }

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().catch(() => {});
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  function toggleSound() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }

  return (
    <div
      ref={hostRef}
      className={`relative ${className}`}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      {children}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        /* No src, and preload="none" — the poster must win the LCP race.
           A source is attached only after intent. */
        preload="none"
        aria-hidden
        tabIndex={-1}
        /* Crossfade on `playing`, not on hover: fading in any earlier
           reveals an undecoded black frame. */
        onPlaying={() => setVisible(true)}
        /* The manager fires this when it evicts us; without it the
           element stays faded in over an emptied video. */
        onEmptied={() => setVisible(false)}
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-[240ms] ease-cine ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Hero controls. Two buttons, mono, on a hairline — the same
          language as the slate rather than a media-player chrome. */}
      {controls && (
        <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center">
          <div className="u-caps flex items-center gap-4 border border-hairline bg-ink/70 px-4 py-2 font-mono text-label text-bone">
            <button type="button" onClick={togglePlay} className="cursor-pointer transition-colors duration-300 hover:text-fraise">
              {playing ? controls.pause : controls.play}
            </button>
            <span aria-hidden className="h-3 w-px bg-hairline" />
            <button type="button" onClick={toggleSound} className="cursor-pointer transition-colors duration-300 hover:text-fraise">
              {muted ? controls.sound : controls.mute}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

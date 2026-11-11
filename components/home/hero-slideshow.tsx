"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export interface SlideData {
  id: string;
  heading: string | null;
  subheading: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
}

const AUTOPLAY_MS = 6500;
const DEFAULT_SUB = "Speed. Precision. Discipline. The official home of UMaT SRID Railers basketball.";

/** "Season opener / Saturday 6pm" → first line white, second line gold. No heading → the classic Railers tagline. */
function Heading({ text }: { text: string | null }) {
  const [first, second] = text ? text.split(/\s+\/\s+/, 2) : ["BUILT TO MOVE.", "BUILT TO WIN."];
  return (
    <h1 className="mt-5 font-display text-[13vw] leading-[0.88] tracking-tight text-rail-white sm:text-7xl lg:text-[8rem] text-balance [text-shadow:0_2px_24px_rgba(0,0,0,.45)]">
      {first}
      {second && (
        <>
          <br />
          <span className="text-rail-gold">{second}</span>
        </>
      )}
    </h1>
  );
}

/**
 * Photo slideshow behind the classic Railers hero copy. The outgoing photo stays opaque beneath the incoming one,
 * so the page background never shows through mid-fade. Arrows, dots, swipe and a pause button; autoplay only with 2+ slides.
 */
export function HeroSlideshow({ slides }: { slides: SlideData[] }) {
  const n = slides.length;
  const [st, setSt] = useState<{ i: number; prev: number | null }>({ i: 0, prev: null });
  const [playing, setPlaying] = useState(true);
  const startX = useRef<number | null>(null);

  const go = useCallback((d: number) => setSt((x) => ({ i: (x.i + d + n) % n, prev: x.i })), [n]);
  const goTo = useCallback((k: number) => setSt((x) => (k === x.i ? x : { i: k, prev: x.i })), []);

  useEffect(() => {
    if (st.prev === null) return;
    const t = setTimeout(() => setSt((x) => ({ ...x, prev: null })), 1500);
    return () => clearTimeout(t);
  }, [st]);

  useEffect(() => {
    if (n < 2 || !playing) return;
    const t = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [n, playing, go, st.i]);

  const s = slides[st.i];
  const arrow =
    "absolute top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/25 bg-rail-bg/40 text-rail-white backdrop-blur-sm transition-colors hover:border-rail-gold hover:text-rail-gold sm:flex";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative flex min-h-[78svh] items-center overflow-hidden border-b border-rail-line bg-rail-bg"
      onPointerDown={(e) => {
        startX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (startX.current !== null && n > 1) {
          const dx = e.clientX - startX.current;
          if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
        }
        startX.current = null;
      }}
    >
      <div className="absolute inset-0" aria-hidden="true">
        {slides.map((sl, k) => (
          <Image
            key={sl.id}
            src={sl.imageUrl}
            alt=""
            fill
            priority={k === 0}
            sizes="100vw"
            className="object-cover object-[50%_30%] transition-opacity duration-[1400ms]"
            style={{ opacity: k === st.i || k === st.prev ? 1 : 0, zIndex: k === st.i ? 2 : k === st.prev ? 1 : 0 }}
          />
        ))}
        {/* Left-weighted shade keeps the copy readable while the right side of the photo stays clear. */}
        <div className="absolute inset-0 z-[3] bg-gradient-to-r from-rail-bg/85 via-rail-bg/45 to-rail-bg/10" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-t from-rail-bg/60 via-transparent to-transparent" />
        <div
          className="absolute inset-0 z-[3] opacity-[0.06]"
          style={{ backgroundImage: "repeating-linear-gradient(115deg, #F5A900 0px, #F5A900 2px, transparent 2px, transparent 90px)" }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-28">
        <div key={s.id} className="animate-[heroIn_700ms_ease_both]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rail-gold">
            UMaT School of Rail &amp; Infrastructure Development
          </p>
          <Heading text={s.heading} />
          <p className="mt-6 max-w-md text-lg text-rail-silver [text-shadow:0_1px_12px_rgba(0,0,0,.5)]">{s.subheading || DEFAULT_SUB}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            {s.ctaLabel && s.ctaHref ? (
              <ButtonLink href={s.ctaHref} size="lg">
                {s.ctaLabel}
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href="/team" size="lg">
                  View the team
                </ButtonLink>
                <ButtonLink href="/schedule" variant="outline" size="lg">
                  Next game
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      </div>

      {n > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className={`${arrow} left-3 lg:left-6`}>
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next slide" className={`${arrow} right-3 lg:right-6`}>
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-2">
            {slides.map((sl, k) => (
              <button
                key={sl.id}
                type="button"
                aria-label={`Go to slide ${k + 1}`}
                aria-current={k === st.i}
                onClick={() => goTo(k)}
                className="h-[3px] transition-all duration-300"
                style={{ width: k === st.i ? 32 : 14, background: k === st.i ? "#F5A900" : "rgba(255,255,255,.45)" }}
              />
            ))}
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              className="ml-3 grid h-7 w-7 place-items-center rounded-full border border-white/40 text-rail-white hover:border-rail-gold hover:text-rail-gold"
            >
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

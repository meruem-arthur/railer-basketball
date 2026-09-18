import { ButtonLink } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-rail-line">
      {/* Speed-line / track motif, restrained: a handful of angled strokes fading right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, #F5A900 0px, #F5A900 2px, transparent 2px, transparent 90px)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rail-gold">
          UMaT School of Rail &amp; Infrastructure Development
        </p>
        <h1 className="mt-5 font-display text-[15vw] leading-[0.85] tracking-tight text-rail-white sm:text-8xl lg:text-[9rem] text-balance">
          BUILT TO MOVE.
          <br />
          <span className="text-rail-gold">BUILT TO WIN.</span>
        </h1>
        <p className="mt-6 max-w-md text-lg text-rail-silver">
          Speed. Precision. Discipline. The official home of UMaT SRID Railers basketball.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <ButtonLink href="/team" size="lg">
            View the team
          </ButtonLink>
          <ButtonLink href="/schedule" variant="outline" size="lg">
            Next game
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

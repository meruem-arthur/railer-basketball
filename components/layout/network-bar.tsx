import { NETWORK } from "@/lib/config/network";

/** Thin strip linking the sister sites. Sits above the sticky navbar and scrolls away with the page. */
export default function NetworkBar() {
  return (
    <div className="border-b border-rail-line bg-rail-navy text-[11px] tracking-[0.18em] text-rail-silver">
      <nav
        aria-label="UMaT SRC sites"
        className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto whitespace-nowrap px-4 py-1.5 sm:px-6 lg:px-8"
      >
        <span className="hidden shrink-0 text-rail-silver/50 sm:inline">UMAT SRID SRC</span>
        {NETWORK.map((n) =>
          n.key === "railers" ? (
            <span key={n.key} aria-current="page" className="shrink-0 font-semibold text-rail-gold">
              {n.label.toUpperCase()}
            </span>
          ) : (
            <a key={n.key} href={n.href} className="shrink-0 transition-colors hover:text-rail-gold">
              {n.label.toUpperCase()} ↗
            </a>
          ),
        )}
      </nav>
    </div>
  );
}

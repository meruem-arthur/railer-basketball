import Link from "next/link";
import { getSiteSettings } from "@/lib/services/settings";
import NavbarClient from "./navbar-client";

const NAV_LINKS = [
  { href: "/team", label: "Team" },
  { href: "/schedule", label: "Schedule" },
  { href: "/results", label: "Results" },
  { href: "/stats", label: "Stats" },
  { href: "/news", label: "News" },
  { href: "/gallery", label: "Gallery" },
  { href: "/tryouts", label: "Tryouts" },
];

export default async function Navbar() {
  const settings = await getSiteSettings().catch(() => null);
  const teamName = settings?.teamName ?? "UMaT SRID Railers";

  return (
    <header className="sticky top-0 z-40 border-b border-rail-line bg-rail-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <Link href="/" className="flex items-center gap-2 font-display text-xl tracking-tight">
          <span className="text-rail-gold">RAILERS</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-rail-silver hover:text-rail-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/tryouts"
            className="inline-flex items-center bg-rail-gold px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-rail-bg hover:bg-rail-gold-bright transition-colors"
          >
            Join the team
          </Link>
        </div>

        <NavbarClient links={NAV_LINKS} teamName={teamName} />
      </div>
    </header>
  );
}

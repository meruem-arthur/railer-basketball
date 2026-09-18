import Link from "next/link";
import { Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import { getSiteSettings, getActiveSocialLinks } from "@/lib/services/settings";

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  x: Twitter,
  twitter: Twitter,
};

const FOOTER_LINKS = [
  { href: "/team", label: "Team" },
  { href: "/schedule", label: "Schedule" },
  { href: "/news", label: "News" },
  { href: "/gallery", label: "Gallery" },
  { href: "/tryouts", label: "Tryouts" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default async function Footer() {
  const [settings, socials] = await Promise.all([
    getSiteSettings().catch(() => null),
    getActiveSocialLinks().catch(() => []),
  ]);

  return (
    <footer className="border-t border-rail-line bg-rail-navy/40 mt-24">
      <div className="rail-divider" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <p className="font-display text-3xl tracking-tight text-rail-gold">RAILERS</p>
            <p className="mt-2 text-sm text-rail-silver">
              {settings?.slogan ?? "Speed. Precision. Victory."}
            </p>
            <p className="mt-6 text-sm text-rail-silver max-w-xs">
              Official home of the {settings?.teamName ?? "UMaT SRID Railers"}, representing the
              School of Rail and Infrastructure Development at the University of Mines and
              Technology, Ghana.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rail-silver mb-4">
              Navigate
            </p>
            <nav className="flex flex-col gap-2.5">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-rail-white/90 hover:text-rail-gold transition-colors w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rail-silver mb-4">
              Connect
            </p>
            {settings?.contactEmail && (
              <p className="text-sm text-rail-white/90">{settings.contactEmail}</p>
            )}
            {settings?.venue && <p className="text-sm text-rail-silver mt-1">{settings.venue}</p>}

            {socials.length > 0 && (
              <div className="flex gap-3 mt-5">
                {socials.map((s) => {
                  const Icon = SOCIAL_ICONS[s.platform.toLowerCase()] ?? null;
                  return (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      className="flex h-9 w-9 items-center justify-center border border-rail-line text-rail-silver hover:border-rail-gold hover:text-rail-gold transition-colors"
                    >
                      {Icon ? <Icon className="h-4 w-4" /> : s.platform[0]}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-rail-line flex flex-col sm:flex-row justify-between gap-2 text-xs text-rail-silver">
          <p>© {new Date().getFullYear()} {settings?.teamName ?? "UMaT SRID Railers"}. All rights reserved.</p>
          <Link href="/admin/login" className="hover:text-rail-white">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}

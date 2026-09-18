import Link from "next/link";
import { getSiteSettings, getActiveSocialLinks } from "@/lib/services/settings";

// lucide-react v1 removed brand/logo icons (Instagram, Facebook, Youtube,
// Twitter, etc.) for trademark reasons — see https://lucide.dev/guide/version-1
// So these are small inline SVGs instead of lucide imports.
type IconProps = { className?: string };

function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
  x: XIcon,
  twitter: XIcon,
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

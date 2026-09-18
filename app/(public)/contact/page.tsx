import type { Metadata } from "next";
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import { getSiteSettings, getActiveSocialLinks } from "@/lib/services/settings";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with UMaT SRID Railers.",
};

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  x: Twitter,
  twitter: Twitter,
};

export default async function ContactPage() {
  const [settings, socials] = await Promise.all([getSiteSettings(), getActiveSocialLinks()]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-rail-gold">Contact</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl tracking-tight text-rail-white text-balance">
        Get in touch.
      </h1>

      <div className="mt-12 grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-5">
          {settings.contactEmail && (
            <div className="flex items-center gap-3 text-rail-silver">
              <Mail className="h-4 w-4 text-rail-gold shrink-0" />
              <span>{settings.contactEmail}</span>
            </div>
          )}
          {settings.contactPhone && (
            <div className="flex items-center gap-3 text-rail-silver">
              <Phone className="h-4 w-4 text-rail-gold shrink-0" />
              <span>{settings.contactPhone}</span>
            </div>
          )}
          {settings.venue && (
            <div className="flex items-center gap-3 text-rail-silver">
              <MapPin className="h-4 w-4 text-rail-gold shrink-0" />
              <span>{settings.venue}</span>
            </div>
          )}

          {socials.length > 0 && (
            <div className="flex gap-3 pt-4">
              {socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.platform.toLowerCase()];
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    className="flex h-10 w-10 items-center justify-center border border-rail-line text-rail-silver hover:border-rail-gold hover:text-rail-gold transition-colors"
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : s.platform[0]}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

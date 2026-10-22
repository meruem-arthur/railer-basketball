"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function NavbarClient({
  links,
  teamName,
  sites = [],
}: {
  links: { href: string; label: string }[];
  teamName: string;
  sites?: { key: string; label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="p-2 text-rail-white"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-16 bottom-0 z-30 bg-rail-bg overflow-y-auto"
        >
          <nav aria-label="Mobile" className="flex flex-col px-6 py-8 gap-1">
            <p className="font-display text-2xl text-rail-gold mb-4">{teamName}</p>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3.5 border-b border-rail-line text-lg font-medium text-rail-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/tryouts"
              className="mt-6 inline-flex items-center justify-center bg-rail-gold px-5 py-3.5 text-sm font-semibold uppercase tracking-wide text-rail-bg"
            >
              Join the team
            </Link>

            {sites.length > 0 && (
              <div className="mt-8 border-t border-rail-line pt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rail-silver">UMaT SRID SRC</p>
                {sites.map((site) => (
                  <a key={site.key} href={site.href} className="block py-2 text-base text-rail-silver hover:text-rail-gold">
                    ← {site.label}
                  </a>
                ))}
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/settings";
import { prisma } from "@/lib/db/prisma";
import { SettingsForm } from "@/components/admin/settings-form";
import { SocialLinksManager } from "@/components/admin/social-links-manager";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const [settings, socialLinks] = await Promise.all([
    getSiteSettings(),
    prisma.socialLink.findMany({ orderBy: { platform: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight text-rail-white mb-8">Settings</h1>

      <section className="mb-14">
        <h2 className="font-display text-2xl tracking-tight text-rail-white mb-5">Site Information</h2>
        <SettingsForm settings={settings} />
      </section>

      <section className="border-t border-rail-line pt-10">
        <h2 className="font-display text-2xl tracking-tight text-rail-white mb-5">Social Links</h2>
        <SocialLinksManager links={socialLinks} />
      </section>
    </div>
  );
}

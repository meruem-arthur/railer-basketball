import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/settings";

export const metadata: Metadata = {
  title: "About",
  description: "About UMaT SRID Railers basketball team.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-rail-gold">About</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl tracking-tight text-rail-white text-balance">
        {settings.teamName}
      </h1>
      <p className="mt-4 text-rail-silver">{settings.slogan}</p>

      <div className="mt-10 space-y-5 text-rail-silver leading-relaxed">
        {settings.aboutText ? (
          <p className="whitespace-pre-line">{settings.aboutText}</p>
        ) : (
          <>
            <p>
              UMaT SRID Railers is the official basketball team of the School of Rail and
              Infrastructure Development at the University of Mines and Technology, Ghana. The
              Railers identity combines basketball with the discipline, precision, and forward
              momentum of railway engineering.
            </p>
            <p>
              On the court, the Railers compete with the same values that define the engineers
              who carry the SRID name: speed, precision, and relentless discipline.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

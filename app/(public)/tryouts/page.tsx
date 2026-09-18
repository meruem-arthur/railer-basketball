import type { Metadata } from "next";
import { TryoutForm } from "@/components/tryouts/tryout-form";

export const metadata: Metadata = {
  title: "Tryouts",
  description: "Apply to try out for the UMaT SRID Railers basketball team.",
};

export default function TryoutsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-rail-gold">Tryouts</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl tracking-tight text-rail-white text-balance">
        Your journey starts here.
      </h1>
      <p className="mt-4 max-w-xl text-rail-silver">
        Fill out the form below to apply for a tryout with UMaT SRID Railers. Our coaching staff
        reviews every application.
      </p>

      <div className="mt-12">
        <TryoutForm />
      </div>
    </div>
  );
}

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-8xl text-rail-gold">404</p>
      <h1 className="mt-4 font-display text-3xl tracking-tight text-rail-white">
        This track doesn't lead anywhere.
      </h1>
      <p className="mt-3 text-rail-silver">
        The page you're looking for has been moved or doesn't exist.
      </p>
      <div className="mt-8 flex gap-4">
        <ButtonLink href="/">Back to home</ButtonLink>
        <Link
          href="/schedule"
          className="inline-flex items-center px-6 py-3 text-sm font-semibold uppercase tracking-wide text-rail-silver hover:text-rail-white"
        >
          View schedule
        </Link>
      </div>
    </div>
  );
}

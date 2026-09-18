"use client";

import { useEffect } from "react";
import { ButtonLink } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-rail-bg text-rail-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="font-display text-7xl text-rail-gold">500</p>
          <h1 className="mt-4 font-display text-2xl tracking-tight">Something went wrong.</h1>
          <p className="mt-3 text-rail-silver">
            An unexpected error occurred. Our team has been notified.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center bg-rail-gold px-6 py-3 text-sm font-semibold uppercase tracking-wide text-rail-bg"
            >
              Try again
            </button>
            <ButtonLink href="/" variant="outline">
              Home
            </ButtonLink>
          </div>
        </div>
      </body>
    </html>
  );
}

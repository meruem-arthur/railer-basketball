"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function computeTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export function Countdown({ target }: { target: string }) {
  const targetDate = new Date(target);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(computeTimeLeft(targetDate));
    const interval = setInterval(() => {
      setTimeLeft(computeTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  // Render a stable placeholder until mounted, so SSR/CSR markup matches.
  const display = timeLeft ?? { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };

  const units: { label: string; value: number }[] = [
    { label: "Days", value: display.days },
    { label: "Hours", value: display.hours },
    { label: "Min", value: display.minutes },
    { label: "Sec", value: display.seconds },
  ];

  if (timeLeft?.expired) {
    return (
      <p className="font-display text-2xl text-rail-gold tracking-tight">Tip-off is here</p>
    );
  }

  return (
    <div className="flex gap-3" role="timer" aria-live="off">
      {units.map((u) => (
        <div key={u.label} className="text-center min-w-[3.25rem]">
          <div className="font-display text-3xl sm:text-4xl tabular-nums text-rail-white">
            {String(u.value).padStart(2, "0")}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-rail-silver mt-1">
            {u.label}
          </div>
        </div>
      ))}
    </div>
  );
}

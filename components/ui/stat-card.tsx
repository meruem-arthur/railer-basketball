import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  suffix,
  highlight = false,
  className,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-rail-line bg-rail-navy/50 px-5 py-6 text-center",
        highlight && "border-rail-gold/50 bg-rail-gold/[0.06]",
        className
      )}
    >
      <div
        className={cn(
          "font-display text-4xl leading-none tabular-nums",
          highlight ? "text-rail-gold" : "text-rail-white"
        )}
      >
        {value}
        {suffix && <span className="text-lg align-top ml-0.5">{suffix}</span>}
      </div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-rail-silver">
        {label}
      </div>
    </div>
  );
}

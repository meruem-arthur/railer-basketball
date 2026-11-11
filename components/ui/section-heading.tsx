import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  action,
  className,
  compact = false,
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
  /** When a page banner already shows the title, render only the action (if any). */
  compact?: boolean;
}) {
  if (compact) return action ? <div className="mb-10 flex justify-end">{action}</div> : null;
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 mb-10",
        align === "center" && "flex-col items-center text-center",
        className
      )}
    >
      <div className={cn(align === "center" && "max-w-2xl")}>
        <h2 className="font-display text-4xl sm:text-5xl leading-[0.95] tracking-tight text-rail-white text-balance">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 max-w-xl text-rail-silver">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

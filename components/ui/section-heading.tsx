import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
}) {
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

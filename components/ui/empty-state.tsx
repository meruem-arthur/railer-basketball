import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 border border-dashed border-rail-line px-6 py-16 text-center",
        className
      )}
    >
      {Icon && <Icon className="h-8 w-8 text-rail-silver/50" aria-hidden="true" />}
      <p className="font-display text-2xl tracking-tight text-rail-white">{title}</p>
      {description && <p className="max-w-sm text-sm text-rail-silver">{description}</p>}
    </div>
  );
}

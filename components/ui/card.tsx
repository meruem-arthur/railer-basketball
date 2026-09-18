import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "border border-rail-line bg-rail-navy/60 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

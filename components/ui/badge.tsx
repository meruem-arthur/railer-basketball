import { cn } from "@/lib/utils/cn";

export type BadgeTone =
  | "win"
  | "loss"
  | "upcoming"
  | "live"
  | "completed"
  | "postponed"
  | "cancelled"
  | "gold"
  | "neutral"
  | "urgent"
  | "important";

const toneClasses: Record<BadgeTone, string> = {
  win: "bg-rail-win/15 text-rail-win border-rail-win/40",
  loss: "bg-rail-loss/15 text-rail-loss border-rail-loss/40",
  upcoming: "bg-rail-silver/10 text-rail-silver border-rail-silver/30",
  live: "bg-rail-orange/15 text-rail-orange border-rail-orange/40 animate-pulse",
  completed: "bg-rail-silver/10 text-rail-silver border-rail-silver/30",
  postponed: "bg-rail-gold/10 text-rail-gold border-rail-gold/30",
  cancelled: "bg-rail-loss/10 text-rail-loss/70 border-rail-loss/30",
  gold: "bg-rail-gold/15 text-rail-gold border-rail-gold/40",
  neutral: "bg-white/5 text-rail-silver border-rail-line",
  urgent: "bg-rail-loss/15 text-rail-loss border-rail-loss/40",
  important: "bg-rail-gold/15 text-rail-gold border-rail-gold/40",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONE: Record<string, BadgeTone> = {
  UPCOMING: "upcoming",
  LIVE: "live",
  COMPLETED: "completed",
  POSTPONED: "postponed",
  CANCELLED: "cancelled",
};

export function GameStatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{status}</Badge>;
}

export function ResultBadge({ won }: { won: boolean }) {
  return <Badge tone={won ? "win" : "loss"}>{won ? "Win" : "Loss"}</Badge>;
}

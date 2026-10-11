import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ActivityStatus } from "@/lib/types";
import {
  Ban,
  CheckCircle2,
  Clock3,
  Lock,
  PauseCircle,
  Radio,
  ShieldCheck,
  Unlock,
} from "lucide-react";

const map: Record<
  ActivityStatus,
  { label: string; className: string; icon: ReactNode }
> = {
  locked: {
    label: "Gesperrt",
    className: "bg-slate-500/20 text-slate-300",
    icon: <Lock className="h-3.5 w-3.5" />,
  },
  pending: {
    label: "Wartet auf Lehrer",
    className: "bg-amber-500/20 text-amber-300",
    icon: <Clock3 className="h-3.5 w-3.5" />,
  },
  approved: {
    label: "Freigegeben",
    className: "bg-sky-500/20 text-sky-300",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  released: {
    label: "Freigeschaltet",
    className: "bg-emerald-500/20 text-emerald-300",
    icon: <Unlock className="h-3.5 w-3.5" />,
  },
  active: {
    label: "Aktiv",
    className: "bg-emerald-500/25 text-emerald-200",
    icon: <Radio className="h-3.5 w-3.5" />,
  },
  paused: {
    label: "Pausiert",
    className: "bg-orange-500/20 text-orange-300",
    icon: <PauseCircle className="h-3.5 w-3.5" />,
  },
  completed: {
    label: "Fertig",
    className: "bg-violet-500/20 text-violet-300",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  revoked: {
    label: "Zurückgezogen",
    className: "bg-rose-500/20 text-rose-300",
    icon: <Ban className="h-3.5 w-3.5" />,
  },
  draft: {
    label: "Entwurf",
    className: "bg-slate-500/20 text-slate-300",
    icon: <Clock3 className="h-3.5 w-3.5" />,
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ActivityStatus;
  className?: string;
}) {
  const item = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        item.className,
        className
      )}
    >
      {item.icon}
      {item.label}
    </span>
  );
}

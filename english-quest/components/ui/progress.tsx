import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-white/10", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all",
          barClassName
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

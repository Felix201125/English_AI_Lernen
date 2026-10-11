import type { ActivityLogEntry } from "@/lib/types";

export function createLog(
  partial: Omit<ActivityLogEntry, "id" | "timestamp"> & {
    timestamp?: string;
  }
): ActivityLogEntry {
  const now = new Date();
  const timestamp =
    partial.timestamp ??
    now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp,
    ...partial,
  };
}

export function filterLogs(
  logs: ActivityLogEntry[],
  category: ActivityLogEntry["category"] | "All"
) {
  if (category === "All") return logs;
  return logs.filter((l) => l.category === category);
}

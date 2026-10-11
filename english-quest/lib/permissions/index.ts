import type { LessonPermissions, PermissionMode } from "@/lib/types";

export function canPerform(
  permissions: LessonPermissions,
  key: keyof LessonPermissions,
  opts?: { hasApproval?: boolean; requested?: boolean }
): boolean {
  const mode = permissions[key];
  switch (mode) {
    case "allowed":
      return true;
    case "disabled":
      return false;
    case "teacher-approval":
      return Boolean(opts?.hasApproval);
    case "available-after-request":
      return Boolean(opts?.hasApproval || opts?.requested);
    default:
      return false;
  }
}

export function permissionLabel(mode: PermissionMode): string {
  switch (mode) {
    case "allowed":
      return "Erlaubt";
    case "disabled":
      return "Gesperrt";
    case "teacher-approval":
      return "Lehrer-Freigabe nötig";
    case "available-after-request":
      return "Nach Anfrage";
  }
}

export function cyclePermission(mode: PermissionMode): PermissionMode {
  const order: PermissionMode[] = [
    "allowed",
    "teacher-approval",
    "available-after-request",
    "disabled",
  ];
  return order[(order.indexOf(mode) + 1) % order.length];
}

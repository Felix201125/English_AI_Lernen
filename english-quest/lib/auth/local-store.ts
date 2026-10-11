import type { AuthUser, UserRole } from "./types";

const USERS_KEY = "qestra.local.users";

type LocalUser = AuthUser & {
  passwordHash?: string;
  googleSub?: string | null;
  createdAt?: string;
};

function loadUsers(): LocalUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as LocalUser[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveUsers(users: LocalUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublic(user: LocalUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    studentId: user.studentId,
    hasPassword: Boolean(user.passwordHash),
    hasGoogle: Boolean(user.googleSub),
    createdAt: user.createdAt ?? null,
  };
}

/** Einfacher Hash nur für lokalen Offline-Modus (kein PHP). */
async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`qestra:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function localRegister(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string | null;
}): Promise<AuthUser> {
  const email = input.email.toLowerCase().trim();
  const users = loadUsers();
  if (users.some((u) => u.email === email)) {
    throw new Error("Diese E-Mail ist bereits registriert.");
  }
  const id = `u-${Date.now().toString(36)}`;
  const user: LocalUser = {
    id,
    email,
    name: input.name.trim(),
    role: input.role,
    studentId:
      input.role === "student"
        ? input.studentId || `s-${id.slice(2)}`
        : null,
    passwordHash: await hashPassword(input.password),
    googleSub: null,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return toPublic(user);
}

export async function localLogin(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const users = loadUsers();
  const found = users.find((u) => u.email === email.toLowerCase().trim());
  if (!found?.passwordHash) return null;
  const hash = await hashPassword(password);
  if (hash !== found.passwordHash) return null;
  return toPublic(found);
}

export function localGoogleAuth(input: {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  studentId?: string | null;
}): AuthUser {
  const email = input.email.toLowerCase().trim();
  const users = loadUsers();
  let found = users.find(
    (u) => u.googleSub === input.sub || u.email === email
  );
  if (!found) {
    const id = `u-g-${input.sub.slice(0, 12)}`;
    found = {
      id,
      email,
      name: input.name.trim() || email.split("@")[0],
      role: input.role,
      studentId:
        input.role === "student"
          ? input.studentId || `s-${id.slice(2)}`
          : null,
      googleSub: input.sub,
      createdAt: new Date().toISOString(),
    };
    users.push(found);
    saveUsers(users);
  } else {
    found.googleSub = input.sub;
    if (!found.name && input.name) found.name = input.name;
    saveUsers(users);
  }
  return toPublic(found);
}

export async function localUpdateProfile(
  userId: string,
  input: { name: string; email: string }
): Promise<AuthUser> {
  const users = loadUsers();
  const email = input.email.toLowerCase().trim();
  if (
    users.some((u) => u.id !== userId && u.email === email)
  ) {
    throw new Error("Diese E-Mail ist bereits vergeben.");
  }
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) throw new Error("Konto nicht gefunden.");
  users[idx] = {
    ...users[idx],
    name: input.name.trim(),
    email,
  };
  saveUsers(users);
  return toPublic(users[idx]);
}

export async function localChangePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<AuthUser> {
  if (newPassword.length < 8) {
    throw new Error("Neues Passwort mindestens 8 Zeichen.");
  }
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) throw new Error("Konto nicht gefunden.");
  const user = users[idx];
  if (!user.passwordHash) {
    throw new Error("Kein Passwort gesetzt — bitte zuerst ein Passwort festlegen.");
  }
  const cur = await hashPassword(currentPassword);
  if (cur !== user.passwordHash) {
    throw new Error("Aktuelles Passwort ist falsch.");
  }
  users[idx] = {
    ...user,
    passwordHash: await hashPassword(newPassword),
  };
  saveUsers(users);
  return toPublic(users[idx]);
}

export async function localSetPassword(
  userId: string,
  newPassword: string
): Promise<AuthUser> {
  if (newPassword.length < 8) {
    throw new Error("Passwort mindestens 8 Zeichen.");
  }
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) throw new Error("Konto nicht gefunden.");
  if (users[idx].passwordHash) {
    throw new Error("Passwort bereits gesetzt — bitte ändern.");
  }
  users[idx] = {
    ...users[idx],
    passwordHash: await hashPassword(newPassword),
  };
  saveUsers(users);
  return toPublic(users[idx]);
}

export async function localDeleteAccount(input: {
  userId: string;
  email: string;
  confirm: string;
  password?: string;
}): Promise<void> {
  const confirmOk =
    input.confirm === "LÖSCHEN" || input.confirm === "LOESCHEN";
  if (!confirmOk) {
    throw new Error("Bitte zur Bestätigung LÖSCHEN eintippen.");
  }
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === input.userId);
  if (idx < 0) throw new Error("Konto nicht gefunden.");
  const user = users[idx];
  if (user.email !== input.email.toLowerCase().trim()) {
    throw new Error("E-Mail stimmt nicht überein.");
  }
  if (user.passwordHash) {
    const hash = await hashPassword(input.password || "");
    if (hash !== user.passwordHash) {
      throw new Error("Passwort zur Löschung erforderlich.");
    }
  }
  users.splice(idx, 1);
  saveUsers(users);
}

/** JWT-Payload ohne Verifikation — nur Offline-Fallback. */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

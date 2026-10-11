import {
  decodeJwtPayload,
  localChangePassword,
  localDeleteAccount,
  localGoogleAuth,
  localLogin,
  localRegister,
  localSetPassword,
  localUpdateProfile,
} from "./local-store";
import {
  clearSession,
  loadSession,
  saveSession,
} from "./session";
import type { AuthSession, AuthUser, UserRole } from "./types";

function apiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AI_API_BASE?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "";
}

type PostResult =
  | { kind: "offline" }
  | { kind: "session"; session: AuthSession }
  | { kind: "user"; user: AuthUser }
  | { kind: "ok"; deleted?: boolean }
  | { kind: "error"; error: string };

async function postAuth(
  body: Record<string, unknown>,
  withAuth = false
): Promise<PostResult> {
  const base = apiBase();
  if (!base || typeof window === "undefined") return { kind: "offline" };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const session = loadSession();
  if (withAuth && session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  try {
    const res = await fetch(`${base}/auth.php`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return { kind: "offline" };
    }
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      token?: string;
      user?: AuthUser;
      deleted?: boolean;
    };
    if (!res.ok || !data.ok) {
      return { kind: "error", error: data.error || "Anfrage fehlgeschlagen." };
    }
    if (data.token && data.user) {
      return { kind: "session", session: { token: data.token, user: data.user } };
    }
    if (data.user) {
      return { kind: "user", user: data.user };
    }
    return { kind: "ok", deleted: data.deleted };
  } catch {
    return { kind: "offline" };
  }
}

function requireLocalUser(): AuthUser {
  const session = loadSession();
  if (!session?.user) throw new Error("Nicht angemeldet.");
  return session.user;
}

function persistUser(user: AuthUser): AuthUser {
  const session = loadSession();
  if (session) saveSession({ ...session, user });
  return user;
}

export async function fetchGoogleClientId(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  if (fromEnv) return fromEnv;

  const base = apiBase();
  if (!base || typeof window === "undefined") return "";
  try {
    const res = await fetch(`${base}/auth.php`, { method: "GET" });
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return "";
    const data = (await res.json()) as {
      ok?: boolean;
      googleClientId?: string;
    };
    return data.googleClientId || "";
  } catch {
    return "";
  }
}

export async function registerRequest(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<AuthSession> {
  const result = await postAuth({ action: "register", ...input });
  if (result.kind === "session") {
    saveSession(result.session);
    return result.session;
  }
  if (result.kind === "error") throw new Error(result.error);

  const user = await localRegister(input);
  const session = { token: `local-${user.id}-${Date.now()}`, user };
  saveSession(session);
  return session;
}

export async function loginRequest(
  email: string,
  password: string
): Promise<AuthSession> {
  const result = await postAuth({ action: "login", email, password });
  if (result.kind === "session") {
    saveSession(result.session);
    return result.session;
  }
  if (result.kind === "error") throw new Error(result.error);

  const user = await localLogin(email, password);
  if (!user) throw new Error("E-Mail oder Passwort falsch.");
  const session = { token: `local-${user.id}-${Date.now()}`, user };
  saveSession(session);
  return session;
}

export async function googleAuthRequest(input: {
  idToken: string;
  role: UserRole;
}): Promise<AuthSession> {
  const result = await postAuth({
    action: "google",
    idToken: input.idToken,
    role: input.role,
  });
  if (result.kind === "session") {
    saveSession(result.session);
    return result.session;
  }
  if (result.kind === "error") throw new Error(result.error);

  const payload = decodeJwtPayload(input.idToken);
  const sub = String(payload?.sub || "");
  const email = String(payload?.email || "");
  const name = String(payload?.name || email.split("@")[0] || "Google User");
  if (!sub || !email) {
    throw new Error(
      "Google braucht die PHP-API (google_client_id in api/config.php)."
    );
  }
  const user = localGoogleAuth({
    sub,
    email,
    name,
    role: input.role,
  });
  const session = { token: `local-${user.id}-${Date.now()}`, user };
  saveSession(session);
  return session;
}

export async function updateProfileRequest(input: {
  name: string;
  email: string;
}): Promise<AuthUser> {
  const result = await postAuth({ action: "update_profile", ...input }, true);
  if (result.kind === "user") return persistUser(result.user);
  if (result.kind === "error") throw new Error(result.error);

  const current = requireLocalUser();
  return persistUser(await localUpdateProfile(current.id, input));
}

export async function changePasswordRequest(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<AuthUser> {
  const result = await postAuth(
    { action: "change_password", ...input },
    true
  );
  if (result.kind === "user") return persistUser(result.user);
  if (result.kind === "error") throw new Error(result.error);

  const current = requireLocalUser();
  return persistUser(
    await localChangePassword(
      current.id,
      input.currentPassword,
      input.newPassword
    )
  );
}

export async function setPasswordRequest(newPassword: string): Promise<AuthUser> {
  const result = await postAuth({ action: "set_password", newPassword }, true);
  if (result.kind === "user") return persistUser(result.user);
  if (result.kind === "error") throw new Error(result.error);

  const current = requireLocalUser();
  return persistUser(await localSetPassword(current.id, newPassword));
}

export async function logoutAllRequest(): Promise<void> {
  const result = await postAuth({ action: "logout_all" }, true);
  if (result.kind === "error") throw new Error(result.error);
  clearSession();
}

export async function deleteAccountRequest(input: {
  email: string;
  confirm: string;
  password?: string;
}): Promise<void> {
  const result = await postAuth(
    { action: "delete_account", ...input },
    true
  );
  if (result.kind === "error") throw new Error(result.error);
  if (result.kind === "offline") {
    const current = requireLocalUser();
    await localDeleteAccount({
      userId: current.id,
      email: input.email,
      confirm: input.confirm,
      password: input.password,
    });
  }
  clearSession();
}

export async function logoutRequest(): Promise<void> {
  const session = loadSession();
  const base = apiBase();
  if (session?.token && base && typeof window !== "undefined") {
    try {
      await fetch(`${base}/auth.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ action: "logout", token: session.token }),
      });
    } catch {
      // lokal ok
    }
  }
  clearSession();
}

export async function restoreSession(): Promise<AuthSession | null> {
  const stored = loadSession();
  if (!stored) return null;

  const base = apiBase();
  if (!base || typeof window === "undefined") return stored;
  if (stored.token.startsWith("local-")) return stored;

  try {
    const res = await fetch(`${base}/auth.php`, {
      method: "GET",
      headers: { Authorization: `Bearer ${stored.token}` },
    });
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json") || !res.ok) {
      clearSession();
      return null;
    }
    const data = (await res.json()) as {
      ok?: boolean;
      user?: AuthUser;
    };
    if (!data.user) {
      clearSession();
      return null;
    }
    const next = { token: stored.token, user: data.user };
    saveSession(next);
    return next;
  } catch {
    return stored;
  }
}

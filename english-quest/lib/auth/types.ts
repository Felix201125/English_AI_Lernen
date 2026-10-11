export type UserRole = "teacher" | "student";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentId?: string | null;
  /** Marktplatz-Profil-ID für Buchungen */
  marketplaceTeacherId?: string | null;
  hasPassword?: boolean;
  hasGoogle?: boolean;
  createdAt?: string | null;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

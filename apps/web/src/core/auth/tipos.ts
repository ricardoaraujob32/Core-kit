// apps/web/src/core/auth/tipos.ts

export type Permissao = string;
export type Papel = string;
export type ModuloHabilitado = string;

export const AUTHZ_FLAGS = {
  enableSuperadminFrontend: false,
} as const;

export type SessionUser = {
  usuarioId: string;
  locatarioId: string | null;
  papeis: Papel[];
  permissoes: Permissao[];
  modulosHabilitados: ModuloHabilitado[];
  nome?: string;
  email?: string;
  isSuperAdmin?: boolean;
};

export type LoginInput = {
  email: string;
  senha: string;
  locatarioSlug: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  accessExpiraEm?: string;
  refreshExpiraEm?: string;
};

export type RefreshInput = {
  refreshToken: string;
  locatarioId: string | null;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
  accessExpiraEm?: string;
  refreshExpiraEm?: string;
};

export type MeResponse = {
  usuario: SessionUser;
};

export type LogoutInput = {
  locatarioId: string | null;
  refreshToken: string;
};

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

export type AuthContextValue = {
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: SessionUser | null;
  accessToken: string | null;
  login: (input: LoginInput) => Promise<SessionUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

export function isSuperAdmin(user: SessionUser | null | undefined): boolean {
  if (!AUTHZ_FLAGS.enableSuperadminFrontend) {
    return false;
  }

  if (!user) return false;

  if (user.isSuperAdmin === true) {
    return true;
  }

  return Array.isArray(user.papeis) && user.papeis.includes("SUPERADMIN");
}
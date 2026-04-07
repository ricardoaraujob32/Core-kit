// web/src/core/auth/types.ts

export type Permissao = string;
export type Papel = string;
export type ModuloHabilitado = string;

export type SessionUser = {
  usuarioId: string;
  locatarioId: string | null;
  papeis: Papel[];
  permissoes: Permissao[];
  modulosHabilitados?: ModuloHabilitado[];
  nome?: string;
  email?: string;
};

export type LoginInput = {
  email: string;
  senha: string;
  locatarioSlug: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  usuario: SessionUser;
};

export type RefreshInput = {
  refreshToken: string;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
};

export type MeResponse = {
  usuario: SessionUser;
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
  if (!user) return false;
  return Array.isArray(user.papeis) && user.papeis.includes("SUPERADMIN");
}

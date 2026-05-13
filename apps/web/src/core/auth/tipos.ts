// apps/web/src/core/auth/tipos.ts

export type PerfilSessao = "TENANT" | "PLATAFORMA";

export type SessionUser = {
  usuarioId: string;
  locatarioId: string | null;
  perfil: PerfilSessao;
};

export type LoginInput = {
  email: string;
  senha: string;
  locatarioSlug: string;
};

export type LoginPlataformaInput = {
  email: string;
  senha: string;
};

export type SessaoResponse = {
  accessToken: string;
  accessExpiraEm: string;
  refreshToken?: string;
  refreshExpiraEm?: string;
  usuario: SessionUser;
};

export type LoginResponse = SessaoResponse;

export type LoginPlataformaResponse = SessaoResponse;

export type RefreshInput = {
  refreshToken: string;
  locatarioId: string | null;
};

export type RefreshResponse = {
  accessToken: string;
  accessExpiraEm?: string;
  refreshToken?: string;
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
  user: SessionUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<SessionUser>;
  loginPlataforma: (input: LoginPlataformaInput) => Promise<SessionUser>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
};

export function isTenant(user: SessionUser | null | undefined): boolean {
  return user?.perfil === "TENANT";
}

export function isPlataforma(user: SessionUser | null | undefined): boolean {
  return user?.perfil === "PLATAFORMA";
}

export function isSuperAdmin(user: SessionUser | null | undefined): boolean {
  return isPlataforma(user);
}
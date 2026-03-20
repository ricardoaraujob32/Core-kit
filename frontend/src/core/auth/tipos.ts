// frontend/src/core/auth/types.ts

export type Permissao = string;
export type Papel = string;

export type SessionUser = {
  usuarioId: string;
  locatarioId?: string | null;
  isSuperAdmin: boolean;
  permissoes: Permissao[];
  papeis: Papel[];
  nome?: string;
  email?: string;
};

export type LoginInput = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  usuario: SessionUser;
};

export type MeResponse = {
  usuario: SessionUser;
};

export type RefreshInput = {
  refreshToken: string;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
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
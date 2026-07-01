// apps/web/src/core/auth/tipos.ts

export type PerfilSessao = "TENANT" | "PLATAFORMA";

export type CapabilitySet = {
  acessar?: boolean;
  criar?: boolean;
  editar?: boolean;
  excluir?: boolean;
};

export type AutorizacaoTenant = {
  usuarios?: CapabilitySet & {
    inativar?: boolean;
    reativar?: boolean;
  };
  clientes?: CapabilitySet;
  fornecedores?: CapabilitySet;
  produtos?: CapabilitySet;
  transacoes?: CapabilitySet & {
    cancelar?: boolean;
    concluir?: boolean;
  };
  financeiro?: {
    acessar?: boolean;
  };
  assinatura?: {
    acessar?: boolean;
    atualizar?: boolean;
  };
  ordensServico?: CapabilitySet & {
    cancelar?: boolean;
    concluir?: boolean;
    gerarVenda?: boolean;
  };
};

export type SessionUser = {
  usuarioId: string;
  locatarioId: string | null;
  perfil: PerfilSessao;
  email?: string;
  nome?: string;

  /**
   * Contrato público de autorização para o frontend.
   *
   * O frontend não deve depender de permissões/módulos crus.
   * O backend resolve RBAC internamente e envia apenas capacidades booleanas.
   */
  autorizacao?: AutorizacaoTenant;
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

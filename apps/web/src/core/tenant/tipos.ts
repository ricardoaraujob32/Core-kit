// apps/web/src/core/tenant/tipos.ts

export type ConfiguracaoAtivaLocatarioDto = {
  locatarioId: string;
  configuracaoId: string;
  modoTema?: "SISTEMA" | "CLARO" | "ESCURO" | string | null;
  identidadeVisual?: string | null;
  corPrimaria?: string | null;
  corSecundaria?: string | null;
  corTerciaria?: string | null;
  urlLogo?: string | null;
  ativa?: boolean;
  criadoEm?: string | null;
  atualizadoEm?: string | null;
};

export type ObterConfiguracaoAtivaLocatarioResponse = {
  item: ConfiguracaoAtivaLocatarioDto;
};

export type TenantBranding = {
  locatarioId: string;
  configuracaoId?: string;
  nomeFantasia?: string;
  logoUrl?: string;
  corPrimaria?: string;
  corSecundaria?: string;
  corFundo?: string;
  corTexto?: string;
  modoTema?: "CLARO";
};

export type TenantContextValue = {
  branding: TenantBranding | null;
  isLoading: boolean;
  refreshBranding: () => Promise<void>;
};

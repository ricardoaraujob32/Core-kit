// frontend/src/core/tenant/types.ts

export type TenantBranding = {
  locatarioId: string;
  nomeFantasia?: string;
  logoUrl?: string;
  corPrimaria?: string;
  corSecundaria?: string;
  corFundo?: string;
  corTexto?: string;
};

export type TenantContextValue = {
  branding: TenantBranding | null;
  isLoading: boolean;
  refreshBranding: () => Promise<void>;
};
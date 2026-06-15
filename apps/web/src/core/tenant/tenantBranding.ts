// apps/web/src/core/tenant/tenantBranding.ts

import type {
  ConfiguracaoAtivaLocatarioDto,
  TenantBranding,
} from "./tipos";

const DEFAULT_PRIMARY = "#2563eb";
const DEFAULT_SECONDARY = "#1d4ed8";
const DEFAULT_BACKGROUND = "#f8fafc";
const DEFAULT_TEXT = "#111827";

function limparOpcional(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildFallbackTenantBranding(
  locatarioId: string,
): TenantBranding {
  return {
    locatarioId,
    nomeFantasia: `Locatário ${locatarioId.slice(0, 8)}`,
    logoUrl: undefined,
    corPrimaria: DEFAULT_PRIMARY,
    corSecundaria: DEFAULT_SECONDARY,
    corFundo: DEFAULT_BACKGROUND,
    corTexto: DEFAULT_TEXT,
    modoTema: "CLARO",
  };
}

export function mapConfiguracaoAtivaToTenantBranding(
  configuracao: ConfiguracaoAtivaLocatarioDto,
): TenantBranding {
  return {
    locatarioId: configuracao.locatarioId,
    configuracaoId: configuracao.configuracaoId,
    nomeFantasia: limparOpcional(configuracao.identidadeVisual) || `Locatário ${configuracao.locatarioId.slice(0, 8)}`,
    logoUrl: limparOpcional(configuracao.urlLogo),
    corPrimaria: limparOpcional(configuracao.corPrimaria) || DEFAULT_PRIMARY,
    corSecundaria: limparOpcional(configuracao.corSecundaria) || DEFAULT_SECONDARY,
    corFundo: DEFAULT_BACKGROUND,
    corTexto: limparOpcional(configuracao.corTerciaria) || DEFAULT_TEXT,
    modoTema: "CLARO",
  };
}

export function normalizeTenantBranding(
  branding: TenantBranding,
): TenantBranding {
  return {
    locatarioId: branding.locatarioId,
    configuracaoId: branding.configuracaoId,
    nomeFantasia:
      limparOpcional(branding.nomeFantasia) ||
      `Locatário ${branding.locatarioId.slice(0, 8)}`,
    logoUrl: limparOpcional(branding.logoUrl),
    corPrimaria: limparOpcional(branding.corPrimaria) || DEFAULT_PRIMARY,
    corSecundaria: limparOpcional(branding.corSecundaria) || DEFAULT_SECONDARY,
    corFundo: DEFAULT_BACKGROUND,
    corTexto: limparOpcional(branding.corTexto) || DEFAULT_TEXT,
    modoTema: "CLARO",
  };
}

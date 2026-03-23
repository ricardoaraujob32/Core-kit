// frontend/src/core/tenant/tenantBranding.ts

import type { TenantBranding } from "./types";

const DEFAULT_PRIMARY = "#2563eb";
const DEFAULT_SECONDARY = "#1d4ed8";
const DEFAULT_BACKGROUND = "#f8fafc";
const DEFAULT_TEXT = "#111827";

export function buildFallbackTenantBranding(
  locatarioId: string,
): TenantBranding {
  return {
    locatarioId,
    nomeFantasia: `Locatário ${locatarioId.slice(0, 8)}`,
    corPrimaria: DEFAULT_PRIMARY,
    corSecundaria: DEFAULT_SECONDARY,
    corFundo: DEFAULT_BACKGROUND,
    corTexto: DEFAULT_TEXT,
  };
}

export function normalizeTenantBranding(
  branding: TenantBranding,
): TenantBranding {
  return {
    locatarioId: branding.locatarioId,
    nomeFantasia:
      branding.nomeFantasia?.trim() ||
      `Locatário ${branding.locatarioId.slice(0, 8)}`,
    logoUrl: branding.logoUrl,
    corPrimaria: branding.corPrimaria || DEFAULT_PRIMARY,
    corSecundaria: branding.corSecundaria || DEFAULT_SECONDARY,
    corFundo: branding.corFundo || DEFAULT_BACKGROUND,
    corTexto: branding.corTexto || DEFAULT_TEXT,
  };
}
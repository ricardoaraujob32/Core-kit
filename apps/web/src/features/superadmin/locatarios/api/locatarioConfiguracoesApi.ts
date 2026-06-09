// apps/web/src/features/superadmin/locatarios/api/locatarioConfiguracoesApi.ts

import { httpClient } from "../../../../core/api/httpClient";

export type BrandingLocatario = {
  locatarioId: string;
  configuracaoId: string;
  modoTema?: string | null;
  identidadeVisual?: string | null;
  corPrimaria?: string | null;
  corSecundaria?: string | null;
  corTerciaria?: string | null;
  urlLogo?: string | null;
  ativa?: boolean;
  atualizadoEm?: string | null;
};

export type AtualizarBrandingLocatarioInput = {
  nomeFantasia?: string | null;
  corPrimaria?: string | null;
  corSecundaria?: string | null;
  corFundo?: string | null;
  corTexto?: string | null;
  logoUrl?: string | null;
};

export type ModuloAssinaturaLocatario = {
  codigo: string;
  origem?: string | null;
};

export type ObterBrandingLocatarioResponse = { item: BrandingLocatario };
export type AtualizarBrandingLocatarioResponse = { item: BrandingLocatario };
export type ListarModulosAssinaturaLocatarioResponse = {
  locatarioId: string;
  modulos: ModuloAssinaturaLocatario[];
};
export type VincularModuloAssinaturaLocatarioInput = { codigo: string };
export type VincularModuloAssinaturaLocatarioResponse = {
  item: ModuloAssinaturaLocatario;
};
export type DesvincularModuloAssinaturaLocatarioResponse = {
  item: { codigo: string };
};

export const locatarioConfiguracoesApi = {
  obterBranding(locatarioId: string): Promise<ObterBrandingLocatarioResponse> {
    return httpClient.get<ObterBrandingLocatarioResponse>(
      `/plataforma/locatarios/${locatarioId}/configuracoes/ativa`,
    );
  },

  atualizarBranding(locatarioId: string, input: AtualizarBrandingLocatarioInput): Promise<AtualizarBrandingLocatarioResponse> {
    return httpClient.patch<
      AtualizarBrandingLocatarioResponse,
      AtualizarBrandingLocatarioInput
    >(`/plataforma/locatarios/${locatarioId}/branding`, input);
  },

  listarModulos(locatarioId: string): Promise<ListarModulosAssinaturaLocatarioResponse> {
    return httpClient.get<ListarModulosAssinaturaLocatarioResponse>(
      `/plataforma/locatarios/${locatarioId}/modulos`,
    );
  },

  vincularModulo(locatarioId: string, input: VincularModuloAssinaturaLocatarioInput): Promise<VincularModuloAssinaturaLocatarioResponse> {
    return httpClient.post<
      VincularModuloAssinaturaLocatarioResponse,
      VincularModuloAssinaturaLocatarioInput
    >(`/plataforma/locatarios/${locatarioId}/modulos`, input);
  },

  desvincularModulo(locatarioId: string, codigo: string): Promise<DesvincularModuloAssinaturaLocatarioResponse> {
    return httpClient.delete<DesvincularModuloAssinaturaLocatarioResponse>(
      `/plataforma/locatarios/${locatarioId}/modulos/${encodeURIComponent(codigo)}`,
    );
  },
};

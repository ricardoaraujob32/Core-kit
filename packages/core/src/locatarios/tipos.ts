import type { Result } from "../result";
import type { ErroApp } from "../erros";
import { wrapOk } from "../result";
import { erroEntradaInvalida } from "./erros";
import { normalizarSlug, normalizarTexto, emailValido } from "./validadores";

/**
 * IDs (por enquanto string; você pode evoluir para branded type depois).
 * Observação: você já tem packages/core/src/locatario.ts com LocatarioId = string.
 * Aqui estou “centralizando” no módulo locatarios.
 */
export type LocatarioId = string;
export type PlanoId = string;
export type UsuarioId = string;

export type LocatarioStatus = "ATIVO" | "INATIVO" | "SUSPENSO";

export type Locatario = {
  id: LocatarioId;
  nome: string;
  planoId: PlanoId;
  slug: string;

  status: LocatarioStatus;

  criadoEm: Date;
  atualizadoEm: Date;

  excluidoEm: Date | null;
  excluidoPorUsuarioId: UsuarioId | null;
  motivoExclusao: string | null;
};

export type CriarLocatarioParams = {
  id: LocatarioId;
  nome: string;
  planoId: PlanoId;
  slug?: string | null;
  agora: () => Date;
};

export function normalizarSlugLocatario(v: string): string {
  return normalizarSlug(v);
}

export function criarLocatario(params: CriarLocatarioParams): Result<Locatario, ErroApp> {
  if (!params.id) return erroEntradaInvalida("id é obrigatório.");
  if (!params.planoId) return erroEntradaInvalida("planoId é obrigatório.");

  const nome = normalizarTexto(params.nome ?? "");
  if (!nome) return erroEntradaInvalida("nome é obrigatório.");

  const slugFonte = (params.slug ?? "").trim().length ? String(params.slug) : nome;
  const slug = normalizarSlugLocatario(slugFonte);
  if (!slug) return erroEntradaInvalida("slug inválido.");

  const agora = params.agora();

  return wrapOk({
    id: params.id,
    nome,
    planoId: params.planoId,
    slug,

    status: "ATIVO",

    criadoEm: agora,
    atualizadoEm: agora,

    excluidoEm: null,
    excluidoPorUsuarioId: null,
    motivoExclusao: null,
  });
}

/**
 * Entidade fraca:
 * - depende do locatarioId
 * - pode haver várias configurações (histórico / versões / perfis)
 * - uma pode estar “ativa” (selecionada)
 */
export type ConfiguracaoLocatarioId = string;

export type ModoTema = "CLARO" | "ESCURO" | "SISTEMA";

export type ConfiguracaoLocatario = {
  locatarioId: LocatarioId;
  configuracaoId: ConfiguracaoLocatarioId;

  modoTema: ModoTema;
  identidadeVisual: string;

  corPrimaria: string | null;
  corSecundaria: string | null;
  corTerciaria: string | null;

  urlLogo: string | null;
  ativa: boolean;

  emailSuporte: string | null;

  fusoHorario: string; // ex: 'America/Sao_Paulo'
  idioma: string; // ex: 'pt-BR'

  criadoEm: Date;
  atualizadoEm: Date;
};

export type CriarConfiguracaoLocatarioParams = {
  locatarioId: LocatarioId;
  configuracaoId: ConfiguracaoLocatarioId;

  modoTema?: ModoTema | null;
  identidadeVisual: string;

  corPrimaria?: string | null;
  corSecundaria?: string | null;
  corTerciaria?: string | null;

  urlLogo?: string | null;
  ativa?: boolean | null;

  emailSuporte?: string | null;

  fusoHorario?: string | null;
  idioma?: string | null;

  agora: () => Date;
};

export function criarConfiguracaoLocatario(
  params: CriarConfiguracaoLocatarioParams,
): Result<ConfiguracaoLocatario, ErroApp> {
  if (!params.locatarioId) return erroEntradaInvalida("locatarioId é obrigatório.");
  if (!params.configuracaoId) return erroEntradaInvalida("configuracaoId é obrigatório.");

  const identidadeVisual = normalizarTexto(params.identidadeVisual ?? "");
  if (!identidadeVisual) return erroEntradaInvalida("identidadeVisual é obrigatória.");

  const email = params.emailSuporte ?? null;
  if (email !== null && email !== undefined) {
    const e = email.trim();
    if (e.length > 0 && !emailValido(e)) return erroEntradaInvalida("emailSuporte inválido.");
  }

  const agora = params.agora();

  return wrapOk({
    locatarioId: params.locatarioId,
    configuracaoId: params.configuracaoId,

    modoTema: params.modoTema ?? "SISTEMA",
    identidadeVisual,

    corPrimaria: params.corPrimaria ?? null,
    corSecundaria: params.corSecundaria ?? null,
    corTerciaria: params.corTerciaria ?? null,

    urlLogo: params.urlLogo ?? null,
    ativa: params.ativa ?? false,

    emailSuporte: email ? email.trim() : null,

    fusoHorario: (params.fusoHorario ?? "America/Sao_Paulo").trim() || "America/Sao_Paulo",
    idioma: (params.idioma ?? "pt-BR").trim() || "pt-BR",

    criadoEm: agora,
    atualizadoEm: agora,
  });
}
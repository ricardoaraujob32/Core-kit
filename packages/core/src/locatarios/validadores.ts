// packages/core/src/locatarios/validadores.ts

import { ErroApp, Result, validarIdGenerico, validarTextoObrigatorio } from "../kernel/index.js";
import { locatarioInvalido } from "./erros.js";
import { ConfiguracaoLocatario, ConfiguracaoLocatarioId, LocatarioId, LocatarioSlug, ModoTemaLocatario } from "./tipos.js";

/**
 * Converte erro genérico de validação transversal em erro específico do
 * domínio de locatários.
 *
 * Este helper mantém o módulo desacoplado dos detalhes do kernel e garante
 * que falhas de validação sejam reportadas com semântica própria do pacote.
 *
 * @param resultado Resultado bruto da validação transversal.
 * @param campo Nome lógico do campo validado.
 * @param valor Valor original rejeitado.
 * @returns Resultado original em caso de sucesso, ou erro específico do módulo.
 */
function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
  if (resultado.ok) return resultado;
  return locatarioInvalido({ campo, valor });
}

/**
 * Valida o nome de um locatário.
 *
 * Regras atuais:
 * - deve ser texto;
 * - deve possuir ao menos 2 caracteres úteis após `trim`.
 *
 * @param nome Nome informado para o locatário.
 * @returns `Ok(string)` com nome normalizado ou erro específico do módulo.
 */
export function validarNomeLocatario(nome: string): Result<string, ErroApp> {
  return mapearErro( validarTextoObrigatorio(nome, "nome", 2), "nome", nome );
}

/**
 * Valida o identificador lógico de um locatário.
 *
 * @param locatarioId Identificador textual do locatário.
 * @returns `Ok(string)` com ID validado ou erro específico do módulo.
 */
export function validarLocatarioId(locatarioId: LocatarioId): Result<string, ErroApp> {
  return mapearErro( validarIdGenerico(locatarioId, "locatarioId"), "locatarioId", locatarioId );
}

/**
 * Valida o slug de um locatário
 * @param slug identificador único de URL do locatário
 * @returns `Ok(string)` com slug normalizado ou erro específico do módulo.
 */
export function validarLocatarioSlug(slug: LocatarioSlug): Result<string, ErroApp>{
  return mapearErro( validarTextoObrigatorio(slug, "slug", 2), "slug", slug );
}

/**
 * 
 * @param email 
 * @returns 
 */
export function validarEmailLocatario(email: string): Result<string, ErroApp> {
  const bruto = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!bruto) {
    return locatarioInvalido({ campo: "email", valor: email });
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(bruto)) {
    return locatarioInvalido({ campo: "email", valor: email });
  }

  return { ok: true, value: bruto };
}

/**
 * 
 * @param documento 
 * @returns 
 */
export function validarDocumentoLocatario(documento?: string | null): Result<string | null, ErroApp> {
  if (documento === null || documento === undefined) {
    return { ok: true, value: null };
  }

  const valor = documento.trim();
  if (!valor) {
    return { ok: true, value: null };
  }

  if (valor.length < 5) {
    return locatarioInvalido({ campo: "documento", valor: documento });
  }

  return { ok: true, value: valor };
}

/**
 * 
 * @param fusoHorario 
 * @returns 
 */
export function validarFusoHorarioLocatario(fusoHorario?: string): Result<string, ErroApp> {
  const valor = (fusoHorario ?? "America/Sao_Paulo").trim();

  if (!valor) {
    return locatarioInvalido({ campo: "fusoHorario", valor: fusoHorario });
  }

  return { ok: true, value: valor };
}

/**
 * 
 * @param configuracaoId 
 * @returns 
 */
export function validarConfiguracaoLocatarioId(configuracaoId: ConfiguracaoLocatarioId): Result<string, ErroApp> {
  return mapearErro(
    validarIdGenerico(configuracaoId, "configuracaoId"),
    "configuracaoId",
    configuracaoId,
  );
}

/**
 * 
 * @param identidadeVisual 
 * @returns 
 */
export function validarIdentidadeVisualLocatario(identidadeVisual: string): Result<string, ErroApp> {
  return mapearErro(
    validarTextoObrigatorio(identidadeVisual, "identidadeVisual", 2),
    "identidadeVisual",
    identidadeVisual,
  );
}

/**
 * 
 * @param modoTema 
 * @returns 
 */
export function validarModoTemaLocatario(modoTema?: string): Result<ModoTemaLocatario, ErroApp> {
  const valor = (modoTema ?? "SISTEMA").trim().toUpperCase();

  switch (valor) {
    case "SISTEMA":
      return { ok: true, value: "SISTEMA" };
    case "CLARO":
      return { ok: true, value: "CLARO" };
    case "ESCURO":
      return { ok: true, value: "ESCURO" };
    default:
      return locatarioInvalido({ campo: "modoTema", valor: modoTema });
  }
}

/**
 * 
 * @param valor 
 * @param campo 
 * @returns 
 */
export function validarCorTema(valor?: string | null, campo = "cor"): Result<string | null, ErroApp> {
  if (valor === null || valor === undefined) {
    return { ok: true, value: null };
  }

  const texto = valor.trim();
  if (!texto) {
    return { ok: true, value: null };
  }

  const regexHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  if (!regexHex.test(texto)) {
    return locatarioInvalido({ campo, valor });
  }

  return { ok: true, value: texto };
}

/**
 * 
 * @param urlLogo 
 * @returns 
 */
export function validarUrlLogoLocatario(urlLogo?: string | null): Result<string | null, ErroApp> {
  if (urlLogo === null || urlLogo === undefined) {
    return { ok: true, value: null };
  }

  const valor = urlLogo.trim();
  if (!valor) {
    return { ok: true, value: null };
  }

  try {
    new URL(valor);
    return { ok: true, value: valor };
  } catch {
    return locatarioInvalido({ campo: "urlLogo", valor: urlLogo });
  }
}

/**
 * 
 * @param config 
 * @returns 
 */
export function configuracaoLocatarioEstaCompleta(config: ConfiguracaoLocatario): boolean {
  return Boolean(
    config.identidadeVisual?.trim() &&
      config.modoTema?.trim() &&
      config.corPrimaria?.trim() &&
      config.corSecundaria?.trim() &&
      config.corTerciaria?.trim() &&
      config.urlLogo?.trim()
  );
}

/**
 * 
 * @param configuracoes 
 * @returns 
 */
export function validarConfiguracoesLocatario(configuracoes: ConfiguracaoLocatario[]) {
  const ativas = configuracoes.filter((c) => c.ativa);

  if (ativas.length > 1) {
    return locatarioInvalido({
      campo: "configuracoes",
      motivo: "mais_de_uma_configuracao_ativa",
      quantidadeAtivas: ativas.length,
    });
  }

  if (ativas.length === 1 && !configuracaoLocatarioEstaCompleta(ativas[0])) {
    return locatarioInvalido({
      campo: "configuracoes",
      motivo: "configuracao_ativa_incompleta",
      configuracaoId: ativas[0].configuracaoId,
    });
  }

  return { ok: true as const, value: undefined };
}

/**
 * 
 * @param configuracoes 
 * @returns 
 */
export function obterConfiguracaoAtiva(configuracoes: ConfiguracaoLocatario[]) {
  return configuracoes.find((c) => c.ativa) ?? null;
}

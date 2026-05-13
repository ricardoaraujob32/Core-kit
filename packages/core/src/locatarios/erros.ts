// packages/core/src/locatarios/erros.ts

import { createErroApp } from "../kernel";
import { LocatarioId, LocatarioSlug } from "./tipos";

/**
 * 
 */
export type CodigoErroLocatario =
  | "LOCATARIO_INVALIDO"
  | "LOCATARIO_NAO_ENCONTRADO"
  | "LOCATARIO_SUSPENSO"
  | "LOCATARIO_ENCERRADO"
  | "LOCATARIO_OBRIGATORIO";

/**
 * Cria erro para entradas inválidas relacionadas ao domínio de locatários.
 *
 * Use este helper quando os dados recebidos para criação, atualização,
 * ativação ou consulta de locatário não respeitarem as invariantes mínimas
 * do módulo.
 *
 * @param detalhes Metadados estruturados sobre o motivo da invalidez.
 * @returns `Err(ErroApp)` tipado para o domínio de locatários.
 */
export function locatarioInvalido(detalhes?: Record<string, unknown>) {
  return createErroApp({ codigo: "LOCATARIO_INVALIDO", mensagem: "Dados do locatário são inválidos.", detalhes });
}

/**
 * Cria erro para tentativa de acesso a locatário inexistente.
 *
 * @param locatarioId Identificador do locatário que não foi encontrado.
 * @returns `Err(ErroApp)` com o código específico do módulo.
 */
export function locatarioNaoEncontrado(locatarioId: LocatarioId) {
  return createErroApp({ codigo: "LOCATARIO_NAO_ENCONTRADO", mensagem: "Locatário não encontrado.", detalhes: { locatarioId } });
}

/**
 * Cria erro para locatário suspenso.
 *
 * Use este helper quando a operação exigir locatário operacional, mas o
 * registro estiver em estado incompatível com uso normal do sistema.
 *
 * @param locatarioId Identificador do locatário suspenso.
 * @returns `Err(ErroApp)` com status contextual em `detalhes`.
 */
export function locatarioSuspenso(locatarioId: LocatarioId) {
  return createErroApp({ codigo: "LOCATARIO_SUSPENSO", mensagem: "Locatário suspenso.", detalhes: { locatarioId, status: "SUSPENSO" } });
}

/**
 * Cria erro para locatário encerrado.
 *
 * @param locatarioId Identificador do locatário encerrado.
 * @returns `Err(ErroApp)` com status contextual em `detalhes`.
 */
export function locatarioEncerrado(locatarioId: LocatarioId) {
  return createErroApp({ codigo: "LOCATARIO_ENCERRADO", mensagem: "Locatário encerrado.", detalhes: { locatarioId, status: "ENCERRADO" } });
}

/**
 * 
 * @param detalhes 
 * @returns 
 */
export function locatarioObrigatorio(locatarioId: LocatarioId) {
  return createErroApp({ codigo: "LOCATARIO_OBRIGATORIO", mensagem: "Locatário ausente no contexto autenticado.", detalhes: { locatarioId } });
}

/**
 * 
 * @param slug 
 * @returns 
 */
export function slugLocatarioJaExiste(slug: LocatarioSlug) {
  return createErroApp({
    codigo: "CONFLITO",
    mensagem: "Slug de locatário já existe.",
    detalhes: {
      campo: "slug",
      slug,
    },
  });
}

/**
 * 
 * @param email 
 * @returns 
 */
export function emailLocatarioJaExiste(email: string) {
  return createErroApp({
    codigo: "CONFLITO",
    mensagem: "E-mail de locatário já existe.",
    detalhes: {
      campo: "email",
      email,
    },
  });
}

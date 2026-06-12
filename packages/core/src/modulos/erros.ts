// packages/core/src/modulos/erros.ts

import { createErroApp, ErroApp, Result } from "../kernel/index.js";
import { LocatarioId } from "../locatarios/index.js";

export type CodigoErroModulo =
  | "MODULOS_LOCATARIO_ID_INVALIDO"
  | "MODULOS_CODIGO_INVALIDO"
  | "MODULOS_REPOSITORIO_FALHA"
  | "MODULO_NAO_HABILITADO"

/**
 * Cria erro específico para identificador de locatário inválido em operações
 * do módulo de habilitação de módulos.
 *
 * @param locatarioId Valor rejeitado como identificador válido.
 * @returns `Err(ErroApp)` específico do pacote `modulos`.
 */
export function erroLocatarioIdInvalido(locatarioId: unknown): Result<never, ErroApp> {
  return createErroApp({ codigo: "MODULOS_LOCATARIO_ID_INVALIDO", mensagem: "Identificador de locatário inválido para consulta de módulos.", detalhes: { locatarioId } });
}

/**
 * Cria erro específico para código de módulo inválido.
 *
 * @param codigo Valor rejeitado como código de módulo.
 * @returns `Err(ErroApp)` específico do pacote `modulos`.
 */
export function erroModuloCodigoInvalido(codigo: unknown): Result<never, ErroApp> {
  return createErroApp({ codigo: "MODULOS_CODIGO_INVALIDO", mensagem: "Código do módulo inválido.", detalhes: { codigo } });
}

/**
 * Cria erro específico para falha de consulta ao repositório de módulos.
 *
 * @param causa Erro original capturado da camada de persistência ou integração.
 * @returns `Err(ErroApp)` com causa preservada para diagnóstico.
 */
export function erroRepositorioModulos(causa?: unknown): Result<never, ErroApp> {
  return createErroApp({ codigo: "MODULOS_REPOSITORIO_FALHA", mensagem: "Falha ao consultar módulos habilitados.", detalhes: {}, causa });
}

/**
 * Cria erro quando o módulo consultado não está habilitado para o locatário.
 *
 * @param codigo Código do módulo exigido.
 * @param locatarioId Locatário no qual a habilitação foi negada.
 * @returns `Err(ErroApp)` com contexto de autorização funcional.
 */
export function erroModuloNaoHabilitado(codigo: string, locatarioId: LocatarioId): Result<never, ErroApp> {
  return createErroApp({ codigo: "MODULO_NAO_HABILITADO", mensagem: "Módulo não habilitado para o locatário.", detalhes: { codigo, locatarioId } });
}

// packages/core/src/assinaturas/erros.ts

import { createErroApp, ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { ModuloId } from "../modulos";
import { AssinaturaId, PlanoId } from "./tipos";

/**
 * 
 * @param detalhes 
 * @returns 
 */
export function erroAssinaturaInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
  return createErroApp("ASSINATURA_INVALIDA", "Dados da assinatura são inválidos.", detalhes);
}

/**
 * 
 * @param assinaturaId 
 * @returns 
 */
export function erroAssinaturaNaoEncontrada(assinaturaId: AssinaturaId): Result<never, ErroApp> {
  return createErroApp("ASSINATURA_NAO_ENCONTRADA", "Assinatura não encontrada.", { assinaturaId });
}

/**
 * 
 * @param locatarioId 
 * @returns 
 */
export function erroAssinaturaJaExisteParaLocatario(locatarioId: LocatarioId): Result<never, ErroApp> {
  return createErroApp("ASSINATURA_ATIVA_JA_EXISTE", "Já existe uma assinatura ativa para este locatário.", { locatarioId });
}

/**
 * 
 * @param assinaturaId 
 * @param statusAtual 
 * @param statusDestino 
 * @returns 
 */
export function erroTransicaoStatusInvalida(assinaturaId: AssinaturaId, statusAtual: string, statusDestino: string): Result<never, ErroApp> {
  return createErroApp(
      "ASSINATURA_TRANSICAO_STATUS_INVALIDA",
      "A transição de status da assinatura é inválida.",
      { assinaturaId, statusAtual, statusDestino }
  );
}

/**
 * 
 * @param planoId 
 * @returns 
 */
export function erroPlanoInvalido(planoId: PlanoId): Result<never, ErroApp> {
  return createErroApp("PLANO_INVALIDO", "Plano inválido ou inativo.", { planoId });
}

/**
 * 
 * @param moduloId 
 * @returns 
 */
export function erroModuloInvalido(moduloId: ModuloId): Result<never, ErroApp> {
  return createErroApp("MODULO_INVALIDO", "Módulo inválido ou inativo.", { moduloId });
}

/**
 * 
 * @param assinaturaId 
 * @param moduloId 
 * @returns 
 */
export function erroModuloJaVinculado(assinaturaId: AssinaturaId, moduloId: ModuloId): Result<never, ErroApp> {
  return createErroApp(
      "MODULO_ASSINATURA_JA_VINCULADO",
      "O módulo já está vinculado à assinatura.",
      { assinaturaId, moduloId },
  );
}

/**
 * 
 * @param assinaturaId 
 * @param moduloId 
 * @returns 
 */
export function erroModuloNaoVinculado(assinaturaId: AssinaturaId, moduloId: ModuloId): Result<never, ErroApp> {
  return createErroApp(
      "MODULO_ASSINATURA_NAO_VINCULADO",
      "O módulo não está vinculado à assinatura.",
      { assinaturaId, moduloId },
  );
}

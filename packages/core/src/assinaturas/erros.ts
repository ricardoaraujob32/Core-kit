// packages/core/src/assinaturas/erros.ts

import { createErroApp, ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { ModuloId } from "../modulos";
import { AssinaturaId, PlanoId } from "./tipos";

/**
 * Cria erro para dados inválidos do domínio de assinaturas.
 *
 * @param detalhes Metadados estruturados sobre a invalidez detectada.
 * @returns `Err(ErroApp)` específico do pacote `assinaturas`.
 */
export function erroAssinaturaInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
  return createErroApp({ codigo: "ASSINATURA_INVALIDA", detalhes });
}

/**
 * Cria erro para assinatura inexistente.
 *
 * @param assinaturaId Identificador da assinatura não encontrada.
 * @returns `Err(ErroApp)` com contexto da busca.
 */
export function erroAssinaturaNaoEncontrada(assinaturaId: AssinaturaId): Result<never, ErroApp> {
  return createErroApp({ codigo: "ASSINATURA_NAO_ENCONTRADA", detalhes: { assinaturaId } });
}

/**
 * Cria erro de conflito quando já existe assinatura ativa para o locatário.
 *
 * @param locatarioId Locatário em conflito com a regra de unicidade.
 * @returns `Err(ErroApp)` específico de conflito de negócio.
 */
export function erroAssinaturaJaExisteParaLocatario(locatarioId: LocatarioId): Result<never, ErroApp> {
  return createErroApp({ codigo: "ASSINATURA_ATIVA_JA_EXISTE", detalhes: { locatarioId } });
}

/**
 * Cria erro para transição inválida de status da assinatura.
 *
 * @param assinaturaId Identificador da assinatura.
 * @param statusAtual Estado atual persistido.
 * @param statusDestino Estado solicitado.
 * @returns `Err(ErroApp)` específico de fluxo de estado.
 */
export function erroTransicaoStatusInvalida(assinaturaId: AssinaturaId, statusAtual: string, statusDestino: string): Result<never, ErroApp> {
  return createErroApp({ codigo: "ASSINATURA_TRANSICAO_STATUS_INVALIDA", detalhes: { assinaturaId, statusAtual, statusDestino } });
}

/**
 * Cria erro para plano inválido ou inativo.
 *
 * @param planoId Identificador do plano rejeitado.
 * @returns `Err(ErroApp)` específico de validação de plano.
 */
export function erroPlanoInvalido(planoId: PlanoId): Result<never, ErroApp> {
  return createErroApp({ codigo: "PLANO_INVALIDO", detalhes: { planoId } });
}

/**
 * Cria erro para módulo inválido ou inativo no contexto de assinaturas.
 *
 * @param moduloId Identificador do módulo rejeitado.
 * @returns `Err(ErroApp)` específico do domínio comercial.
 */
export function erroModuloInvalido(moduloId: ModuloId): Result<never, ErroApp> {
  return createErroApp({ codigo: "MODULO_INVALIDO", detalhes: { moduloId } });
}

/**
 * Cria erro de conflito quando o módulo já está vinculado à assinatura.
 *
 * @param assinaturaId Assinatura em questão.
 * @param moduloId Módulo já vinculado.
 * @returns `Err(ErroApp)` específico de conflito de vínculo.
 */
export function erroModuloJaVinculado(assinaturaId: AssinaturaId, moduloId: ModuloId): Result<never, ErroApp> {
  return createErroApp({ codigo: "MODULO_ASSINATURA_JA_VINCULADO", detalhes: { assinaturaId, moduloId } });
}

/**
 * Cria erro quando o módulo não está vinculado à assinatura informada.
 *
 * @param assinaturaId Assinatura consultada.
 * @param moduloId Módulo ausente no vínculo.
 * @returns `Err(ErroApp)` específico de vínculo inexistente.
 */
export function erroModuloNaoVinculado(assinaturaId: AssinaturaId, moduloId: ModuloId): Result<never, ErroApp> {
  return createErroApp({ codigo: "MODULO_ASSINATURA_NAO_VINCULADO", detalhes: { assinaturaId, moduloId } });
}

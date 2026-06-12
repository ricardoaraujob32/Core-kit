// packages/core/src/kernel/executarEmTransacao.ts

import type { ErroApp } from "./erros.js";
import type { TransacaoPorta } from "./portasGenericas.js";
import type { Result } from "./result.js";

/**
 * Observação arquitetural:
 * Este helper assume que a implementação de `PortaTransacao`
 * é responsável por:
 * - commit automático em sucesso
 * - rollback automático em erro
 *
 * Essa responsabilidade NÃO deve ser duplicada nos casos de uso.
 */

/**
 * Executa uma operação dentro de transação, quando a porta transacional estiver disponível.
 *
 * Este helper padroniza o comportamento usado pelos casos de uso do Core
 * que precisam suportar dois modos:
 *
 * - execução direta, quando não há `PortaTransacao`;
 * - execução transacional, quando a porta está disponível.
 *
 * Ele não implementa regra de negócio. Sua responsabilidade é apenas
 * encapsular a decisão de delegar ou não para `transacao.executar(...)`.
 *
 * @typeParam T Tipo de sucesso do `Result`.
 * @param transacao Porta transacional opcional.
 * @param fn Operação assíncrona que retorna `Result`.
 * @returns O mesmo `Result` produzido pela operação, com atomicidade quando suportada.
 */
export async function executarEmTransacao<T>(
  transacao: TransacaoPorta | undefined, fn: () => Promise<Result<T, ErroApp>>): Promise<Result<T, ErroApp>> {
  if (!transacao) return fn();
  return transacao.executar(fn);
}

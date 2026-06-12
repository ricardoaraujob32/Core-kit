// packages/core/src/kernel/StatusJob.ts

/**
 * Propósito do arquivo:
 * Define o estado padronizado de execução de jobs assíncronos no sistema.
 *
 * Este tipo é reutilizado por múltiplos módulos (ex: importações, exportações,
 * backups), garantindo consistência semântica no ciclo de vida de processos
 * assíncronos.
 */

/**
 * Representa o estado de um job assíncrono.
 *
 * Estados possíveis:
 *
 * - `PENDENTE`: job criado, aguardando execução
 * - `EM_EXECUCAO`: processamento em andamento
 * - `CONCLUIDO`: execução finalizada com sucesso
 * - `FALHOU`: execução finalizada com erro
 * - `CANCELADO`: execução interrompida manualmente ou por regra de negócio
 */
export type StatusJob =
  | "PENDENTE"
  | "EM_EXECUCAO"
  | "CONCLUIDO"
  | "FALHOU"
  | "CANCELADO";
  
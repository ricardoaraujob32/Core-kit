// packages/core/src/backups/usecases/solicitarRestauracaoLocatario.ts

import { ExportacoesRepositorio } from "../../exportacoes";
import { ImportacoesRepositorio } from "../../importacoes";
import { ErroApp, executarEmTransacao, IdPorta, TransacaoPorta, RelogioPorta, Result, wrapOk } from "../../kernel";
import { erroBackupNaoDisponivelParaRestauracao, erroBackupNaoEncontrado, erroBackupNaoPertenceAoLocatario, erroJaExisteRestauracaoEmAberto } from "../erros";
import { ehBackupLocatario, ehRestauracaoLocatario, mapRestauracao } from "../temp";
import { SolicitarRestauracaoLocatarioInput, SolicitarRestauracaoLocatarioOutput } from "../tipos";
import { validarSolicitarRestauracaoLocatarioInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por solicitar uma restauração lógica
 * de locatário a partir de um backup previamente gerado.
 *
 * Este caso de uso inicia o fluxo de restauração no módulo de backups.
 */

/**
 * Cria a função de caso de uso para solicitar restaurações de locatário.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo repositórios de exportações e importações, relógio, gerador de IDs
 * e transação opcional.
 * @returns Função de caso de uso `solicitarRestauracaoLocatario`.
 */
export function createFnSolicitarRestauracaoLocatario(deps: {
  exportacoesRepositorio: ExportacoesRepositorio;
  importacoesRepositorio: ImportacoesRepositorio;
  relogio: RelogioPorta;
  idPorta: IdPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * Solicita uma restauração lógica de locatário a partir de um backup existente.
   *
   * Regras:
   * - valida a entrada;
   * - não permite outra restauração em aberto;
   * - o backup deve existir;
   * - o backup deve pertencer ao mesmo locatário;
   * - o backup deve estar `CONCLUIDO` e possuir `referenciaResultado`;
   * - cria uma importação especializada com metadados de restauração.
   *
   * @param input Dados da solicitação de restauração.
   * @returns `Ok({ restauracao })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function solicitarRestauracaoLocatario(input: SolicitarRestauracaoLocatarioInput): Promise<Result<SolicitarRestauracaoLocatarioOutput, ErroApp>> {
    const validacao = validarSolicitarRestauracaoLocatarioInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(deps.transacao, async () => {
      const importacoes = await deps.importacoesRepositorio.listarPorLocatario(input.locatarioId);
      if (!importacoes.ok) return importacoes;

      const restauracaoEmAberto = importacoes.value.find(
        (item) => ehRestauracaoLocatario(item) && ["PENDENTE", "EM_EXECUCAO"].includes(item.status),
      );

      if (restauracaoEmAberto) {
        return erroJaExisteRestauracaoEmAberto(input.locatarioId);
      }

      const backup = await deps.exportacoesRepositorio.buscarPorId(input.backupId);
      if (!backup.ok) return backup;
      if (!backup.value || !ehBackupLocatario(backup.value)) {
        return erroBackupNaoEncontrado(input.backupId);
      }

      if (backup.value.locatarioId !== input.locatarioId) {
        return erroBackupNaoPertenceAoLocatario(input.backupId, input.locatarioId);
      }

      if (backup.value.status !== "CONCLUIDO" || !backup.value.referenciaResultado) {
        return erroBackupNaoDisponivelParaRestauracao(input.backupId);
      }

      const instante = deps.relogio.agora();

      const criada = await deps.importacoesRepositorio.criarImportacao({
        importacaoId: deps.idPorta.gerarId(),
        locatarioId: input.locatarioId,
        criadoPorUsuarioId: input.solicitadoPorUsuarioId,
        tipoOrigem: "ARQUIVO",
        referenciaOrigem: backup.value.referenciaResultado,
        status: "PENDENTE",
        mapeamentoColunas: {
          tipo: "RESTAURACAO_LOCATARIO",
          escopo: "LOCATARIO",
          locatarioId: input.locatarioId,
          exportacaoOrigemId: input.backupId,
          incluirAuditoriaLocatario: true,
          ignorarAuditoriaPlataforma: true,
          motivo: input.motivo,
        },
        estatisticas: {},
        mensagemErro: null,
        iniciadoEm: null,
        finalizadoEm: null,
        criadoEm: instante,
        atualizadoEm: instante,
      });

      if (!criada.ok) return criada;

      return wrapOk({ restauracao: mapRestauracao(criada.value) });
    });
  };
}

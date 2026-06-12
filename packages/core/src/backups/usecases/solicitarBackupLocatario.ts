// packages/core/src/backups/usecases/solicitarBackupLocatario.ts

import { ExportacoesRepositorio } from "../../exportacoes/index.js";
import { ErroApp, executarEmTransacao, IdPorta, TransacaoPorta, RelogioPorta, Result, wrapOk } from "../../kernel/index.js";
import { erroJaExisteBackupEmAberto } from "../erros.js";
import { ehBackupLocatario, mapBackup } from "../temp.js";
import { SolicitarBackupLocatarioInput, SolicitarBackupLocatarioOutput } from "../tipos.js";
import { validarSolicitarBackupLocatarioInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por solicitar um novo backup lógico
 * de um locatário.
 *
 * Este caso de uso inicia o fluxo de backup no módulo de backups.
 */

/**
 * Cria a função de caso de uso para solicitar backups de locatário.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo repositório de exportações, relógio, gerador de IDs e transação opcional.
 * @returns Função de caso de uso `solicitarBackupLocatario`.
 */
export function createFnSolicitarBackupLocatario(deps: {
  exportacoesRepositorio: ExportacoesRepositorio;
  relogio: RelogioPorta;
  idPorta: IdPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * Solicita um novo backup lógico de locatário.
   *
   * Regras:
   * - valida a entrada;
   * - não permite outro backup em aberto (`PENDENTE` ou `EM_EXECUCAO`);
   * - cria uma exportação especializada com metadados de backup;
   * - devolve o backup mapeado para o contrato do módulo.
   *
   * @param input Dados da solicitação de backup.
   * @returns `Ok({ backup })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function solicitarBackupLocatario(input: SolicitarBackupLocatarioInput): Promise<Result<SolicitarBackupLocatarioOutput, ErroApp>> {
    const validacao = validarSolicitarBackupLocatarioInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(deps.transacao, async () => {
      const exportacoes = await deps.exportacoesRepositorio.listarPorLocatario(input.locatarioId);
      if (!exportacoes.ok) return exportacoes;

      const backupEmAberto = exportacoes.value.find(
        (item) => ehBackupLocatario(item) && ["PENDENTE", "EM_EXECUCAO"].includes(item.status),
      );

      if (backupEmAberto) {
        return erroJaExisteBackupEmAberto(input.locatarioId);
      }

      const instante = deps.relogio.agora();

      const criada = await deps.exportacoesRepositorio.criarExportacao({
        exportacaoId: deps.idPorta.gerarId(),
        locatarioId: input.locatarioId,
        criadoPorUsuarioId: input.solicitadoPorUsuarioId,
        formato: "JSON",
        status: "PENDENTE",
        parametros: {
          tipo: "BACKUP_LOCATARIO",
          escopo: "LOCATARIO",
          locatarioId: input.locatarioId,
          incluirAuditoriaLocatario: true,
          formatoLogico: "SQL_ZIP",
        },
        referenciaResultado: null,
        mensagemErro: null,
        criadoEm: instante,
        atualizadoEm: instante,
      });

      if (!criada.ok) return criada;

      return wrapOk({ backup: mapBackup(criada.value) });
    });
  };
}

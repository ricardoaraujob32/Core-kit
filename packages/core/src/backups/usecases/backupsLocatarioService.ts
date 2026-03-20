// packages/core/src/backups/usecases/backupsLocatarioService.ts

import { Exportacao, ExportacoesRepositorio } from "../../exportacoes";
import { Importacao, ImportacoesRepositorio } from "../../importacoes";
import { ErroApp, IdPorta, PortaTransacao, RelogioPorta, Result, wrapOk } from "../../kernel";
import { erroBackupNaoDisponivelParaRestauracao, erroBackupNaoEncontrado, erroBackupNaoPertenceAoLocatario, erroJaExisteBackupEmAberto, erroJaExisteRestauracaoEmAberto } from "../erros";
import { BackupLocatario, ListarBackupsLocatarioInput, ListarBackupsLocatarioOutput, RestauracaoLocatario, SolicitarBackupLocatarioInput, SolicitarBackupLocatarioOutput, SolicitarRestauracaoLocatarioInput, SolicitarRestauracaoLocatarioOutput } from "../tipos";
import { validarListarBackupsLocatarioInput, validarSolicitarBackupLocatarioInput, validarSolicitarRestauracaoLocatarioInput } from "../validadores";

/**
 * 
 */
export interface CriarBackupsLocatarioServiceDeps {
  exportacoesRepositorio: ExportacoesRepositorio;
  importacoesRepositorio: ImportacoesRepositorio;
  transacao?: PortaTransacao;
  agora?: RelogioPorta;
  gerarId?: IdPorta;
}

/**
 * 
 * @param exportacao 
 * @returns 
 */
function ehBackupLocatario(exportacao: Exportacao): boolean {
  return exportacao.parametros?.tipo === "BACKUP_LOCATARIO";
}

/**
 * 
 * @param importacao 
 * @returns 
 */
function ehRestauracaoLocatario(importacao: Importacao): boolean {
  return importacao.mapeamentoColunas?.tipo === "RESTAURACAO_LOCATARIO";
}

/**
 * 
 * @param exportacao 
 * @returns 
 */
function mapBackup(exportacao: Exportacao): BackupLocatario {
  return {
    backupId: exportacao.exportacaoId,
    locatarioId: exportacao.locatarioId,
    solicitadoPorUsuarioId: exportacao.criadoPorUsuarioId ?? "",
    formato: exportacao.formato,
    status: exportacao.status as BackupLocatario["status"],
    parametros: exportacao.parametros,
    referenciaResultado: exportacao.referenciaResultado,
    mensagemErro: exportacao.mensagemErro,
    criadoEm: exportacao.criadoEm,
    atualizadoEm: exportacao.atualizadoEm,
  };
}

/**
 * 
 * @param importacao 
 * @returns 
 */
function mapRestauracao(importacao: Importacao): RestauracaoLocatario {
  return {
    restauracaoId: importacao.importacaoId,
    locatarioId: importacao.locatarioId,
    solicitadoPorUsuarioId: importacao.criadoPorUsuarioId ?? "",
    tipoOrigem: importacao.tipoOrigem,
    referenciaOrigem: importacao.referenciaOrigem,
    status: importacao.status as RestauracaoLocatario["status"],
    parametros: importacao.mapeamentoColunas,
    estatisticas: importacao.estatisticas,
    mensagemErro: importacao.mensagemErro,
    iniciadoEm: importacao.iniciadoEm,
    finalizadoEm: importacao.finalizadoEm,
    criadoEm: importacao.criadoEm,
    atualizadoEm: importacao.atualizadoEm,
  };
}

/**
 * 
 * @param deps 
 * @returns 
 */
export function criarBackupsLocatarioService(deps: CriarBackupsLocatarioServiceDeps) {
  const agora = deps.agora ?? (() => new Date());
  const gerarId = deps.gerarId ?? (() => crypto.randomUUID());

  async function executarEmTransacao<T>(
    fn: () => Promise<Result<T, ErroApp>>,
  ): Promise<Result<T, ErroApp>> {
    if (!deps.transacao) return fn();
    return deps.transacao.executar(fn);
  }

  async function solicitarBackupLocatario(input: SolicitarBackupLocatarioInput): Promise<Result<SolicitarBackupLocatarioOutput, ErroApp>> {
    const validacao = validarSolicitarBackupLocatarioInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(async () => {
      const exportacoes = await deps.exportacoesRepositorio.listarPorLocatario(
        input.locatarioId,
      );
      if (!exportacoes.ok) return exportacoes;

      const backupEmAberto = exportacoes.value.find(
        (item) =>
          ehBackupLocatario(item) &&
          (item.status === "PENDENTE" || item.status === "EM_EXECUCAO"),
      );

      if (backupEmAberto) {
        return erroJaExisteBackupEmAberto(input.locatarioId);
      }

      const instante = agora();

      const criada = await deps.exportacoesRepositorio.criarExportacao({
        exportacaoId: gerarId(),
        locatarioId: input.locatarioId,
        criadoPorUsuarioId: input.solicitadoPorUsuarioId,
        formato: "ZIP",
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

      return wrapOk({
        backup: mapBackup(criada.value),
      });
    });
  }

  async function listarBackupsLocatario(input: ListarBackupsLocatarioInput): Promise<Result<ListarBackupsLocatarioOutput, ErroApp>> {
    const validacao = validarListarBackupsLocatarioInput(input);
    if (!validacao.ok) return validacao;

    const exportacoes = await deps.exportacoesRepositorio.listarPorLocatario(
      input.locatarioId,
    );
    if (!exportacoes.ok) return exportacoes;

    return wrapOk({
      locatarioId: input.locatarioId,
      backups: exportacoes.value.filter(ehBackupLocatario).map(mapBackup),
    });
  }

  async function solicitarRestauracaoLocatario(input: SolicitarRestauracaoLocatarioInput): Promise<Result<SolicitarRestauracaoLocatarioOutput, ErroApp>> {
    const validacao = validarSolicitarRestauracaoLocatarioInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(async () => {
      const importacoes = await deps.importacoesRepositorio.listarPorLocatario(
        input.locatarioId,
      );
      if (!importacoes.ok) return importacoes;

      const restauracaoEmAberto = importacoes.value.find(
        (item) =>
          ehRestauracaoLocatario(item) &&
          (item.status === "PENDENTE" || item.status === "EM_EXECUCAO"),
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
        return erroBackupNaoPertenceAoLocatario(
          input.backupId,
          input.locatarioId,
        );
      }

      if (
        backup.value.status !== "CONCLUIDO" ||
        !backup.value.referenciaResultado
      ) {
        return erroBackupNaoDisponivelParaRestauracao(input.backupId);
      }

      const instante = agora();

      const criada = await deps.importacoesRepositorio.criarImportacao({
        importacaoId: gerarId(),
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

      return wrapOk({
        restauracao: mapRestauracao(criada.value),
      });
    });
  }

  return {
    solicitarBackupLocatario,
    listarBackupsLocatario,
    solicitarRestauracaoLocatario,
  };
}

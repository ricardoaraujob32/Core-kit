import { Exportacao } from "../exportacoes";
import { Importacao } from "../importacoes";
import { BackupLocatario, RestauracaoLocatario } from "./tipos";

/**
 * Verifica se uma exportação representa semanticamente um backup de locatário.
 *
 * A decisão é baseada no metadado `parametros.tipo === "BACKUP_LOCATARIO"`.
 *
 * @param exportacao Exportação a ser inspecionada.
 * @returns `true` quando a exportação representa um backup lógico de locatário.
 */
export function ehBackupLocatario(exportacao: Exportacao): boolean {
  return exportacao.parametros?.tipo === "BACKUP_LOCATARIO";
}

/**
 * Verifica se uma importação representa semanticamente uma restauração de locatário.
 *
 * A decisão é baseada no metadado `mapeamentoColunas.tipo === "RESTAURACAO_LOCATARIO"`.
 *
 * @param importacao Importação a ser inspecionada.
 * @returns `true` quando a importação representa uma restauração lógica de locatário.
 */
export function ehRestauracaoLocatario(importacao: Importacao): boolean {
  return importacao.mapeamentoColunas?.tipo === "RESTAURACAO_LOCATARIO";
}

/**
 * Converte uma exportação persistida em uma projeção de domínio `BackupLocatario`.
 *
 * Este mapeamento adapta o contrato de exportações para o contrato público do
 * módulo de backups.
 *
 * @param exportacao Exportação persistida que representa um backup.
 * @returns Projeção de backup no formato esperado pelo módulo `backups`.
 */
export function mapBackup(exportacao: Exportacao): BackupLocatario {
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
 * Converte uma importação persistida em uma projeção de domínio `RestauracaoLocatario`.
 *
 * Este mapeamento adapta o contrato de importações para o contrato público do
 * módulo de backups.
 *
 * @param importacao Importação persistida que representa uma restauração.
 * @returns Projeção de restauração no formato esperado pelo módulo `backups`.
 */
export function mapRestauracao(importacao: Importacao): RestauracaoLocatario {
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
 * Dependências necessárias para criação do serviço de backup e restauração de locatário.
 *
 * Este serviço orquestra os módulos de exportações e importações para implementar
 * backup lógico e restauração lógica de locatários sem persistência própria.
 *
 * Dependências:
 * - `exportacoesRepositorio`: criação e consulta das exportações que representam backups;
 * - `importacoesRepositorio`: criação e consulta das importações que representam restaurações;
 * - `transacao`: execução opcional de operações compostas com atomicidade;
 * - `agora`: relógio opcional para materialização de timestamps;
 * - `gerarId`: gerador opcional de identificadores das entidades criadas.
 */
// export interface CriarBackupsLocatarioServiceDeps {
//   exportacoesRepositorio: ExportacoesRepositorio;
//   importacoesRepositorio: ImportacoesRepositorio;
//   transacao?: PortaTransacao;
//   agora?: RelogioPorta;
//   gerarId?: IdPorta;
// }

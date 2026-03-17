export type ExportacaoId = string;

export type FormatoExportacao = "CSV" | "XLSX" | "JSON" | "PDF";

export type StatusJob =
  | "PENDENTE"
  | "EM_EXECUCAO"
  | "CONCLUIDO"
  | "FALHOU"
  | "CANCELADO";

export interface Exportacao {
  exportacaoId: ExportacaoId;
  locatarioId: LocatarioId;
  criadoPorUsuarioId: UsuarioId | null;
  formato: FormatoExportacao;
  status: StatusJob;
  parametros: Record<string, unknown>;
  referenciaResultado: string | null;
  mensagemErro: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface SolicitarExportacaoInput {
  locatarioId: LocatarioId;
  criadoPorUsuarioId?: UsuarioId | null;
  formato: FormatoExportacao;
  parametros?: Record<string, unknown>;
}

export interface SolicitarExportacaoOutput {
  exportacao: Exportacao;
}

export interface ListarExportacoesLocatarioInput {
  locatarioId: LocatarioId;
}

export interface ListarExportacoesLocatarioOutput {
  locatarioId: LocatarioId;
  exportacoes: Exportacao[];
}

export interface MarcarExportacaoEmExecucaoInput {
  exportacaoId: ExportacaoId;
}

export interface MarcarExportacaoConcluidaInput {
  exportacaoId: ExportacaoId;
  referenciaResultado: string;
}

export interface MarcarExportacaoComFalhaInput {
  exportacaoId: ExportacaoId;
  mensagemErro: string;
}

export interface RegistrarExportacaoParams {
  exportacaoId?: ExportacaoId;
  locatarioId: LocatarioId;
  criadoPorUsuarioId?: UsuarioId | null;
  formato: FormatoExportacao;
  status: StatusJob;
  parametros: Record<string, unknown>;
  referenciaResultado?: string | null;
  mensagemErro?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}
export type ImportacaoId = string;
export type ItemImportacaoId = string;

export type TipoOrigemImportacao =
  | "ARQUIVO"
  | "PLANILHA"
  | "URL"
  | "SISTEMA_EXTERNO";

export type StatusJob =
  | "PENDENTE"
  | "EM_EXECUCAO"
  | "CONCLUIDO"
  | "FALHOU"
  | "CANCELADO";

export interface Importacao {
  importacaoId: ImportacaoId;
  locatarioId: LocatarioId;
  criadoPorUsuarioId: UsuarioId | null;
  tipoOrigem: TipoOrigemImportacao;
  referenciaOrigem: string | null;
  status: StatusJob;
  mapeamentoColunas: Record<string, unknown>;
  estatisticas: Record<string, unknown>;
  mensagemErro: string | null;
  iniciadoEm: Date | null;
  finalizadoEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface ItemImportacao {
  itemImportacaoId: ItemImportacaoId;
  importacaoId: ImportacaoId;
  locatarioId: LocatarioId;
  numeroLinha: number;
  dadosBrutos: Record<string, unknown>;
  status: StatusJob;
  detalheErro: string | null;
  criadoEm: Date;
}

export interface SolicitarImportacaoInput {
  locatarioId: LocatarioId;
  criadoPorUsuarioId?: UsuarioId | null;
  tipoOrigem: TipoOrigemImportacao;
  referenciaOrigem?: string | null;
  mapeamentoColunas?: Record<string, unknown>;
}

export interface SolicitarImportacaoOutput {
  importacao: Importacao;
}

export interface RegistrarItemImportacaoInput {
  importacaoId: ImportacaoId;
  locatarioId: LocatarioId;
  numeroLinha: number;
  dadosBrutos: Record<string, unknown>;
}

export interface ListarImportacoesLocatarioInput {
  locatarioId: LocatarioId;
}

export interface ListarItensImportacaoInput {
  importacaoId: ImportacaoId;
  locatarioId: LocatarioId;
}

export interface MarcarImportacaoEmExecucaoInput {
  importacaoId: ImportacaoId;
}

export interface MarcarImportacaoConcluidaInput {
  importacaoId: ImportacaoId;
  estatisticas?: Record<string, unknown>;
}

export interface MarcarImportacaoComFalhaInput {
  importacaoId: ImportacaoId;
  mensagemErro: string;
}

export interface MarcarItemImportacaoProcessadoInput {
  itemImportacaoId: ItemImportacaoId;
}

export interface MarcarItemImportacaoComFalhaInput {
  itemImportacaoId: ItemImportacaoId;
  detalheErro: string;
}

export interface RegistrarImportacaoParams {
  importacaoId?: ImportacaoId;
  locatarioId: LocatarioId;
  criadoPorUsuarioId?: UsuarioId | null;
  tipoOrigem: TipoOrigemImportacao;
  referenciaOrigem?: string | null;
  status: StatusJob;
  mapeamentoColunas: Record<string, unknown>;
  estatisticas: Record<string, unknown>;
  mensagemErro?: string | null;
  iniciadoEm?: Date | null;
  finalizadoEm?: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface RegistrarItemImportacaoParams {
  itemImportacaoId?: ItemImportacaoId;
  importacaoId: ImportacaoId;
  locatarioId: LocatarioId;
  numeroLinha: number;
  dadosBrutos: Record<string, unknown>;
  status: StatusJob;
  detalheErro?: string | null;
  criadoEm: Date;
}
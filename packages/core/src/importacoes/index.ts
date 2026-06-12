// packages/core/src/importacoes/index.ts



export type {
  Importacao,
  ImportacaoId,
  ItemImportacao,
  ItemImportacaoId,
  RegistrarItemImportacaoInput,
  SolicitarImportacaoInput,
  SolicitarImportacaoOutput,
  TipoOrigemImportacao,
} from "./tipos.js";

export type {
  ImportacoesRepositorio,
  ItensImportacaoRepositorio,
} from "./portasRepositorio.js";

export { createFnListarImportacoesLocatario } from "./usecases/listarImportacoesLocatario.js";
export { createFnListarItensImportacao } from "./usecases/listarItensImportacao.js";
export { createFnMarcarImportacaoComFalha } from "./usecases/marcarImportacaoComFalha.js";
export { createFnMarcarImportacaoConcluida } from "./usecases/marcarImportacaoConcluida.js";
export { createFnMarcarImportacaoEmExecucao } from "./usecases/marcarImportacaoEmExecucao.js";
export { createFnMarcarItemImportacaoComFalha } from "./usecases/marcarItemImportacaoComFalha.js";
export { createFnMarcarItemImportacaoProcessado } from "./usecases/marcarItemImportacaoProcessado.js";
export { createFnRegistrarItemImportacao } from "./usecases/registrarItemImportacao.js";
export { createFnSolicitarImportacao } from "./usecases/solicitarImportacao.js";
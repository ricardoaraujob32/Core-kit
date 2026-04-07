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
} from "./tipos";

export type {
  ImportacoesRepositorio,
  ItensImportacaoRepositorio,
} from "./portasRepositorio";

export { createFnListarImportacoesLocatario } from "./usecases/listarImportacoesLocatario";
export { createFnListarItensImportacao } from "./usecases/listarItensImportacao";
export { createFnMarcarImportacaoComFalha } from "./usecases/marcarImportacaoComFalha";
export { createFnMarcarImportacaoConcluida } from "./usecases/marcarImportacaoConcluida";
export { createFnMarcarImportacaoEmExecucao } from "./usecases/marcarImportacaoEmExecucao";
export { createFnMarcarItemImportacaoComFalha } from "./usecases/marcarItemImportacaoComFalha";
export { createFnMarcarItemImportacaoProcessado } from "./usecases/marcarItemImportacaoProcessado";
export { createFnRegistrarItemImportacao } from "./usecases/registrarItemImportacao";
export { createFnSolicitarImportacao } from "./usecases/solicitarImportacao";
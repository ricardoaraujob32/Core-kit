// packages/core/src/exportacoes/index.ts



export type {
  Exportacao,
  ExportacaoId,
  FormatoExportacao,
  ListarExportacoesLocatarioInput,
  ListarExportacoesLocatarioOutput,
  MarcarExportacaoComFalhaInput,
  MarcarExportacaoConcluidaInput,
  MarcarExportacaoEmExecucaoInput,
  SolicitarExportacaoInput,
  SolicitarExportacaoOutput,
} from "./tipos.js";

export type { ExportacoesRepositorio } from "./portasRepositorio.js";

export { createFnListarExportacoesLocatario } from "./usecases/listarExportacoesLocatario.js";
export { createFnMarcarExportacaoComFalha } from "./usecases/marcarExportacaoComFalha.js";
export { createFnMarcarExportacaoConcluida } from "./usecases/marcarExportacaoConcluida.js";
export { createFnMarcarExportacaoEmExecucao} from "./usecases/marcarExportacaoEmExecucao.js";
export { createFnSolicitarExportacao } from "./usecases/solicitarExportacao.js";
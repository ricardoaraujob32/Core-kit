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
} from "./tipos";

export type { ExportacoesRepositorio } from "./portasRepositorio";

export { createFnListarExportacoesLocatario } from "./usecases/listarExportacoesLocatario";
export { createFnMarcarExportacaoComFalha } from "./usecases/marcarExportacaoComFalha";
export { createFnMarcarExportacaoConcluida } from "./usecases/marcarExportacaoConcluida";
export { createFnMarcarExportacaoEmExecucao} from "./usecases/marcarExportacaoEmExecucao";
export { createFnSolicitarExportacao } from "./usecases/solicitarExportacao";
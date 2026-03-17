export { criarExportacoesService } from "./usecases/exportacoesService";
export { ExportacoesRepositorioMemoria } from "./repositorioMemoria";

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
  StatusJob,
} from "./tipos";

export type {
  ExportacoesRepositorio,
  PortaTransacao,
} from "./portasRepositorio";
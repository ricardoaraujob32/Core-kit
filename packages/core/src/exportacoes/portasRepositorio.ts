import type { ErroApp } from "../kernel/erros";
import type { Result } from "../kernel/result";
import type {
  Exportacao,
  ExportacaoId,
  LocatarioId,
  RegistrarExportacaoParams,
} from "./tipos";

export interface PortaTransacao {
  executar<T>(
    fn: () => Promise<Result<T, ErroApp>>,
  ): Promise<Result<T, ErroApp>>;
}

export interface ExportacoesRepositorio {
  criarExportacao(
    params: RegistrarExportacaoParams,
  ): Promise<Result<Exportacao, ErroApp>>;

  atualizarExportacao(
    exportacao: Exportacao,
  ): Promise<Result<Exportacao, ErroApp>>;

  buscarPorId(
    exportacaoId: ExportacaoId,
  ): Promise<Result<Exportacao | null, ErroApp>>;

  listarPorLocatario(
    locatarioId: LocatarioId,
  ): Promise<Result<Exportacao[], ErroApp>>;
}
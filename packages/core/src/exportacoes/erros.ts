import type { ErroApp } from "../kernel/erros";
import type { Result } from "../kernel/result";
import { createErroApp, wrapErr } from "../kernel/ROPHelpers";
import type { ExportacaoId } from "./tipos";

export function erroExportacaoInvalida(
  detalhes?: Record<string, unknown>,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp("EXPORTACAO_INVALIDA", "Dados da exportação são inválidos.", detalhes),
  );
}

export function erroExportacaoNaoEncontrada(
  exportacaoId: ExportacaoId,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp("EXPORTACAO_NAO_ENCONTRADA", "Exportação não encontrada.", {
      exportacaoId,
    }),
  );
}

export function erroTransicaoStatusExportacaoInvalida(
  exportacaoId: ExportacaoId,
  statusAtual: string,
  statusDestino: string,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp(
      "EXPORTACAO_TRANSICAO_STATUS_INVALIDA",
      "A transição de status da exportação é inválida.",
      { exportacaoId, statusAtual, statusDestino },
    ),
  );
}
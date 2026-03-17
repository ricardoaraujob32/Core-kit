import type { ErroApp } from "../kernel/erros";
import type { Result } from "../kernel/result";
import { createErroApp, wrapErr } from "../kernel/ROPHelpers";

export function erroImportacaoInvalida(
  detalhes?: Record<string, unknown>,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp("IMPORTACAO_INVALIDA", "Dados da importação são inválidos.", detalhes),
  );
}

export function erroImportacaoNaoEncontrada(
  importacaoId: string,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp("IMPORTACAO_NAO_ENCONTRADA", "Importação não encontrada.", {
      importacaoId,
    }),
  );
}

export function erroItemImportacaoNaoEncontrado(
  itemImportacaoId: string,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp(
      "ITEM_IMPORTACAO_NAO_ENCONTRADO",
      "Item de importação não encontrado.",
      { itemImportacaoId },
    ),
  );
}

export function erroTransicaoStatusImportacaoInvalida(
  entidade: string,
  id: string,
  statusAtual: string,
  statusDestino: string,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp(
      "IMPORTACAO_TRANSICAO_STATUS_INVALIDA",
      "A transição de status é inválida.",
      { entidade, id, statusAtual, statusDestino },
    ),
  );
}
import { wrapOk } from "../../kernel/index.js";
import type { OrdensServicoRepositorio } from "../portasRepositorio.js";
import type { ListarOrdensServicoInput, ListarOrdensServicoResult } from "../tipos.js";
import { validarLocatarioId, validarStatusOrdemServico } from "../validadores.js";

export function createFnListarOrdensServico(deps: { ordensServicoRepositorio: OrdensServicoRepositorio }) {
  return async function listarOrdensServico(input: ListarOrdensServicoInput): ListarOrdensServicoResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const status = validarStatusOrdemServico(input.status);
    if (!status.ok) return status;

    const itens = await deps.ordensServicoRepositorio.listar({
      locatarioId: locatarioId.value,
      status: status.value,
      clienteId: input.clienteId ?? undefined,
      cursor: input.cursor,
      limite: input.limite,
    });
    if (!itens.ok) return itens;

    return wrapOk({ itens: itens.value });
  };
}

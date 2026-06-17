import { wrapOk } from "../../kernel/index.js";
import { ordemServicoNaoEncontrada } from "../erros.js";
import type { OrdensServicoRepositorio } from "../portasRepositorio.js";
import type { ObterOrdemServicoInput, ObterOrdemServicoResult } from "../tipos.js";
import { validarLocatarioId, validarOrdemServicoId } from "../validadores.js";

export function createFnObterOrdemServico(deps: { ordensServicoRepositorio: OrdensServicoRepositorio }) {
  return async function obterOrdemServico(input: ObterOrdemServicoInput): ObterOrdemServicoResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;
    const ordemServicoId = validarOrdemServicoId(input.ordemServicoId);
    if (!ordemServicoId.ok) return ordemServicoId;

    const ordemServico = await deps.ordensServicoRepositorio.buscarPorId({ locatarioId: locatarioId.value, ordemServicoId: ordemServicoId.value });
    if (!ordemServico.ok) return ordemServico;
    if (!ordemServico.value) return ordemServicoNaoEncontrada(ordemServicoId.value);

    return wrapOk({ ordemServico: ordemServico.value });
  };
}

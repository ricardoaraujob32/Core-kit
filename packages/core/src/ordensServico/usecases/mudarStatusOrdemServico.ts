import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel/index.js";
import { ordemServicoNaoEncontrada } from "../erros.js";
import type { OrdensServicoRepositorio } from "../portasRepositorio.js";
import type { CancelarOrdemServicoInput, EventoOrdemServico, MudarStatusOrdemServicoInput, MudarStatusOrdemServicoResult } from "../tipos.js";
import { transicionarEstadoOrdemServico } from "../maquinaEstados.js";
import { validarLocatarioId, validarOrdemServicoId } from "../validadores.js";

function createFnMudarStatusOrdemServico(deps: { ordensServicoRepositorio: OrdensServicoRepositorio; relogio: RelogioPorta; transacao?: TransacaoPorta }, evento: EventoOrdemServico) {
  return async function mudarStatus(input: MudarStatusOrdemServicoInput | CancelarOrdemServicoInput): MudarStatusOrdemServicoResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;
    const ordemServicoId = validarOrdemServicoId(input.ordemServicoId);
    if (!ordemServicoId.ok) return ordemServicoId;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.ordensServicoRepositorio.buscarPorId({ locatarioId: locatarioId.value, ordemServicoId: ordemServicoId.value });
      if (!atual.ok) return atual;
      if (!atual.value) return ordemServicoNaoEncontrada(ordemServicoId.value);

      const proximoStatus = transicionarEstadoOrdemServico({ ordemServicoId: ordemServicoId.value, statusAtual: atual.value.status, evento });
      if (!proximoStatus.ok) return proximoStatus;

      const ordemServico = await deps.ordensServicoRepositorio.atualizarStatus({
        locatarioId: locatarioId.value,
        ordemServicoId: ordemServicoId.value,
        status: proximoStatus.value,
        fechadaEm: proximoStatus.value === "CONCLUIDA" || proximoStatus.value === "CANCELADA" ? deps.relogio.agora() : null,
      });
      if (!ordemServico.ok) return ordemServico;

      return wrapOk({ ordemServico: ordemServico.value });
    });
  };
}

export function createFnIniciarOrdemServico(deps: { ordensServicoRepositorio: OrdensServicoRepositorio; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return createFnMudarStatusOrdemServico(deps, "INICIAR");
}

export function createFnAguardarOrdemServico(deps: { ordensServicoRepositorio: OrdensServicoRepositorio; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return createFnMudarStatusOrdemServico(deps, "AGUARDAR");
}

export function createFnConcluirOrdemServico(deps: { ordensServicoRepositorio: OrdensServicoRepositorio; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return createFnMudarStatusOrdemServico(deps, "CONCLUIR");
}

export function createFnCancelarOrdemServico(deps: { ordensServicoRepositorio: OrdensServicoRepositorio; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return createFnMudarStatusOrdemServico(deps, "CANCELAR");
}

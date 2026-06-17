import { executarEmTransacao, type TransacaoPorta, wrapOk } from "../../kernel/index.js";
import { ordemServicoNaoEncontrada, ordemServicoTransicaoInvalida } from "../erros.js";
import type { OrdensServicoRepositorio } from "../portasRepositorio.js";
import type { AtualizarOrdemServicoInput, AtualizarOrdemServicoResult } from "../tipos.js";
import { validarDescricao, validarLocatarioId, validarOrdemServicoId, validarTitulo } from "../validadores.js";

export function createFnAtualizarOrdemServico(deps: { ordensServicoRepositorio: OrdensServicoRepositorio; transacao?: TransacaoPorta }) {
  return async function atualizarOrdemServico(input: AtualizarOrdemServicoInput): AtualizarOrdemServicoResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;
    const ordemServicoId = validarOrdemServicoId(input.ordemServicoId);
    if (!ordemServicoId.ok) return ordemServicoId;

    let titulo: string | undefined;
    if (input.titulo !== undefined) {
      const validado = validarTitulo(input.titulo);
      if (!validado.ok) return validado;
      titulo = validado.value;
    }

    let descricao: string | null | undefined;
    if (input.descricao !== undefined) {
      const validada = validarDescricao(input.descricao);
      if (!validada.ok) return validada;
      descricao = validada.value;
    }

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.ordensServicoRepositorio.buscarPorId({ locatarioId: locatarioId.value, ordemServicoId: ordemServicoId.value });
      if (!atual.ok) return atual;
      if (!atual.value) return ordemServicoNaoEncontrada(ordemServicoId.value);
      if (atual.value.status === "CONCLUIDA" || atual.value.status === "CANCELADA") {
        return ordemServicoTransicaoInvalida(ordemServicoId.value, atual.value.status, "ATUALIZAR");
      }

      const ordemServico = await deps.ordensServicoRepositorio.atualizar({
        locatarioId: locatarioId.value,
        ordemServicoId: ordemServicoId.value,
        clienteId: input.clienteId,
        titulo,
        descricao,
      });
      if (!ordemServico.ok) return ordemServico;
      return wrapOk({ ordemServico: ordemServico.value });
    });
  };
}

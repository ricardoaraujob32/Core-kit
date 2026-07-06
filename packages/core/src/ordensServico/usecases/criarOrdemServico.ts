import { executarEmTransacao, type TransacaoPorta, wrapOk } from "../../kernel/index.js";
import type { OrdensServicoRepositorio } from "../portasRepositorio.js";
import type { CriarOrdemServicoInput, CriarOrdemServicoResult } from "../tipos.js";
import { validarDescricao, validarLocatarioId, validarTitulo } from "../validadores.js";

export function createFnCriarOrdemServico(deps: {
  ordensServicoRepositorio: OrdensServicoRepositorio;
  transacao?: TransacaoPorta;
}) {
  return async function criarOrdemServico(
    input: CriarOrdemServicoInput,
  ): CriarOrdemServicoResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const titulo = validarTitulo(input.titulo);
    if (!titulo.ok) return titulo;

    const descricao = validarDescricao(input.descricao);
    if (!descricao.ok) return descricao;

    return executarEmTransacao(deps.transacao, async () => {
      const ordemServico = await deps.ordensServicoRepositorio.criar({
        locatarioId: locatarioId.value,
        clienteId: input.clienteId ?? null,
        servicoId: input.servicoId ?? null,
        titulo: titulo.value,
        descricao: descricao.value,
      });

      if (!ordemServico.ok) return ordemServico;

      return wrapOk({ ordemServico: ordemServico.value });
    });
  };
}

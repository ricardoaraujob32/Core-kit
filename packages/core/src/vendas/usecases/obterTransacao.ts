import { wrapOk } from "../../kernel";
import type { VendasRepositorio } from "../portasRepositorio";
import type { ObterTransacaoInput, ObterTransacaoOutput, ObterTransacaoResult } from "../tipos";
import { transacaoNaoEncontrada } from "../erros";
import { validarLocatarioId, validarTransacaoId } from "../validadores";

export function createFnObterTransacao(deps: { vendasRepositorio: VendasRepositorio }) {
  return async function obterTransacao(input: ObterTransacaoInput): ObterTransacaoResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const transacaoId = validarTransacaoId(input.transacaoId); if (!transacaoId.ok) return transacaoId;
    const transacao = await deps.vendasRepositorio.buscarTransacaoPorId({ locatarioId: locatarioId.value, transacaoId: transacaoId.value }); if (!transacao.ok) return transacao;
    if (!transacao.value) return transacaoNaoEncontrada(transacaoId.value);
    const itens = await deps.vendasRepositorio.listarItens({ locatarioId: locatarioId.value, transacaoId: transacaoId.value }); if (!itens.ok) return itens;
    const historico = await deps.vendasRepositorio.listarHistorico({ locatarioId: locatarioId.value, transacaoId: transacaoId.value }); if (!historico.ok) return historico;
    return wrapOk<ObterTransacaoOutput>({ transacao: transacao.value, itens: itens.value, historico: historico.value });
  };
}

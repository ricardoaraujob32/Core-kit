import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
import type { VendasRepositorio } from "../portasRepositorio";
import type { CriarCompraInput, CriarCompraOutput, CriarCompraResult } from "../tipos";
import { validarLocatarioId, validarTextoOpcional } from "../validadores";
import { criarHistoricoTransacao } from "./helpers";

export function createFnCriarCompra(deps: { vendasRepositorio: VendasRepositorio; idPorta: IdPorta; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return async function criarCompra(input: CriarCompraInput): CriarCompraResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const observacao = validarTextoOpcional(input.observacao); if (!observacao.ok) return observacao;
    return executarEmTransacao(deps.transacao, async () => {
      const agora = deps.relogio.agora();
      const transacao = { transacaoId: deps.idPorta.gerarId(), locatarioId: locatarioId.value, tipo: "COMPRA" as const, clienteId: null, fornecedorId: input.fornecedorId ?? null, status: "RASCUNHO" as const, valorSubtotal: 0, valorDesconto: 0, valorAcrescimo: 0, valorTotal: 0, observacao: observacao.value, criadoEm: agora, atualizadoEm: agora, canceladoEm: null, canceladoPor: null, canceladoMotivo: null, excluidoEm: null, excluidoPor: null, excluidoMotivo: null };
      const res = await deps.vendasRepositorio.criarTransacao(transacao); if (!res.ok) return res;
      const hist = await deps.vendasRepositorio.criarHistorico(criarHistoricoTransacao({ idPorta: deps.idPorta, relogio: deps.relogio, transacao, evento: "COMPRA_CRIADA", resumo: "Compra criada em rascunho.", usuarioId: input.usuarioId, statusNovo: transacao.status })); if (!hist.ok) return hist;
      return wrapOk<CriarCompraOutput>({ transacaoId: res.value.transacaoId });
    });
  };
}

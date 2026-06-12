import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel/index.js";
import type { VendasRepositorio } from "../portasRepositorio.js";
import type { CriarVendaInput, CriarVendaOutput, CriarVendaResult } from "../tipos.js";
import { validarLocatarioId, validarTextoOpcional } from "../validadores.js";
import { criarHistoricoTransacao } from "./helpers.js";

export function createFnCriarVenda(deps: { vendasRepositorio: VendasRepositorio; idPorta: IdPorta; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return async function criarVenda(input: CriarVendaInput): CriarVendaResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const observacao = validarTextoOpcional(input.observacao); if (!observacao.ok) return observacao;
    return executarEmTransacao(deps.transacao, async () => {
      const agora = deps.relogio.agora();
      const transacao = { transacaoId: deps.idPorta.gerarId(), locatarioId: locatarioId.value, tipo: "VENDA" as const, clienteId: input.clienteId ?? null, fornecedorId: null, status: "RASCUNHO" as const, valorSubtotal: 0, valorDesconto: 0, valorAcrescimo: 0, valorTotal: 0, observacao: observacao.value, criadoEm: agora, atualizadoEm: agora, canceladoEm: null, canceladoPor: null, canceladoMotivo: null, excluidoEm: null, excluidoPor: null, excluidoMotivo: null };
      const res = await deps.vendasRepositorio.criarTransacao(transacao); if (!res.ok) return res;
      const hist = await deps.vendasRepositorio.criarHistorico(criarHistoricoTransacao({ idPorta: deps.idPorta, relogio: deps.relogio, transacao, evento: "VENDA_CRIADA", resumo: "Venda criada em rascunho.", usuarioId: input.usuarioId, statusNovo: transacao.status })); if (!hist.ok) return hist;
      return wrapOk<CriarVendaOutput>({ transacaoId: res.value.transacaoId });
    });
  };
}

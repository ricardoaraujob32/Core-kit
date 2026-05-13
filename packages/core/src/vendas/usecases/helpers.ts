// packages/core/src/vendas/usecases/helpers.ts

import type { IdPorta, RelogioPorta } from "../../kernel";
import { UsuarioId } from "../../usuarios";
import type { HistoricoTransacaoComercial, StatusTransacaoComercial, TransacaoComercial } from "../tipos";

export function calcularTotais(
  itens: Array<{ quantidade: number; valorUnitario: number; valorDesconto: number }>,
  base: TransacaoComercial,
): TransacaoComercial {
  const valorSubtotal = itens.reduce((acc, item) => acc + item.quantidade * item.valorUnitario, 0);
  const valorDesconto = itens.reduce((acc, item) => acc + item.valorDesconto, 0);
  return {
    ...base,
    valorSubtotal,
    valorDesconto,
    valorTotal: valorSubtotal - valorDesconto + base.valorAcrescimo,
  };
}

export function criarHistoricoTransacao(params: { idPorta: IdPorta; relogio: RelogioPorta; transacao: TransacaoComercial; evento: string; resumo: string; usuarioId?: UsuarioId | null; statusAnterior?: StatusTransacaoComercial | null; statusNovo?: StatusTransacaoComercial | null; detalhes?: Record<string, unknown> }): HistoricoTransacaoComercial {
  return { historicoId: params.idPorta.gerarId(), locatarioId: params.transacao.locatarioId, transacaoId: params.transacao.transacaoId, evento: params.evento, statusAnterior: params.statusAnterior ?? null, statusNovo: params.statusNovo ?? null, resumo: params.resumo, detalhes: params.detalhes ?? {}, criadoEm: params.relogio.agora(), criadoPor: params.usuarioId ?? null };
}

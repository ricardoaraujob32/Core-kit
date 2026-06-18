// apps/web/src/features/tenant-admin/transacoes/transacao.viewModel.ts

import type { TenantViewModel } from "../../../shared/tenantViewModel";
import {
  fallbackTexto,
  formatarDataBR,
  formatarMoedaBR,
  juntarPartes,
} from "../../../shared/tenantViewModel";

export type TransacaoViewModelInput = {
  transacaoId: string;
  tipo?: string | null;
  status?: string | null;
  criadoEm?: string | Date | null;
  data?: string | Date | null;
  clienteNome?: string | null;
  fornecedorNome?: string | null;
  pessoaNome?: string | null;
  valorTotal?: number | string | null;
  quantidadeItens?: number | string | null;
};

function labelTipo(tipo?: string | null): string {
  switch (tipo) {
    case "VENDA":
      return "Venda";
    case "COMPRA":
      return "Compra";
    default:
      return fallbackTexto(tipo, "Transação");
  }
}

export function toTransacaoViewModel(
  transacao: TransacaoViewModelInput,
): TenantViewModel {
  const data = formatarDataBR(transacao.criadoEm ?? transacao.data);
  const pessoa =
    transacao.pessoaNome ??
    transacao.clienteNome ??
    transacao.fornecedorNome ??
    "Pessoa não informada";

  return {
    key: transacao.transacaoId,
    titulo: juntarPartes([labelTipo(transacao.tipo), data]) ?? labelTipo(transacao.tipo),
    subtitulo: pessoa,
    contexto: juntarPartes([
      formatarMoedaBR(transacao.valorTotal)
        ? `Valor: ${formatarMoedaBR(transacao.valorTotal)}`
        : undefined,
      transacao.quantidadeItens !== null && transacao.quantidadeItens !== undefined
        ? `Itens: ${transacao.quantidadeItens}`
        : undefined,
    ]),
    status: transacao.status ?? undefined,
  };
}

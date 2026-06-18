// apps/web/src/features/tenant-admin/financeiro/financeiro.viewModel.ts

import type { TenantViewModel } from "../../../shared/tenantViewModel";
import {
  fallbackTexto,
  formatarDataBR,
  formatarMoedaBR,
  juntarPartes,
} from "../../../shared/tenantViewModel";

export type FinanceiroViewModelInput = {
  transacaoId: string;
  descricao?: string | null;
  tipo?: string | null;
  status?: string | null;
  pessoaNome?: string | null;
  clienteNome?: string | null;
  fornecedorNome?: string | null;
  vencimentoEm?: string | Date | null;
  data?: string | Date | null;
  valor?: number | string | null;
  valorTotal?: number | string | null;
};

export function toFinanceiroViewModel(
  item: FinanceiroViewModelInput,
): TenantViewModel {
  const data = formatarDataBR(item.vencimentoEm ?? item.data);
  const valor = formatarMoedaBR(item.valor ?? item.valorTotal);
  const pessoa =
    item.pessoaNome ??
    item.clienteNome ??
    item.fornecedorNome ??
    "Pessoa não informada";

  return {
    key: item.transacaoId,
    titulo:
      item.descricao ??
      juntarPartes([fallbackTexto(item.tipo, "Conta financeira"), data]) ??
      "Conta financeira",
    subtitulo: pessoa,
    contexto: valor ? `Valor: ${valor}` : undefined,
    status: item.status ?? undefined,
  };
}

// apps/web/src/features/tenant-admin/financeiro/api/financeiroApi.ts

import { httpClient } from "../../../../core/api/httpClient";
import type { ListarContasFinanceirasParams, ListarContasFinanceirasResponse, ObterResumoFinanceiroResponse } from "../tipos";

function buildQuery(params: ListarContasFinanceirasParams = {}): string {
  const query = new URLSearchParams();

  if (params.status) query.set("status", params.status);
  if (params.vencidas !== undefined) query.set("vencidas", String(params.vencidas));
  if (params.dataInicial) query.set("dataInicial", params.dataInicial);
  if (params.dataFinal) query.set("dataFinal", params.dataFinal);
  if (params.cursor) query.set("cursor", params.cursor);
  if (params.limite) query.set("limite", String(params.limite));

  const value = query.toString();
  return value ? `?${value}` : "";
}

export const financeiroApi = {
  obterResumo(): Promise<ObterResumoFinanceiroResponse> {
    return httpClient.get<ObterResumoFinanceiroResponse>("/financeiro/resumo");
  },

  listarContasReceber(params?: ListarContasFinanceirasParams): Promise<ListarContasFinanceirasResponse> {
    return httpClient.get<ListarContasFinanceirasResponse>(`/financeiro/contas-receber${buildQuery(params)}`);
  },

  listarContasPagar(params?: ListarContasFinanceirasParams): Promise<ListarContasFinanceirasResponse> {
    return httpClient.get<ListarContasFinanceirasResponse>(`/financeiro/contas-pagar${buildQuery(params)}`);
  },
};

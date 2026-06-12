// apps/web/src/features/tenant-admin/vendas/api/vendasApi.ts

import { CriarTransacaoResponse, transacoesApi } from "../../transacoes";
import type { CriarVendaInput } from "../tipos";

const BASE = "/vendas";

export const vendasApi = {
  criar(input: CriarVendaInput): Promise<CriarTransacaoResponse> {
    return transacoesApi.criarVenda(input);
  },
};
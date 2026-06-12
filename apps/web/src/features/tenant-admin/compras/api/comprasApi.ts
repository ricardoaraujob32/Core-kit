// apps/web/src/features/tenant-admin/compras/api/comprasApi.ts

import { transacoesApi } from "../../transacoes/api/transacoesApi";
import type { CriarCompraInput, CriarTransacaoResponse } from "../../transacoes/tipos";

export const comprasApi = {
  criar(input: CriarCompraInput): Promise<CriarTransacaoResponse> {
    return transacoesApi.criarCompra(input);
  },
};
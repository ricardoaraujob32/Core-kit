// apps/web/src/features/tenant-admin/transacoes/api/transacoesApi.ts

import { httpClient } from "../../../../core/api/httpClient";
import type { AdicionarItemTransacaoInput, AdicionarItemTransacaoResponse, AtualizarItemTransacaoInput, AtualizarItemTransacaoResponse, CancelarTransacaoInput, CancelarTransacaoResponse,
  ConfirmarTransacaoResponse, CriarCompraInput, CriarTransacaoResponse, CriarVendaInput, ListarTransacoesResponse, ObterTransacaoResponse, RemoverItemTransacaoResponse,
} from "../tipos";

const BASE = "/transacoes";

export const transacoesApi = {
  listar(): Promise<ListarTransacoesResponse> {
    return httpClient.get<ListarTransacoesResponse>(BASE);
  },

  obter(transacaoId: string): Promise<ObterTransacaoResponse> {
    return httpClient.get<ObterTransacaoResponse>(`${BASE}/${transacaoId}`);
  },

  criarVenda(input: CriarVendaInput): Promise<CriarTransacaoResponse> {
    return httpClient.post<CriarTransacaoResponse, CriarVendaInput>("/vendas", input);
  },

  criarCompra(input: CriarCompraInput): Promise<CriarTransacaoResponse> {
    return httpClient.post<CriarTransacaoResponse, CriarCompraInput>("/compras", input);
  },

  adicionarItem(transacaoId: string, input: AdicionarItemTransacaoInput): Promise<AdicionarItemTransacaoResponse> {
    return httpClient.post<AdicionarItemTransacaoResponse, AdicionarItemTransacaoInput>(`${BASE}/${transacaoId}/itens`, input);
  },

  atualizarItem(transacaoId: string, itemId: string, input: AtualizarItemTransacaoInput): Promise<AtualizarItemTransacaoResponse> {
    return httpClient.patch<AtualizarItemTransacaoResponse, AtualizarItemTransacaoInput>(`${BASE}/${transacaoId}/itens/${itemId}`, input);
  },

  removerItem(transacaoId: string, itemId: string): Promise<RemoverItemTransacaoResponse> {
    return httpClient.delete<RemoverItemTransacaoResponse>(`${BASE}/${transacaoId}/itens/${itemId}`);
  },

  confirmar(transacaoId: string): Promise<ConfirmarTransacaoResponse> {
    return httpClient.post<ConfirmarTransacaoResponse>(`${BASE}/${transacaoId}/confirmar`);
  },

  cancelar(transacaoId: string, input: CancelarTransacaoInput = {}): Promise<CancelarTransacaoResponse> {
    return httpClient.post<CancelarTransacaoResponse, CancelarTransacaoInput>(`${BASE}/${transacaoId}/cancelar`, input);
  }
};
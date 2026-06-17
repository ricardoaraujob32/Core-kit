// apps/web/src/features/tenant-admin/ordens-servico/api/ordensServicoApi.ts

import { httpClient } from "../../../../core/api/httpClient";
import type { AtualizarOrdemServicoInput, CriarOrdemServicoInput, GerarVendaOrdemServicoInput, OrdemServico, StatusOrdemServico } from "../tipos";

type ListaResponse = {
  itens: OrdemServico[];
};

type ItemResponse = {
  item: OrdemServico;
};

type GerarVendaResponse = {
  item: OrdemServico;
  transacaoId: string;
};

export type ListarOrdensServicoParams = {
  status?: StatusOrdemServico;
  clienteId?: string;
};

function buildQuery(params?: ListarOrdensServicoParams): string {
  const searchParams = new URLSearchParams();

  if (params?.status) {
    searchParams.set("status", params.status);
  }

  if (params?.clienteId) {
    searchParams.set("clienteId", params.clienteId);
  }

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export const ordensServicoApi = {
  listar(params?: ListarOrdensServicoParams): Promise<ListaResponse> {
    return httpClient.get<ListaResponse>(`/ordens-servico${buildQuery(params)}`);
  },

  obter(ordemServicoId: string): Promise<ItemResponse> {
    return httpClient.get<ItemResponse>(`/ordens-servico/${ordemServicoId}`);
  },

  criar(input: CriarOrdemServicoInput): Promise<ItemResponse> {
    return httpClient.post<ItemResponse, CriarOrdemServicoInput>("/ordens-servico", input);
  },

  atualizar(ordemServicoId: string, input: AtualizarOrdemServicoInput): Promise<ItemResponse> {
    return httpClient.patch<ItemResponse, AtualizarOrdemServicoInput>(`/ordens-servico/${ordemServicoId}`, input);
  },

  iniciar(ordemServicoId: string): Promise<ItemResponse> {
    return httpClient.post<ItemResponse>(`/ordens-servico/${ordemServicoId}/iniciar`);
  },

  aguardar(ordemServicoId: string): Promise<ItemResponse> {
    return httpClient.post<ItemResponse>(`/ordens-servico/${ordemServicoId}/aguardar`);
  },

  concluir(ordemServicoId: string): Promise<ItemResponse> {
    return httpClient.post<ItemResponse>(`/ordens-servico/${ordemServicoId}/concluir`);
  },

  cancelar(ordemServicoId: string): Promise<ItemResponse> {
    return httpClient.post<ItemResponse>(`/ordens-servico/${ordemServicoId}/cancelar`);
  },

  gerarVenda(ordemServicoId: string, input: GerarVendaOrdemServicoInput): Promise<GerarVendaResponse> {
    return httpClient.post<GerarVendaResponse, GerarVendaOrdemServicoInput>(`/ordens-servico/${ordemServicoId}/gerar-venda`, input);
  },
};

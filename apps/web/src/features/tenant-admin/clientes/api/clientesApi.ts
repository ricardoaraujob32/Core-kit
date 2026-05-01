// apps/web/src/features/tenant-admin/clientes/api/clientesApi.ts

import { httpClient } from "../../../../core/api/httpClient";
import type { AtualizarClienteInput, AtualizarClienteResponse, CriarClienteInput, CriarClienteResponse, ExcluirClienteResponse, ListarClientesResponse, ObterClienteResponse } from "../tipos";

const BASE = "/clientes";

export const clientesApi = {
  listar(): Promise<ListarClientesResponse> {
    return httpClient.get<ListarClientesResponse>(BASE);
  },

  obter(clienteId: string): Promise<ObterClienteResponse> {
    return httpClient.get<ObterClienteResponse>(`${BASE}/${clienteId}`);
  },

  criar(input: CriarClienteInput): Promise<CriarClienteResponse> {
    return httpClient.post<CriarClienteResponse, CriarClienteInput>(BASE, input);
  },

  atualizar(clienteId: string, input: AtualizarClienteInput): Promise<AtualizarClienteResponse> {
    return httpClient.patch<AtualizarClienteResponse, AtualizarClienteInput>(`${BASE}/${clienteId}`, input);
  },

  excluir(clienteId: string): Promise<ExcluirClienteResponse> {
    return httpClient.delete<ExcluirClienteResponse>(`${BASE}/${clienteId}`);
  },
};
// apps/web/src/features/tenant-admin/fornecedores/api/fornecedoresApi.ts

import { httpClient } from "../../../../core/api/httpClient";
import type { AtualizarFornecedorInput, AtualizarFornecedorResponse, CriarFornecedorInput, CriarFornecedorResponse, ExcluirFornecedorResponse, ListarFornecedoresResponse, ObterFornecedorResponse } from "../tipos";

const BASE = "/fornecedores";

export const fornecedoresApi = {
  listar(): Promise<ListarFornecedoresResponse> {
    return httpClient.get<ListarFornecedoresResponse>(BASE);
  },

  obter(fornecedorId: string): Promise<ObterFornecedorResponse> {
    return httpClient.get<ObterFornecedorResponse>(`${BASE}/${fornecedorId}`);
  },

  criar(input: CriarFornecedorInput): Promise<CriarFornecedorResponse> {
    return httpClient.post<CriarFornecedorResponse, CriarFornecedorInput>(BASE, input);
  },

  atualizar(fornecedorId: string, input: AtualizarFornecedorInput): Promise<AtualizarFornecedorResponse> {
    return httpClient.patch<AtualizarFornecedorResponse, AtualizarFornecedorInput>(`${BASE}/${fornecedorId}`, input);
  },

  excluir(fornecedorId: string): Promise<ExcluirFornecedorResponse> {
    return httpClient.delete<ExcluirFornecedorResponse>(`${BASE}/${fornecedorId}`);
  },
};
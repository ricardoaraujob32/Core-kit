// apps/web/src/features/tenant-admin/produtos/api/produtosApi.ts

import { httpClient } from "../../../../core/api/httpClient";
import type {
  AtualizarProdutoInput,
  AtualizarProdutoResponse,
  CriarProdutoInput,
  CriarProdutoResponse,
  ExcluirProdutoResponse,
  ListarProdutosResponse,
  ObterProdutoResponse,
} from "../tipos";

const BASE = "/produtos";

export const produtosApi = {
  listar(): Promise<ListarProdutosResponse> {
    return httpClient.get<ListarProdutosResponse>(BASE);
  },

  obter(produtoId: string): Promise<ObterProdutoResponse> {
    return httpClient.get<ObterProdutoResponse>(`${BASE}/${produtoId}`);
  },

  criar(input: CriarProdutoInput): Promise<CriarProdutoResponse> {
    return httpClient.post<CriarProdutoResponse, CriarProdutoInput>(BASE, input);
  },

  atualizar(
    produtoId: string,
    input: AtualizarProdutoInput,
  ): Promise<AtualizarProdutoResponse> {
    return httpClient.patch<AtualizarProdutoResponse, AtualizarProdutoInput>(
      `${BASE}/${produtoId}`,
      input,
    );
  },

  excluir(produtoId: string): Promise<ExcluirProdutoResponse> {
    return httpClient.delete<ExcluirProdutoResponse>(`${BASE}/${produtoId}`);
  },
};

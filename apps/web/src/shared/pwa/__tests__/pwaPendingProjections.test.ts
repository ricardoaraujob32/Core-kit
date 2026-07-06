// apps/web/src/shared/pwa/__tests__/pwaPendingProjections.test.ts

import { describe, expect, it } from "vitest";
import {
  projectClienteFromQueue,
  projectFornecedorFromQueue,
  projectOrdemServicoFromQueue,
  projectProdutoServicoFromQueue,
  projectTransacaoFromQueue,
} from "../pwaPendingProjections";
import type { PwaQueueItem } from "../pwaSyncTypes";

function item(params: Partial<PwaQueueItem>): PwaQueueItem {
  return {
    id: "queue-1",
    type: "clientes.criar",
    payload: {},
    localId: "local-1",
    status: "pending",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    attempts: 0,
    lastError: null,
    lastErrorKind: null,
    lastErrorDetails: null,
    ...params,
  };
}

describe("pwaPendingProjections", () => {
  it("projeta cliente pendente", () => {
    const projection = projectClienteFromQueue(
      item({
        type: "clientes.criar",
        localId: "cliente_offline_1",
        payload: { nome: "Maria", email: "maria@email.com" },
      }),
    );

    expect(projection?.clienteId).toBe("cliente_offline_1");
    expect(projection?.nome).toBe("Maria");
    expect(projection?.__pwaPending).toBe(true);
  });

  it("projeta fornecedor pendente", () => {
    const projection = projectFornecedorFromQueue(
      item({
        type: "fornecedores.criar",
        localId: "fornecedor_offline_1",
        payload: { nome: "Fornecedor" },
      }),
    );

    expect(projection?.fornecedorId).toBe("fornecedor_offline_1");
  });

  it("projeta serviço pendente como produto do tipo SERVICO", () => {
    const projection = projectProdutoServicoFromQueue(
      item({
        type: "servicos.criar",
        localId: "servico_offline_1",
        payload: { nome: "Formatação", precoVenda: 120 },
      }),
    );

    expect(projection?.produtoId).toBe("servico_offline_1");
    expect(projection?.tipo).toBe("SERVICO");
    expect(projection?.precoVenda).toBe(120);
  });

  it("projeta venda pendente", () => {
    const projection = projectTransacaoFromQueue(
      item({
        type: "vendas.criar",
        localId: "transacao_offline_1",
        payload: { clienteId: "cliente_offline_1" },
      }),
    );

    expect(projection?.transacaoId).toBe("transacao_offline_1");
    expect(projection?.tipo).toBe("VENDA");
  });

  it("projeta OS pendente", () => {
    const projection = projectOrdemServicoFromQueue(
      item({
        type: "ordensServico.criar",
        localId: "ordemServico_offline_1",
        payload: { titulo: "Limpeza" },
      }),
    );

    expect(projection?.ordemServicoId).toBe("ordemServico_offline_1");
    expect(projection?.titulo).toBe("Limpeza");
  });
});

// apps/web/src/shared/pwa/__tests__/pwaOfflineFlow.integration.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createScopedOfflineProcessor } from "../createScopedOfflineProcessor";
import { createScopedOfflineIdMap } from "../scopedOfflineIdMap";
import { createScopedOfflineQueue } from "../scopedOfflineQueue";
import { buildPwaCacheKey } from "../pwaScope";
import { scopeA } from "./testPwaFactories";

vi.mock("../../../features/tenant-admin/clientes/api/clientesApi", () => ({
  clientesApi: {
    criar: vi.fn(async () => ({
      item: {
        clienteId: "cliente-real-1",
        nome: "Cliente Real",
      },
    })),
  },
}));

vi.mock("../../../features/tenant-admin/fornecedores/api/fornecedoresApi", () => ({
  fornecedoresApi: {
    criar: vi.fn(async () => ({
      item: {
        fornecedorId: "fornecedor-real-1",
        nome: "Fornecedor Real",
      },
    })),
  },
}));

vi.mock("../../../features/tenant-admin/produtos/api/produtosApi", () => ({
  produtosApi: {
    criar: vi.fn(async () => ({
      item: {
        produtoId: "produto-real-1",
        nome: "Serviço Real",
        tipo: "SERVICO",
      },
    })),
  },
}));

vi.mock("../../../features/tenant-admin/vendas/api/vendasApi", () => ({
  vendasApi: {
    criar: vi.fn(async () => ({
      item: {
        transacaoId: "transacao-real-1",
      },
    })),
  },
}));

vi.mock("../../../features/tenant-admin/compras/api/comprasApi", () => ({
  comprasApi: {
    criar: vi.fn(async () => ({
      item: {
        transacaoId: "compra-real-1",
      },
    })),
  },
}));

vi.mock("../../../features/tenant-admin/ordens-servico/api/ordensServicoApi", () => ({
  ordensServicoApi: {
    criar: vi.fn(async () => ({
      item: {
        ordemServicoId: "os-real-1",
      },
    })),
  },
}));

vi.mock("../../../features/tenant-admin/transacoes/api/transacoesApi", () => ({
  transacoesApi: {
    adicionarItem: vi.fn(async () => ({
      item: {
        itemTransacaoId: "item-real-1",
      },
    })),
    atualizarItem: vi.fn(async () => undefined),
    removerItem: vi.fn(async () => undefined),
  },
}));

describe("PWA offline flow integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("sincroniza cliente offline e registra ID real", async () => {
    const queue = createScopedOfflineQueue(scopeA);
    const processor = createScopedOfflineProcessor(scopeA);
    const idMap = createScopedOfflineIdMap(scopeA);

    queue.enqueue({
      type: "clientes.criar",
      payload: {
        nome: "Cliente Offline",
      },
      localId: "cliente_offline_1",
    });

    await queue.process(processor);

    expect(queue.list()).toHaveLength(0);
    expect(idMap.resolve("cliente", "cliente_offline_1")).toBe(
      "cliente-real-1",
    );
  });

  it("sincroniza cliente antes da venda e reconcilia transação", async () => {
    const queue = createScopedOfflineQueue(scopeA);
    const processor = createScopedOfflineProcessor(scopeA);
    const idMap = createScopedOfflineIdMap(scopeA);

    queue.enqueue({
      type: "clientes.criar",
      payload: {
        nome: "Cliente Offline",
      },
      localId: "cliente_offline_1",
    });

    queue.enqueue({
      type: "vendas.criar",
      payload: {
        clienteId: "cliente_offline_1",
        observacao: "Venda offline",
      },
      localId: "transacao_offline_1",
    });

    await queue.process(processor);

    expect(queue.list()).toHaveLength(0);
    expect(idMap.resolve("cliente", "cliente_offline_1")).toBe(
      "cliente-real-1",
    );
    expect(idMap.resolve("transacao", "transacao_offline_1")).toBe(
      "transacao-real-1",
    );
  });

  it("sincroniza serviço antes da OS e reconcilia OS", async () => {
    const queue = createScopedOfflineQueue(scopeA);
    const processor = createScopedOfflineProcessor(scopeA);
    const idMap = createScopedOfflineIdMap(scopeA);

    queue.enqueue({
      type: "servicos.criar",
      payload: {
        nome: "Serviço Offline",
        tipo: "SERVICO",
        precoVenda: 100,
      },
      localId: "servico_offline_1",
    });

    queue.enqueue({
      type: "ordensServico.criar",
      payload: {
        clienteId: null,
        servicoId: "servico_offline_1",
        titulo: "OS offline",
        descricao: null,
      },
      localId: "ordemServico_offline_1",
    });

    await queue.process(processor);

    expect(queue.list()).toHaveLength(0);
    expect(idMap.resolve("servico", "servico_offline_1")).toBe(
      "produto-real-1",
    );
    expect(idMap.resolve("ordemServico", "ordemServico_offline_1")).toBe(
      "os-real-1",
    );
  });

  it("invalida cache afetado após sincronização", async () => {
    const queue = createScopedOfflineQueue(scopeA);
    const processor = createScopedOfflineProcessor(scopeA);

    const scopedClientesKey = buildPwaCacheKey(scopeA, "clientes:list");
    localStorage.setItem(
      `corekit:pwa:cache:${scopedClientesKey}`,
      JSON.stringify({
        data: [{ clienteId: "antigo" }],
        updatedAt: new Date().toISOString(),
        version: 1,
      }),
    );

    queue.enqueue({
      type: "clientes.criar",
      payload: {
        nome: "Cliente Offline",
      },
      localId: "cliente_offline_1",
    });

    await queue.process(processor);

    expect(localStorage.getItem(`corekit:pwa:cache:${scopedClientesKey}`)).toBeNull();
  });
});

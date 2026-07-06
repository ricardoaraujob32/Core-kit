// apps/web/src/shared/pwa/__tests__/pwaScopedFlow.integration.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createScopedOfflineIdMap } from "../scopedOfflineIdMap";
import { createScopedOfflineProcessor } from "../createScopedOfflineProcessor";
import { createScopedOfflineQueue } from "../scopedOfflineQueue";
import { scopeA, scopeB } from "./testPwaFactories";

vi.mock("../../../features/tenant-admin/clientes/api/clientesApi", () => ({
  clientesApi: {
    criar: vi.fn(async () => ({
      item: {
        clienteId: "cliente-real-scope-a",
      },
    })),
  },
}));

vi.mock("../../../features/tenant-admin/fornecedores/api/fornecedoresApi", () => ({
  fornecedoresApi: {
    criar: vi.fn(async () => ({
      item: {
        fornecedorId: "fornecedor-real",
      },
    })),
  },
}));

vi.mock("../../../features/tenant-admin/produtos/api/produtosApi", () => ({
  produtosApi: {
    criar: vi.fn(async () => ({
      item: {
        produtoId: "produto-real",
      },
    })),
  },
}));

vi.mock("../../../features/tenant-admin/vendas/api/vendasApi", () => ({
  vendasApi: {
    criar: vi.fn(async () => ({
      item: {
        transacaoId: "transacao-real",
      },
    })),
  },
}));

vi.mock("../../../features/tenant-admin/compras/api/comprasApi", () => ({
  comprasApi: {
    criar: vi.fn(async () => ({
      item: {
        transacaoId: "compra-real",
      },
    })),
  },
}));

vi.mock("../../../features/tenant-admin/ordens-servico/api/ordensServicoApi", () => ({
  ordensServicoApi: {
    criar: vi.fn(async () => ({
      item: {
        ordemServicoId: "os-real",
      },
    })),
  },
}));

vi.mock("../../../features/tenant-admin/transacoes/api/transacoesApi", () => ({
  transacoesApi: {
    adicionarItem: vi.fn(async () => ({
      item: {
        itemTransacaoId: "item-real",
      },
    })),
    atualizarItem: vi.fn(async () => undefined),
    removerItem: vi.fn(async () => undefined),
  },
}));

describe("PWA scoped flow integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("não mistura fila nem mapa de IDs entre locatários", async () => {
    const queueA = createScopedOfflineQueue(scopeA);
    const queueB = createScopedOfflineQueue(scopeB);

    const processorA = createScopedOfflineProcessor(scopeA);

    const mapA = createScopedOfflineIdMap(scopeA);
    const mapB = createScopedOfflineIdMap(scopeB);

    queueA.enqueue({
      type: "clientes.criar",
      payload: {
        nome: "Cliente A",
      },
      localId: "cliente_offline_1",
    });

    expect(queueA.list()).toHaveLength(1);
    expect(queueB.list()).toHaveLength(0);

    await queueA.process(processorA);

    expect(mapA.resolve("cliente", "cliente_offline_1")).toBe(
      "cliente-real-scope-a",
    );

    expect(mapB.resolve("cliente", "cliente_offline_1")).toBe(
      "cliente_offline_1",
    );
  });
});

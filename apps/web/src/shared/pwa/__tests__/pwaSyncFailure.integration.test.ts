// apps/web/src/shared/pwa/__tests__/pwaSyncFailure.integration.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "../../../core/api/httpClient";
import { createScopedOfflineProcessor } from "../createScopedOfflineProcessor";
import { createScopedOfflineQueue } from "../scopedOfflineQueue";
import { scopeA } from "./testPwaFactories";

vi.mock("../../../features/tenant-admin/clientes/api/clientesApi", () => ({
  clientesApi: {
    criar: vi.fn(async () => {
      throw new HttpError({
        message: "Cliente duplicado",
        status: 409,
        code: "CONFLITO",
      });
    }),
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

describe("PWA sync failure integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("marca conflito como blocked", async () => {
    const queue = createScopedOfflineQueue(scopeA);
    const processor = createScopedOfflineProcessor(scopeA);

    queue.enqueue({
      type: "clientes.criar",
      payload: {
        nome: "Cliente duplicado",
      },
      localId: "cliente_offline_1",
    });

    await queue.process(processor);

    const [item] = queue.list();

    expect(item.status).toBe("blocked");
    expect(item.lastErrorKind).toBe("conflict");
  });

  it("mantém item dependente como failed quando dependência não foi resolvida", async () => {
    const queue = createScopedOfflineQueue(scopeA);
    const processor = createScopedOfflineProcessor(scopeA);

    queue.enqueue({
      type: "vendas.criar",
      payload: {
        clienteId: "cliente_offline_inexistente",
      },
      localId: "transacao_offline_1",
    });

    await queue.process(processor);

    const [item] = queue.list();

    expect(item.status).toBe("failed");
    expect(item.lastErrorKind).toBe("dependency");
  });
});

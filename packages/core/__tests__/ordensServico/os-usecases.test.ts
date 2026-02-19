import { describe, it, expect } from "vitest";
import { createContextoExecucao } from "../../src/contextoExecucao";
import { isOk, isErr } from "../../src/result";

import { criarRepositorioEstoqueEmMemoria } from "../../src/estoque/repositorioMemoria";
import { criarItemCatalogo } from "../../src/estoque/usecases/criarItemCatalogo";
import { registrarMovimentoEstoque } from "../../src/estoque/usecases/registrarMovimentoEstoque";

import { criarRepositorioOrdensServicoEmMemoria } from "../../src/ordensServico/repositorioMemoria";
import { abrirOrdemServico } from "../../src/ordensServico/usecases/abrirOrdemServico";
import { adicionarItemServico } from "../../src/ordensServico/usecases/adicionarItemServico";
import { adicionarProdutoConsumido } from "../../src/ordensServico/usecases/adicionarProdutoConsumido";
import { concluirOrdemServico } from "../../src/ordensServico/usecases/concluirOrdemServico";

describe("Ordens de Serviço - MVP", () => {
  it("abrirOrdemServico deve exigir permissão", async () => {
    const estoqueRepo = criarRepositorioEstoqueEmMemoria();
    const osRepo = criarRepositorioOrdensServicoEmMemoria();

    const ctx = createContextoExecucao({ locatarioId: "L1", usuarioId: "U1", permissoes: [] });

    const r = await abrirOrdemServico(ctx, { osRepo }, { titulo: "Reparo" });
    expect(isErr(r)).toBe(true);
  });

  it("abrirOrdemServico deve criar OS em ABERTA", async () => {
    const osRepo = criarRepositorioOrdensServicoEmMemoria();

    const ctx = createContextoExecucao({ locatarioId: "L1", usuarioId: "U1", permissoes: ["OS_ABRIR"] });

    const r = await abrirOrdemServico(ctx, { osRepo }, { titulo: "Reparo" });
    expect(isOk(r)).toBe(true);
  });

  it("adicionarItemServico deve exigir permissão", async () => {
    const osRepo = criarRepositorioOrdensServicoEmMemoria();

    const ctx = createContextoExecucao({ locatarioId: "L1", usuarioId: "U1", permissoes: ["OS_ABRIR"] });

    const os = await abrirOrdemServico(ctx, { osRepo }, { titulo: "Reparo" });
    expect(isOk(os)).toBe(true);
    if (!isOk(os)) return;

    const r = await adicionarItemServico(
      createContextoExecucao({ locatarioId: "L1", usuarioId: "U1", permissoes: [] }),
      { osRepo },
      { osId: os.value.id, descricao: "Diagnóstico" },
    );

    expect(isErr(r)).toBe(true);
  });

  it("adicionarProdutoConsumido deve gerar SAIDA de estoque quando tiver saldo", async () => {
    const estoqueRepo = criarRepositorioEstoqueEmMemoria();
    const osRepo = criarRepositorioOrdensServicoEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["OS_ABRIR", "OS_EDITAR", "ESTOQUE_CRIAR_ITEM", "ESTOQUE_MOVIMENTAR"],
    });

    const produto = await criarItemCatalogo(ctx, { estoqueRepo }, { tipo: "PRODUTO", nome: "Parafuso 10mm" });
    expect(isOk(produto)).toBe(true);
    if (!isOk(produto)) return;

    const entrada = await registrarMovimentoEstoque(ctx, { estoqueRepo }, {
      itemId: produto.value.id,
      tipo: "ENTRADA",
      quantidade: 10,
      motivo: "Estoque inicial",
    });
    expect(isOk(entrada)).toBe(true);

    const os = await abrirOrdemServico(ctx, { osRepo }, { titulo: "Reparo" });
    expect(isOk(os)).toBe(true);
    if (!isOk(os)) return;

    const r = await adicionarProdutoConsumido(ctx, { osRepo, estoqueRepo }, {
      osId: os.value.id,
      itemId: produto.value.id,
      quantidade: 2,
      motivo: "Consumo na OS",
    });

    expect(isOk(r)).toBe(true);
  });

  it("concluirOrdemServico deve exigir permissão e mudar status", async () => {
    const osRepo = criarRepositorioOrdensServicoEmMemoria();

    const ctx = createContextoExecucao({ locatarioId: "L1", usuarioId: "U1", permissoes: ["OS_ABRIR"] });

    const os = await abrirOrdemServico(ctx, { osRepo }, { titulo: "Reparo" });
    expect(isOk(os)).toBe(true);
    if (!isOk(os)) return;

    const negado = await concluirOrdemServico(
      createContextoExecucao({ locatarioId: "L1", usuarioId: "U1", permissoes: [] }),
      { osRepo },
      { osId: os.value.id },
    );
    expect(isErr(negado)).toBe(true);

    const ok = await concluirOrdemServico(
      createContextoExecucao({ locatarioId: "L1", usuarioId: "U1", permissoes: ["OS_CONCLUIR"] }),
      { osRepo },
      { osId: os.value.id },
    );
    expect(isOk(ok)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { criarImportacoesService } from "../usecases/importacoesService";
import {
  ImportacoesRepositorioMemoria,
  ItensImportacaoRepositorioMemoria,
} from "../repositorioMemoria";

function criarDeps() {
  const importacoesRepositorio = new ImportacoesRepositorioMemoria();
  const itensImportacaoRepositorio = new ItensImportacaoRepositorioMemoria();
  const agoraFixo = new Date("2026-03-12T13:00:00.000Z");
  let contador = 0;

  const service = criarImportacoesService({
    importacoesRepositorio,
    itensImportacaoRepositorio,
    agora: () => agoraFixo,
    gerarId: () => {
      contador += 1;
      return `id-${contador}`;
    },
  });

  return {
    service,
    importacoesRepositorio,
    itensImportacaoRepositorio,
    agoraFixo,
  };
}

describe("importacoesService", () => {
  it("solicita importação em estado PENDENTE", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.solicitarImportacao({
      locatarioId: "loc-1",
      criadoPorUsuarioId: "user-1",
      tipoOrigem: "ARQUIVO",
      referenciaOrigem: "storage/backup.zip",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.importacao.importacaoId).toBe("id-1");
    expect(resultado.value.importacao.status).toBe("PENDENTE");
    expect(resultado.value.importacao.tipoOrigem).toBe("ARQUIVO");
  });

  it("registra item de importação", async () => {
    const ctx = criarDeps();

    const criada = await ctx.service.solicitarImportacao({
      locatarioId: "loc-1",
      tipoOrigem: "ARQUIVO",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    const resultado = await ctx.service.registrarItemImportacao({
      importacaoId: criada.value.importacao.importacaoId,
      locatarioId: "loc-1",
      numeroLinha: 1,
      dadosBrutos: { nome: "Cliente A" },
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.importacaoId).toBe(criada.value.importacao.importacaoId);
    expect(resultado.value.numeroLinha).toBe(1);
    expect(resultado.value.status).toBe("PENDENTE");
  });

  it("lista importações do locatário", async () => {
    const ctx = criarDeps();

    await ctx.service.solicitarImportacao({
      locatarioId: "loc-1",
      tipoOrigem: "ARQUIVO",
    });

    await ctx.importacoesRepositorio.criarImportacao({
      importacaoId: "imp-2",
      locatarioId: "loc-2",
      criadoPorUsuarioId: null,
      tipoOrigem: "ARQUIVO",
      referenciaOrigem: null,
      status: "PENDENTE",
      mapeamentoColunas: {},
      estatisticas: {},
      mensagemErro: null,
      iniciadoEm: null,
      finalizadoEm: null,
      criadoEm: ctx.agoraFixo,
      atualizadoEm: ctx.agoraFixo,
    });

    const resultado = await ctx.service.listarImportacoesLocatario({
      locatarioId: "loc-1",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value).toHaveLength(1);
    expect(resultado.value[0]?.locatarioId).toBe("loc-1");
  });

  it("lista itens de uma importação", async () => {
    const ctx = criarDeps();

    const criada = await ctx.service.solicitarImportacao({
      locatarioId: "loc-1",
      tipoOrigem: "ARQUIVO",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    await ctx.service.registrarItemImportacao({
      importacaoId: criada.value.importacao.importacaoId,
      locatarioId: "loc-1",
      numeroLinha: 2,
      dadosBrutos: { nome: "B" },
    });

    await ctx.service.registrarItemImportacao({
      importacaoId: criada.value.importacao.importacaoId,
      locatarioId: "loc-1",
      numeroLinha: 1,
      dadosBrutos: { nome: "A" },
    });

    const resultado = await ctx.service.listarItensImportacao({
      importacaoId: criada.value.importacao.importacaoId,
      locatarioId: "loc-1",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value).toHaveLength(2);
    expect(resultado.value[0]?.numeroLinha).toBe(1);
    expect(resultado.value[1]?.numeroLinha).toBe(2);
  });

  it("marca importação em execução", async () => {
    const ctx = criarDeps();

    const criada = await ctx.service.solicitarImportacao({
      locatarioId: "loc-1",
      tipoOrigem: "ARQUIVO",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    const resultado = await ctx.service.marcarImportacaoEmExecucao({
      importacaoId: criada.value.importacao.importacaoId,
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.status).toBe("EM_EXECUCAO");
    expect(resultado.value.iniciadoEm).toEqual(ctx.agoraFixo);
  });

  it("marca importação concluída", async () => {
    const ctx = criarDeps();

    const criada = await ctx.service.solicitarImportacao({
      locatarioId: "loc-1",
      tipoOrigem: "ARQUIVO",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    await ctx.service.marcarImportacaoEmExecucao({
      importacaoId: criada.value.importacao.importacaoId,
    });

    const resultado = await ctx.service.marcarImportacaoConcluida({
      importacaoId: criada.value.importacao.importacaoId,
      estatisticas: { processados: 10, falhas: 0 },
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.status).toBe("CONCLUIDO");
    expect(resultado.value.finalizadoEm).toEqual(ctx.agoraFixo);
    expect(resultado.value.estatisticas).toEqual({
      processados: 10,
      falhas: 0,
    });
  });

  it("marca importação com falha", async () => {
    const ctx = criarDeps();

    const criada = await ctx.service.solicitarImportacao({
      locatarioId: "loc-1",
      tipoOrigem: "ARQUIVO",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    const resultado = await ctx.service.marcarImportacaoComFalha({
      importacaoId: criada.value.importacao.importacaoId,
      mensagemErro: "arquivo corrompido",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.status).toBe("FALHOU");
    expect(resultado.value.mensagemErro).toBe("arquivo corrompido");
  });

  it("marca item de importação como processado", async () => {
    const ctx = criarDeps();

    const criada = await ctx.service.solicitarImportacao({
      locatarioId: "loc-1",
      tipoOrigem: "ARQUIVO",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    const item = await ctx.service.registrarItemImportacao({
      importacaoId: criada.value.importacao.importacaoId,
      locatarioId: "loc-1",
      numeroLinha: 1,
      dadosBrutos: { nome: "A" },
    });
    expect(item.ok).toBe(true);
    if (!item.ok) return;

    const resultado = await ctx.service.marcarItemImportacaoProcessado({
      itemImportacaoId: item.value.itemImportacaoId,
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.status).toBe("CONCLUIDO");
  });

  it("marca item de importação com falha", async () => {
    const ctx = criarDeps();

    const criada = await ctx.service.solicitarImportacao({
      locatarioId: "loc-1",
      tipoOrigem: "ARQUIVO",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    const item = await ctx.service.registrarItemImportacao({
      importacaoId: criada.value.importacao.importacaoId,
      locatarioId: "loc-1",
      numeroLinha: 1,
      dadosBrutos: { nome: "A" },
    });
    expect(item.ok).toBe(true);
    if (!item.ok) return;

    const resultado = await ctx.service.marcarItemImportacaoComFalha({
      itemImportacaoId: item.value.itemImportacaoId,
      detalheErro: "email inválido",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.status).toBe("FALHOU");
    expect(resultado.value.detalheErro).toBe("email inválido");
  });

  it("impede transição inválida da importação", async () => {
    const ctx = criarDeps();

    await ctx.importacoesRepositorio.criarImportacao({
      importacaoId: "imp-9",
      locatarioId: "loc-1",
      criadoPorUsuarioId: null,
      tipoOrigem: "ARQUIVO",
      referenciaOrigem: null,
      status: "CONCLUIDO",
      mapeamentoColunas: {},
      estatisticas: {},
      mensagemErro: null,
      iniciadoEm: ctx.agoraFixo,
      finalizadoEm: ctx.agoraFixo,
      criadoEm: ctx.agoraFixo,
      atualizadoEm: ctx.agoraFixo,
    });

    const resultado = await ctx.service.marcarImportacaoEmExecucao({
      importacaoId: "imp-9",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe(
      "IMPORTACAO_TRANSICAO_STATUS_INVALIDA",
    );
  });

  it("valida entrada ao solicitar importação", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.solicitarImportacao({
      locatarioId: "",
      tipoOrigem: "ARQUIVO",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("IMPORTACAO_INVALIDA");
  });
});
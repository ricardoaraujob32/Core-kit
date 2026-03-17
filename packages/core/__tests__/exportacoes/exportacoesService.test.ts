import { describe, expect, it } from "vitest";
import { criarExportacoesService } from "../usecases/exportacoesService";
import { ExportacoesRepositorioMemoria } from "../repositorioMemoria";

function criarDeps() {
  const exportacoesRepositorio = new ExportacoesRepositorioMemoria();
  const agoraFixo = new Date("2026-03-12T12:00:00.000Z");

  const service = criarExportacoesService({
    exportacoesRepositorio,
    agora: () => agoraFixo,
    gerarId: () => "exp-1",
  });

  return {
    service,
    exportacoesRepositorio,
    agoraFixo,
  };
}

describe("exportacoesService", () => {
  it("solicita exportação em estado PENDENTE", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.solicitarExportacao({
      locatarioId: "loc-1",
      criadoPorUsuarioId: "user-1",
      formato: "CSV",
      parametros: { tipo: "BACKUP_LOCATARIO" },
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.exportacao.exportacaoId).toBe("exp-1");
    expect(resultado.value.exportacao.status).toBe("PENDENTE");
    expect(resultado.value.exportacao.formato).toBe("CSV");
    expect(resultado.value.exportacao.locatarioId).toBe("loc-1");
  });

  it("lista exportações do locatário", async () => {
    const ctx = criarDeps();

    await ctx.service.solicitarExportacao({
      locatarioId: "loc-1",
      formato: "CSV",
    });

    await ctx.exportacoesRepositorio.criarExportacao({
      exportacaoId: "exp-2",
      locatarioId: "loc-2",
      formato: "JSON",
      status: "PENDENTE",
      parametros: {},
      criadoEm: new Date("2026-03-12T11:00:00.000Z"),
      atualizadoEm: new Date("2026-03-12T11:00:00.000Z"),
      criadoPorUsuarioId: null,
      referenciaResultado: null,
      mensagemErro: null,
    });

    const resultado = await ctx.service.listarExportacoesLocatario({
      locatarioId: "loc-1",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.exportacoes).toHaveLength(1);
    expect(resultado.value.exportacoes[0]?.locatarioId).toBe("loc-1");
  });

  it("marca exportação em execução", async () => {
    const ctx = criarDeps();

    const criada = await ctx.service.solicitarExportacao({
      locatarioId: "loc-1",
      formato: "CSV",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    const resultado = await ctx.service.marcarExportacaoEmExecucao({
      exportacaoId: criada.value.exportacao.exportacaoId,
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.status).toBe("EM_EXECUCAO");
  });

  it("marca exportação concluída", async () => {
    const ctx = criarDeps();

    const criada = await ctx.service.solicitarExportacao({
      locatarioId: "loc-1",
      formato: "CSV",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    await ctx.service.marcarExportacaoEmExecucao({
      exportacaoId: criada.value.exportacao.exportacaoId,
    });

    const resultado = await ctx.service.marcarExportacaoConcluida({
      exportacaoId: criada.value.exportacao.exportacaoId,
      referenciaResultado: "storage/backup.zip",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.status).toBe("CONCLUIDO");
    expect(resultado.value.referenciaResultado).toBe("storage/backup.zip");
  });

  it("marca exportação com falha a partir de PENDENTE", async () => {
    const ctx = criarDeps();

    const criada = await ctx.service.solicitarExportacao({
      locatarioId: "loc-1",
      formato: "CSV",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    const resultado = await ctx.service.marcarExportacaoComFalha({
      exportacaoId: criada.value.exportacao.exportacaoId,
      mensagemErro: "falha no worker",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.status).toBe("FALHOU");
    expect(resultado.value.mensagemErro).toBe("falha no worker");
  });

  it("impede transição inválida para EM_EXECUCAO", async () => {
    const ctx = criarDeps();

    await ctx.exportacoesRepositorio.criarExportacao({
      exportacaoId: "exp-9",
      locatarioId: "loc-1",
      formato: "CSV",
      status: "CONCLUIDO",
      parametros: {},
      criadoEm: ctx.agoraFixo,
      atualizadoEm: ctx.agoraFixo,
      criadoPorUsuarioId: null,
      referenciaResultado: "ok",
      mensagemErro: null,
    });

    const resultado = await ctx.service.marcarExportacaoEmExecucao({
      exportacaoId: "exp-9",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe(
      "EXPORTACAO_TRANSICAO_STATUS_INVALIDA",
    );
  });

  it("valida entrada ao solicitar exportação", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.solicitarExportacao({
      locatarioId: "",
      formato: "CSV",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("EXPORTACAO_INVALIDA");
  });
});
import { describe, expect, it } from "vitest";
import { criarAuditoriaService } from "../usecases/auditoriaService";
import {
  AuditoriaLocatarioRepositorioMemoria,
  AuditoriaPlataformaRepositorioMemoria,
} from "../repositorioMemoria";

function criarDeps() {
  const auditoriaLocatarioRepositorio =
    new AuditoriaLocatarioRepositorioMemoria();
  const auditoriaPlataformaRepositorio =
    new AuditoriaPlataformaRepositorioMemoria();

  const service = criarAuditoriaService({
    auditoriaLocatarioRepositorio,
    auditoriaPlataformaRepositorio,
  });

  return {
    service,
    auditoriaLocatarioRepositorio,
    auditoriaPlataformaRepositorio,
  };
}

describe("auditoriaService", () => {
  it("registra evento de auditoria do locatário", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.registrarEventoLocatario({
      locatarioId: "loc-1",
      usuarioId: "user-1",
      evento: "cliente.criado",
      sucesso: true,
      entidadeTipo: "cliente",
      entidadeId: "cli-1",
      metadados: { origem: "teste" },
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.locatarioId).toBe("loc-1");
    expect(resultado.value.usuarioId).toBe("user-1");
    expect(resultado.value.evento).toBe("cliente.criado");
    expect(resultado.value.sucesso).toBe(true);
    expect(resultado.value.entidadeTipo).toBe("cliente");
    expect(resultado.value.entidadeId).toBe("cli-1");
    expect(resultado.value.metadados).toEqual({ origem: "teste" });
  });

  it("lista eventos de auditoria do locatário filtrando por locatário", async () => {
    const ctx = criarDeps();

    await ctx.service.registrarEventoLocatario({
      locatarioId: "loc-1",
      usuarioId: "user-1",
      evento: "cliente.criado",
      sucesso: true,
      entidadeTipo: "cliente",
      entidadeId: "cli-1",
    });

    await ctx.service.registrarEventoLocatario({
      locatarioId: "loc-2",
      usuarioId: "user-2",
      evento: "cliente.criado",
      sucesso: true,
      entidadeTipo: "cliente",
      entidadeId: "cli-2",
    });

    const resultado = await ctx.service.listarAuditoriaLocatario({
      locatarioId: "loc-1",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value).toHaveLength(1);
    expect(resultado.value[0]?.locatarioId).toBe("loc-1");
    expect(resultado.value[0]?.entidadeId).toBe("cli-1");
  });

  it("lista eventos de auditoria do locatário filtrando por entidade", async () => {
    const ctx = criarDeps();

    await ctx.service.registrarEventoLocatario({
      locatarioId: "loc-1",
      usuarioId: "user-1",
      evento: "cliente.criado",
      sucesso: true,
      entidadeTipo: "cliente",
      entidadeId: "cli-1",
    });

    await ctx.service.registrarEventoLocatario({
      locatarioId: "loc-1",
      usuarioId: "user-1",
      evento: "ordem.criada",
      sucesso: true,
      entidadeTipo: "ordem_servico",
      entidadeId: "os-1",
    });

    const resultado = await ctx.service.listarAuditoriaLocatario({
      locatarioId: "loc-1",
      entidadeTipo: "cliente",
      entidadeId: "cli-1",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value).toHaveLength(1);
    expect(resultado.value[0]?.entidadeTipo).toBe("cliente");
    expect(resultado.value[0]?.entidadeId).toBe("cli-1");
  });

  it("registra evento de auditoria da plataforma", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.registrarEventoPlataforma({
      usuarioId: "superadmin-1",
      locatarioAlvoId: "loc-1",
      evento: "locatario.suspenso",
      sucesso: true,
      entidadeTipo: "locatario",
      entidadeId: "loc-1",
      metadados: { motivo: "inadimplencia" },
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.usuarioId).toBe("superadmin-1");
    expect(resultado.value.locatarioAlvoId).toBe("loc-1");
    expect(resultado.value.evento).toBe("locatario.suspenso");
    expect(resultado.value.entidadeTipo).toBe("locatario");
  });

  it("lista eventos de auditoria da plataforma filtrando por locatário alvo", async () => {
    const ctx = criarDeps();

    await ctx.service.registrarEventoPlataforma({
      usuarioId: "superadmin-1",
      locatarioAlvoId: "loc-1",
      evento: "locatario.suspenso",
      sucesso: true,
      entidadeTipo: "locatario",
      entidadeId: "loc-1",
    });

    await ctx.service.registrarEventoPlataforma({
      usuarioId: "superadmin-1",
      locatarioAlvoId: "loc-2",
      evento: "locatario.reativado",
      sucesso: true,
      entidadeTipo: "locatario",
      entidadeId: "loc-2",
    });

    const resultado = await ctx.service.listarAuditoriaPlataforma({
      locatarioAlvoId: "loc-1",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value).toHaveLength(1);
    expect(resultado.value[0]?.locatarioAlvoId).toBe("loc-1");
    expect(resultado.value[0]?.evento).toBe("locatario.suspenso");
  });

  it("valida entrada ao registrar evento de locatário", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.registrarEventoLocatario({
      locatarioId: "",
      usuarioId: "user-1",
      evento: "",
      sucesso: true,
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("AUDITORIA_INVALIDA");
  });

  it("valida entrada ao registrar evento de plataforma", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.registrarEventoPlataforma({
      usuarioId: "",
      evento: "",
      sucesso: true,
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("AUDITORIA_INVALIDA");
  });

  it("valida limite na listagem", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.listarAuditoriaLocatario({
      locatarioId: "loc-1",
      limite: 0,
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("AUDITORIA_INVALIDA");
  });
});
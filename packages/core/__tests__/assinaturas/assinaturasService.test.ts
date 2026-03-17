import { describe, expect, it } from "vitest";
import { criarAssinaturasService } from "../usecases/assinaturasService";
import {
  AssinaturasModulosRepositorioMemoria,
  AssinaturasRepositorioMemoria,
  ModulosConsultaRepositorioMemoria,
  PlanosConsultaRepositorioMemoria,
} from "../repositorioMemoria";

function criarDeps() {
  const assinaturasRepositorio = new AssinaturasRepositorioMemoria();
  const assinaturasModulosRepositorio =
    new AssinaturasModulosRepositorioMemoria();
  const planosConsultaRepositorio =
    new PlanosConsultaRepositorioMemoria();
  const modulosConsultaRepositorio =
    new ModulosConsultaRepositorioMemoria();

  const agoraFixo = new Date("2026-03-11T12:00:00.000Z");

  const service = criarAssinaturasService({
    assinaturasRepositorio,
    assinaturasModulosRepositorio,
    planosConsultaRepositorio,
    modulosConsultaRepositorio,
    agora: () => agoraFixo,
    gerarId: () => "ass-1",
  });

  return {
    service,
    assinaturasRepositorio,
    assinaturasModulosRepositorio,
    planosConsultaRepositorio,
    modulosConsultaRepositorio,
    agoraFixo,
  };
}

describe("assinaturasService", () => {
  it("cria assinatura em rascunho quando o plano é válido", async () => {
    const ctx = criarDeps();
    ctx.planosConsultaRepositorio.definirPlano("plano-core", true);

    const resultado = await ctx.service.criarAssinatura({
      locatarioId: "loc-1",
      planoId: "plano-core",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.assinatura.assinaturaId).toBe("ass-1");
    expect(resultado.value.assinatura.status).toBe("RASCUNHO");
    expect(resultado.value.assinatura.locatarioId).toBe("loc-1");
  });

  it("impede criar assinatura quando já existe assinatura operacional no locatário", async () => {
    const ctx = criarDeps();
    ctx.planosConsultaRepositorio.definirPlano("plano-core", true);

    await ctx.service.criarAssinatura({
      locatarioId: "loc-1",
      planoId: "plano-core",
    });

    const resultado = await ctx.service.criarAssinatura({
      locatarioId: "loc-1",
      planoId: "plano-core",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("ASSINATURA_ATIVA_JA_EXISTE");
  });

  it("ativa assinatura em rascunho", async () => {
    const ctx = criarDeps();
    ctx.planosConsultaRepositorio.definirPlano("plano-core", true);

    const criada = await ctx.service.criarAssinatura({
      locatarioId: "loc-1",
      planoId: "plano-core",
    });

    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    const resultado = await ctx.service.ativarAssinatura({
      assinaturaId: criada.value.assinatura.assinaturaId,
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.status).toBe("ATIVA");
  });

  it("suspende assinatura ativa", async () => {
    const ctx = criarDeps();
    ctx.planosConsultaRepositorio.definirPlano("plano-core", true);

    const criada = await ctx.service.criarAssinatura({
      locatarioId: "loc-1",
      planoId: "plano-core",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    await ctx.service.ativarAssinatura({
      assinaturaId: criada.value.assinatura.assinaturaId,
    });

    const resultado = await ctx.service.suspenderAssinatura({
      assinaturaId: criada.value.assinatura.assinaturaId,
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.status).toBe("SUSPENSA");
  });

  it("cancela assinatura", async () => {
    const ctx = criarDeps();
    ctx.planosConsultaRepositorio.definirPlano("plano-core", true);

    const criada = await ctx.service.criarAssinatura({
      locatarioId: "loc-1",
      planoId: "plano-core",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    const resultado = await ctx.service.cancelarAssinatura({
      assinaturaId: criada.value.assinatura.assinaturaId,
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.status).toBe("CANCELADA");
    expect(resultado.value.encerradaEm).toEqual(ctx.agoraFixo);
  });

  it("vincula módulo válido à assinatura", async () => {
    const ctx = criarDeps();
    ctx.planosConsultaRepositorio.definirPlano("plano-core", true);
    ctx.modulosConsultaRepositorio.definirModulo("mod-estoque", true);

    const criada = await ctx.service.criarAssinatura({
      locatarioId: "loc-1",
      planoId: "plano-core",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    const resultado = await ctx.service.vincularModuloNaAssinatura({
      assinaturaId: criada.value.assinatura.assinaturaId,
      moduloId: "mod-estoque",
    });

    expect(resultado.ok).toBe(true);

    const modulos =
      await ctx.assinaturasModulosRepositorio.listarModulosAtivosDaAssinatura(
        criada.value.assinatura.assinaturaId,
      );

    expect(modulos.ok).toBe(true);
    if (!modulos.ok) return;

    expect(modulos.value).toHaveLength(1);
    expect(modulos.value[0]?.moduloId).toBe("mod-estoque");
  });

  it("impede vincular módulo duplicado", async () => {
    const ctx = criarDeps();
    ctx.planosConsultaRepositorio.definirPlano("plano-core", true);
    ctx.modulosConsultaRepositorio.definirModulo("mod-estoque", true);

    const criada = await ctx.service.criarAssinatura({
      locatarioId: "loc-1",
      planoId: "plano-core",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    await ctx.service.vincularModuloNaAssinatura({
      assinaturaId: criada.value.assinatura.assinaturaId,
      moduloId: "mod-estoque",
    });

    const resultado = await ctx.service.vincularModuloNaAssinatura({
      assinaturaId: criada.value.assinatura.assinaturaId,
      moduloId: "mod-estoque",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe(
      "MODULO_ASSINATURA_JA_VINCULADO",
    );
  });

  it("desvincula módulo da assinatura", async () => {
    const ctx = criarDeps();
    ctx.planosConsultaRepositorio.definirPlano("plano-core", true);
    ctx.modulosConsultaRepositorio.definirModulo("mod-estoque", true);

    const criada = await ctx.service.criarAssinatura({
      locatarioId: "loc-1",
      planoId: "plano-core",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    await ctx.service.vincularModuloNaAssinatura({
      assinaturaId: criada.value.assinatura.assinaturaId,
      moduloId: "mod-estoque",
    });

    const resultado = await ctx.service.desvincularModuloDaAssinatura({
      assinaturaId: criada.value.assinatura.assinaturaId,
      moduloId: "mod-estoque",
    });

    expect(resultado.ok).toBe(true);

    const modulos =
      await ctx.assinaturasModulosRepositorio.listarModulosAtivosDaAssinatura(
        criada.value.assinatura.assinaturaId,
      );

    expect(modulos.ok).toBe(true);
    if (!modulos.ok) return;

    expect(modulos.value).toHaveLength(0);
  });

  it("resolve módulos grátis e módulos da assinatura para o locatário", async () => {
    const ctx = criarDeps();
    ctx.planosConsultaRepositorio.definirPlano("plano-core", true);
    ctx.modulosConsultaRepositorio.definirModuloGratis("mod-agenda");
    ctx.modulosConsultaRepositorio.definirModulo("mod-financeiro", true);

    const criada = await ctx.service.criarAssinatura({
      locatarioId: "loc-1",
      planoId: "plano-core",
    });
    expect(criada.ok).toBe(true);
    if (!criada.ok) return;

    await ctx.service.ativarAssinatura({
      assinaturaId: criada.value.assinatura.assinaturaId,
    });

    await ctx.service.vincularModuloNaAssinatura({
      assinaturaId: criada.value.assinatura.assinaturaId,
      moduloId: "mod-financeiro",
    });

    const resultado =
      await ctx.service.listarModulosHabilitadosLocatario({
        locatarioId: "loc-1",
      });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.modulos).toEqual(
      expect.arrayContaining([
        {
          moduloId: "mod-agenda",
          origem: "GRATUITO",
          gratuito: true,
        },
        {
          moduloId: "mod-financeiro",
          origem: "ASSINATURA",
          gratuito: false,
        },
      ]),
    );
  });
});
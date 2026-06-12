// packages/core/__tests__/usuarios/obterUsuario.test.ts

import { describe, expect, it } from "vitest";
import { createFnObterUsuario } from "../../src/usuarios/usecases/obterUsuario";
import { criarUsuarioTeste, criarUsuariosSimulacroRepositorio } from "./simulacros/usuariosSimulacroRepositorio";
import { criarPoliticaSegurancaUsuariosFake } from "./fake/politicaSegurancaUsuariosFake";

describe("#1 - createFnObterUsuario", () => {
  it("#1.1 - deve obter usuário ativo", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1", status: "ATIVO" }),
    ]);

    const usecase = createFnObterUsuario({ usuariosRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.usuario.usuarioId).toBe("usr-1");
  });

  it("#1.2 - deve falhar quando usuário não existe", async () => {
    const repo = criarUsuariosSimulacroRepositorio();
    const usecase = createFnObterUsuario({ usuariosRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-x" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("USUARIO_NAO_ENCONTRADO");
  });

  it("#1.3 - deve falhar quando usuário está excluído", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        excluidoEm: new Date("2026-01-10T00:00:00.000Z"),
      }),
    ]);

    const usecase = createFnObterUsuario({ usuariosRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("USUARIO_NAO_ENCONTRADO");
  });

  it("#1.4 - deve falhar quando usuário está inativo", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1", status: "INATIVO" }),
    ]);

    const usecase = createFnObterUsuario({ usuariosRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-1" });

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório", async () => {
    const repo = criarUsuariosSimulacroRepositorio();

    repo.simularFalha("buscarPorId");

    const usecase = createFnObterUsuario({ usuariosRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de obter usuário", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);
    const politica = criarPoliticaSegurancaUsuariosFake();

    const usecase = createFnObterUsuario({
      usuariosRepositorio: repo,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-1" });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "USUARIO_OBTER",
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar obtenção", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);
    const politica = criarPoliticaSegurancaUsuariosFake({ autorizado: false });

    const usecase = createFnObterUsuario({
      usuariosRepositorio: repo,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
  });
});
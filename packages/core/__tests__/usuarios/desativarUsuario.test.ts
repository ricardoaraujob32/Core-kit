// packages/core/__tests__/usuarios/desativarUsuario.test.ts

import { describe, expect, it } from "vitest";
import { criarUsuarioTeste, criarUsuariosSimulacroRepositorio } from "./simulacros/usuariosSimulacroRepositorio";
import { relogioTeste } from "./helpers/usuariosUsecaseTestUtils";
import { createFnDesativarUsuario } from "../../src/usuarios";
import { criarPoliticaSegurancaUsuariosFake } from "./fake/politicaSegurancaUsuariosFake";

describe("#1 - createFnDesativarUsuario", () => {
  it("#1.1 - deve desativar usuário ativo", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1", status: "ATIVO" }),
    ]);

    const usecase = createFnDesativarUsuario({
      usuariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.usuario.status).toBe("INATIVO");
      expect(resultado.value.usuario.atualizadoEm).toEqual(relogioTeste.agora());
    }
  });

  it("#1.2 - deve falhar quando usuário não existe", async () => {
    const repo = criarUsuariosSimulacroRepositorio();

    const usecase = createFnDesativarUsuario({
      usuariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-x" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("USUARIO_NAO_ENCONTRADO");
  });

  it("#1.3 - deve falhar quando usuário já está inativo", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1", status: "INATIVO" }),
    ]);

    const usecase = createFnDesativarUsuario({
      usuariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-1" });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve propagar falha do repositório ao atualizar", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1", status: "ATIVO" }),
    ]);

    repo.simularFalha("atualizar");

    const usecase = createFnDesativarUsuario({
      usuariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de desativar usuário", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1", status: "ATIVO" }),
    ]);
    const politica = criarPoliticaSegurancaUsuariosFake();

    const usecase = createFnDesativarUsuario({
      usuariosRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-1" });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "USUARIO_DESATIVAR",
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar desativação", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1", status: "ATIVO" }),
    ]);
    const politica = criarPoliticaSegurancaUsuariosFake({ autorizado: false });

    const usecase = createFnDesativarUsuario({
      usuariosRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({ locatarioId: "loc-1", usuarioId: "usr-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
  });
});
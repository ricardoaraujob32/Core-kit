// packages/core/__tests__/usuarios/listarUsuariosPorLocatario.test.ts

import { describe, expect, it } from "vitest";
import { createFnListarUsuariosPorLocatario } from "../../src/usuarios/usecases/listarUsuariosPorLocatario";
import { criarUsuarioTeste, criarUsuariosSimulacroRepositorio } from "./simulacros/usuariosSimulacroRepositorio";
import { criarPoliticaSegurancaUsuariosFake } from "./fake/politicaSegurancaUsuariosFake";

describe("#1 - createFnListarUsuariosPorLocatario", () => {
  it("#1.1 - deve listar usuários do locatário ordenados por nome", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-2", locatarioId: "loc-1", nome: "Beta" }),
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1", nome: "Alpha" }),
      criarUsuarioTeste({ usuarioId: "usr-3", locatarioId: "loc-2", nome: "Outro" }),
    ]);

    const usecase = createFnListarUsuariosPorLocatario({ usuariosRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.itens.map((item) => item.nome)).toEqual(["Alpha", "Beta"]);
    }
  });

  it("#1.2 - deve retornar lista vazia quando locatário não possui usuários", async () => {
    const repo = criarUsuariosSimulacroRepositorio();
    const usecase = createFnListarUsuariosPorLocatario({ usuariosRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.itens).toEqual([]);
  });

  it("#1.3 - deve propagar falha do repositório", async () => {
    const repo = criarUsuariosSimulacroRepositorio();

    repo.simularFalha("listarPorLocatario");

    const usecase = createFnListarUsuariosPorLocatario({ usuariosRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de listar usuários", async () => {
    const repo = criarUsuariosSimulacroRepositorio();
    const politica = criarPoliticaSegurancaUsuariosFake();

    const usecase = createFnListarUsuariosPorLocatario({
      usuariosRepositorio: repo,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "USUARIO_LISTAR",
      locatarioId: "loc-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar listagem", async () => {
    const repo = criarUsuariosSimulacroRepositorio();
    const politica = criarPoliticaSegurancaUsuariosFake({ autorizado: false });

    const usecase = createFnListarUsuariosPorLocatario({
      usuariosRepositorio: repo,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
  });
});
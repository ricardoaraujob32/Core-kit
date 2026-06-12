// packages/core/__tests__/usuarios/atualizarUsuario.test.ts

import { describe, expect, it } from "vitest";
import { createFnAtualizarUsuario } from "../../src/usuarios/usecases/atualizarUsuario";
import { criarUsuarioTeste, criarUsuariosSimulacroRepositorio } from "./simulacros/usuariosSimulacroRepositorio";
import { relogioTeste } from "./helpers/usuariosUsecaseTestUtils";
import { criarPoliticaSegurancaUsuariosFake } from "./fake/politicaSegurancaUsuariosFake";

describe("#1 - createFnAtualizarUsuario", () => {
  it("#1.1 - deve atualizar nome e e-mail do usuário", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnAtualizarUsuario({
      usuariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      nome: "Nome Atualizado",
      email: "novo@example.com",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.usuario.nome).toBe("Nome Atualizado");
      expect(resultado.value.usuario.email).toBe("novo@example.com");
      expect(resultado.value.usuario.atualizadoEm).toEqual(relogioTeste.agora());
    }
  });

  it("#1.2 - deve falhar quando usuário não existe", async () => {
    const repo = criarUsuariosSimulacroRepositorio();

    const usecase = createFnAtualizarUsuario({
      usuariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-x",
      nome: "Nome Atualizado",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("USUARIO_NAO_ENCONTRADO");
  });

  it("#1.3 - deve falhar quando nome é inválido", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnAtualizarUsuario({
      usuariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      nome: " ",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("USUARIO_INVALIDO");
  });

  it("#1.4 - deve falhar quando e-mail pertence a outro usuário do locatário", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        email: "usr1@example.com",
      }),
      criarUsuarioTeste({
        usuarioId: "usr-2",
        locatarioId: "loc-1",
        email: "usr2@example.com",
      }),
    ]);

    const usecase = createFnAtualizarUsuario({
      usuariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      email: "usr2@example.com",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("USUARIO_EMAIL_JA_EXISTE");
  });

  it("#1.5 - deve propagar falha do repositório ao atualizar", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);

    repo.simularFalha("atualizar");

    const usecase = createFnAtualizarUsuario({
      usuariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      nome: "Nome Atualizado",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de atualizar usuário", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);
    const politica = criarPoliticaSegurancaUsuariosFake();

    const usecase = createFnAtualizarUsuario({
      usuariosRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      nome: "Nome Atualizado",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "USUARIO_ATUALIZAR",
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar atualização", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);
    const politica = criarPoliticaSegurancaUsuariosFake({ autorizado: false });

    const usecase = createFnAtualizarUsuario({
      usuariosRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      nome: "Nome Atualizado",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
  });
});
// packages/core/__tests__/usuarios/criarUsuario.test.ts

import { describe, expect, it } from "vitest";
import { createFnCriarUsuario } from "../../src/usuarios/usecases/criarUsuario";
import { criarUsuarioTeste, criarUsuariosSimulacroRepositorio } from "./simulacros/usuariosSimulacroRepositorio";
import { criarIdPortaSequencial, criarInputCriarUsuario, relogioTeste } from "./helpers/usuariosUsecaseTestUtils";
import { criarPoliticaSegurancaUsuariosFake } from "./fake/politicaSegurancaUsuariosFake";

describe("#1 - createFnCriarUsuario", () => {
  it("#1.1 - deve criar usuário com dados válidos", async () => {
    const repo = criarUsuariosSimulacroRepositorio();

    const usecase = createFnCriarUsuario({
      usuariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["usr-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase(criarInputCriarUsuario());

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.usuarioId).toBe("usr-1");

    const salvo = await repo.buscarPorId({
      locatarioId: "loc-teste-1",
      usuarioId: "usr-1",
    });

    expect(salvo.ok).toBe(true);
    if (salvo.ok && salvo.value) {
      expect(salvo.value.email).toBe("usuario.novo@example.com");
      expect(salvo.value.nome).toBe("Usuário Novo");
      expect(salvo.value.status).toBe("ATIVO");
      expect(salvo.value.criadoEm).toEqual(relogioTeste.agora());
    }
  });

  it("#1.2 - deve falhar quando e-mail é inválido", async () => {
    const repo = criarUsuariosSimulacroRepositorio();

    const usecase = createFnCriarUsuario({
      usuariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["usr-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase(criarInputCriarUsuario({ email: "email-invalido" }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("USUARIO_INVALIDO");
  });

  it("#1.3 - deve falhar quando nome é inválido", async () => {
    const repo = criarUsuariosSimulacroRepositorio();

    const usecase = createFnCriarUsuario({
      usuariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["usr-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase(criarInputCriarUsuario({ nome: " " }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("USUARIO_INVALIDO");
  });

  it("#1.4 - deve falhar quando e-mail já existe no locatário", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({
        usuarioId: "usr-existente",
        locatarioId: "loc-teste-1",
        email: "usuario.novo@example.com",
      }),
    ]);

    const usecase = createFnCriarUsuario({
      usuariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["usr-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase(criarInputCriarUsuario());

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("USUARIO_EMAIL_JA_EXISTE");
  });

  it("#1.5 - deve propagar falha do repositório ao consultar e-mail", async () => {
    const repo = criarUsuariosSimulacroRepositorio();

    repo.simularFalha("buscarPorEmailNoLocatario");

    const usecase = createFnCriarUsuario({
      usuariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["usr-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase(criarInputCriarUsuario());

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de criar usuário", async () => {
    const repo = criarUsuariosSimulacroRepositorio();
    const politica = criarPoliticaSegurancaUsuariosFake();

    const usecase = createFnCriarUsuario({
      usuariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["usr-1"]),
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase(criarInputCriarUsuario());

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "USUARIO_CRIAR",
      locatarioId: "loc-teste-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar criação", async () => {
    const repo = criarUsuariosSimulacroRepositorio();
    const politica = criarPoliticaSegurancaUsuariosFake({ autorizado: false });

    const usecase = createFnCriarUsuario({
      usuariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["usr-1"]),
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase(criarInputCriarUsuario());

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
  });
});
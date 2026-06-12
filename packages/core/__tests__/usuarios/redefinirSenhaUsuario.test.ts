// packages/core/__tests__/usuarios/redefinirSenhaUsuario.test.ts

import { describe, expect, it } from "vitest";
import { createFnRedefinirSenhaUsuario } from "../../src/usuarios/usecases/redefinirSenhaUsuario";
import { criarUsuarioTeste, criarUsuariosSimulacroRepositorio } from "./simulacros/usuariosSimulacroRepositorio";
import { criarHashPortaTeste, relogioTeste } from "./helpers/usuariosUsecaseTestUtils";
import { criarPoliticaSegurancaUsuariosFake } from "./fake/politicaSegurancaUsuariosFake";

describe("#1 - createFnRedefinirSenhaUsuario", () => {
  it("#1.1 - deve redefinir senha sem exigir senha atual", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        senhaHash: "hash_antigo",
      }),
    ]);

    const usecase = createFnRedefinirSenhaUsuario({
      usuariosRepositorio: repo,
      hashPorta: criarHashPortaTeste({ hashGerado: "hash_redefinido" }),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      novaSenha: "NovaSenha123!",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.usuarioId).toBe("usr-1");

    const atualizado = await repo.buscarPorId({ locatarioId: "loc-1", usuarioId: "usr-1" });

    expect(atualizado.ok).toBe(true);
    if (atualizado.ok && atualizado.value) {
      expect(atualizado.value.senhaHash).toBe("hash_redefinido");
    }
  });

  it("#1.2 - deve falhar quando usuário não existe", async () => {
    const repo = criarUsuariosSimulacroRepositorio();

    const usecase = createFnRedefinirSenhaUsuario({
      usuariosRepositorio: repo,
      hashPorta: criarHashPortaTeste(),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-x",
      novaSenha: "NovaSenha123!",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("USUARIO_NAO_ENCONTRADO");
  });

  it("#1.3 - deve falhar quando nova senha é inválida", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnRedefinirSenhaUsuario({
      usuariosRepositorio: repo,
      hashPorta: criarHashPortaTeste(),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      novaSenha: "123",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve propagar falha do repositório ao atualizar senha", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);

    repo.simularFalha("atualizarSenha");

    const usecase = createFnRedefinirSenhaUsuario({
      usuariosRepositorio: repo,
      hashPorta: criarHashPortaTeste({ hashGerado: "hash_redefinido" }),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      novaSenha: "NovaSenha123!",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de redefinir senha", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);
    const politica = criarPoliticaSegurancaUsuariosFake();

    const usecase = createFnRedefinirSenhaUsuario({
      usuariosRepositorio: repo,
      hashPorta: criarHashPortaTeste({ hashGerado: "hash_redefinido" }),
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      novaSenha: "NovaSenha123!",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "USUARIO_REDEFINIR_SENHA",
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar redefinição de senha", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);
    const politica = criarPoliticaSegurancaUsuariosFake({ autorizado: false });

    const usecase = createFnRedefinirSenhaUsuario({
      usuariosRepositorio: repo,
      hashPorta: criarHashPortaTeste({ hashGerado: "hash_redefinido" }),
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      novaSenha: "NovaSenha123!",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
  });
});
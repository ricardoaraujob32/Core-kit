// packages/core/__tests__/usuarios/alterarSenhaUsuario.test.ts

import { describe, expect, it } from "vitest";
import { createFnAlterarSenhaUsuario } from "../../src/usuarios/usecases/alterarSenhaUsuario";
import { criarUsuarioTeste, criarUsuariosSimulacroRepositorio } from "./simulacros/usuariosSimulacroRepositorio";
import { criarHashPortaTeste, relogioTeste } from "./helpers/usuariosUsecaseTestUtils";
import { criarPoliticaSegurancaUsuariosFake } from "./fake/politicaSegurancaUsuariosFake";

describe("#1 - createFnAlterarSenhaUsuario", () => {
  it("#1.1 - deve alterar senha quando senha atual é válida", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        senhaHash: "hash_senha_atual",
      }),
    ]);

    const usecase = createFnAlterarSenhaUsuario({
      usuariosRepositorio: repo,
      hashPorta: criarHashPortaTeste({
        senhaAtualValida: true,
        hashGerado: "hash_senha_nova",
      }),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      senhaAtual: "SenhaAtual123!",
      novaSenha: "NovaSenha123!",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.usuarioId).toBe("usr-1");

    const atualizado = await repo.buscarPorId({ locatarioId: "loc-1", usuarioId: "usr-1" });

    expect(atualizado.ok).toBe(true);
    if (atualizado.ok && atualizado.value) {
      expect(atualizado.value.senhaHash).toBe("hash_senha_nova");
      expect(atualizado.value.atualizadoEm).toEqual(relogioTeste.agora());
    }
  });

  it("#1.2 - deve falhar quando usuário não existe", async () => {
    const repo = criarUsuariosSimulacroRepositorio();

    const usecase = createFnAlterarSenhaUsuario({
      usuariosRepositorio: repo,
      hashPorta: criarHashPortaTeste(),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-x",
      senhaAtual: "SenhaAtual123!",
      novaSenha: "NovaSenha123!",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("USUARIO_NAO_ENCONTRADO");
  });

  it("#1.3 - deve falhar quando senha atual é inválida", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnAlterarSenhaUsuario({
      usuariosRepositorio: repo,
      hashPorta: criarHashPortaTeste({ senhaAtualValida: false }),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      senhaAtual: "SenhaAtual123!",
      novaSenha: "NovaSenha123!",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve propagar falha de geração de hash", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);

    repo.simularFalha("atualizarSenha");

    const usecase = createFnAlterarSenhaUsuario({
      usuariosRepositorio: repo,
      hashPorta: criarHashPortaTeste({
        senhaAtualValida: true,
        hashGerado: "hash_senha_nova",
      }),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      senhaAtual: "SenhaAtual123!",
      novaSenha: "NovaSenha123!",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de alterar senha", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);
    const politica = criarPoliticaSegurancaUsuariosFake();

    const usecase = createFnAlterarSenhaUsuario({
      usuariosRepositorio: repo,
      hashPorta: criarHashPortaTeste({ senhaAtualValida: true }),
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      senhaAtual: "SenhaAtual123!",
      novaSenha: "NovaSenha123!",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "USUARIO_ALTERAR_SENHA",
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar alteração de senha", async () => {
    const repo = criarUsuariosSimulacroRepositorio([
      criarUsuarioTeste({ usuarioId: "usr-1", locatarioId: "loc-1" }),
    ]);
    const politica = criarPoliticaSegurancaUsuariosFake({ autorizado: false });

    const usecase = createFnAlterarSenhaUsuario({
      usuariosRepositorio: repo,
      hashPorta: criarHashPortaTeste({ senhaAtualValida: true }),
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      senhaAtual: "SenhaAtual123!",
      novaSenha: "NovaSenha123!",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
  });
});
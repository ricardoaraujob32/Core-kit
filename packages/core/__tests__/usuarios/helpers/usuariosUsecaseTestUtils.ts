// packages/core/__tests__/usuarios/helpers/usuariosUsecaseTestUtils.ts

import { createErroApp, HashPorta, wrapOk } from "../../../src/kernel";
import type { CriarUsuarioInput } from "../../../src/usuarios/tipos";


export const DATA_TESTE = new Date("2026-03-12T10:00:00.000Z");

export const relogioTeste = {
  agora: () => DATA_TESTE,
};

export function criarIdPortaSequencial(ids: string[]) {
  let indice = 0;

  return {
    gerarId: () => ids[indice++] ?? `id-teste-${indice}`,
  };
}

export function criarInputCriarUsuario(
  overrides: Partial<CriarUsuarioInput> = {},
): CriarUsuarioInput {
  return {
    locatarioId: "loc-teste-1",
    email: "usuario.novo@example.com",
    nome: "Usuário Novo",
    senhaHash: "hash_senha_nova_1234567890",
    ...overrides,
  };
}

export function criarHashPortaTeste(params: {
  senhaAtualValida?: boolean;
  falharComparacao?: boolean;
  falharGeracao?: boolean;
  hashGerado?: string;
} = {}): HashPorta {
  return {
    async comparar() {
      if (params.falharComparacao) {
        return false;
      }

      return params.senhaAtualValida ?? true;
    },

    async gerarHash() {
      if (params.falharGeracao) {
        return "hash_falha_simulada";
      }

      return params.hashGerado ?? "hash_senha_nova_gerada";
    },
  };
}

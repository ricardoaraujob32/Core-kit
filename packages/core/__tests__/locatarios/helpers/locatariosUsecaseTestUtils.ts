// packages/core/__tests__/locatarios/helpers/locatariosUsecaseTestUtils.ts

import type { CriarLocatarioInput } from "../../../src/locatarios/tipos";

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

export function criarInputCriarLocatario(
  overrides: Partial<CriarLocatarioInput> = {},
): CriarLocatarioInput {
  return {
    nome: "Empresa Teste",
    slug: "empresa-teste",
    documento: "12345678000199",
    email: "contato@empresa-teste.com",
    fusoHorario: "America/Sao_Paulo",
    configuracaoInicial: {
      modoTema: "SISTEMA",
      identidadeVisual: "Empresa Teste",
      corPrimaria: "#2563eb",
      corSecundaria: "#1e40af",
      corTerciaria: "#eff6ff",
      urlLogo: null,
      ativa: true,
      ...(overrides.configuracaoInicial ?? {}),
    },
    ...overrides,
  };
}

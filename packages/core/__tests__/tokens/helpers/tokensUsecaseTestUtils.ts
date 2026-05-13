// packages/core/__tests__/tokens/helpers/tokensUsecaseTestUtils.ts

export const DATA_TESTE = new Date("2026-03-12T10:00:00.000Z");
export const DATA_FUTURA = new Date("2026-03-13T10:00:00.000Z");
export const DATA_PASSADA = new Date("2026-03-11T10:00:00.000Z");

export const relogioTeste = {
  agora: () => DATA_TESTE,
};

export function criarIdPortaSequencial(ids: string[]) {
  let indice = 0;
  return {
    gerarId: () => ids[indice++] ?? `id-teste-${indice}`,
  };
}

// packages/core/__tests__/fornecedores/helpers/fornecedoresUsecaseTestUtils.ts

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

export function criarTransacaoFake() {
  let chamadas = 0;

  return {
    chamadas() {
      return chamadas;
    },

    async executar<T>(fn: () => Promise<T>): Promise<T> {
      chamadas += 1;
      return fn();
    },
  };
}

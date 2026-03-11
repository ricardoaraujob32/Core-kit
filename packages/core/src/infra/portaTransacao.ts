// packages/core/src/infra/portaTransacao.ts
export type TransacaoBD = {
  executar<T>(fn: () => Promise<T>): Promise<T>;
};

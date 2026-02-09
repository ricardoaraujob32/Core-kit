// packages/core/src/infra/portaTransacao.ts
export type Transacao = {
  executar<T>(fn: () => Promise<T>): Promise<T>;
};

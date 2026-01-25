// apps/api/src/di.ts
import type { UsuariosRepo } from "@core-kit/core";
import { createUsuariosRepoMemory } from "./infra/usuariosRepo.memory";

export type Deps = {
  usuariosRepo: UsuariosRepo;
  gerarId: () => string;
};

function gerarIdDefault(): string {
  // Node 18+ suporta; em alguns setups, pode variar.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyCrypto = globalThis.crypto as any;
  if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();

  // fallback simples (não criptográfico; ok p/ dev)
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function createDeps(): Deps {
  return {
    usuariosRepo: createUsuariosRepoMemory(),
    gerarId: gerarIdDefault,
  };
}

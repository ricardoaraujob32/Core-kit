/**
 * Arquivo: apps/api/src/dependencyInjection.ts
 * Finalidade: Montar e expor as dependências da aplicação (Injeção de Dependências).
 *
 * Observações:
 * - Este módulo conhece infraestrutura (Prisma/Postgres) e injeta nas rotas.
 * - Convenção: conjunto de dependências no plural ("DependenciasAplicacao").
 */

import type { RepositorioUsuarios } from "@core-kit/core";
import { criarRepositorioUsuariosPrisma } from "./infra/repositorioUsuariosPrisma";

export type DependenciasAplicacao = {
  repositorioUsuarios: RepositorioUsuarios;
  gerarIdentificadorUsuario: () => string;
};

function gerarIdentificadorUsuarioPadrao(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cryptoGlobal = globalThis.crypto as any;
  if (cryptoGlobal?.randomUUID) return cryptoGlobal.randomUUID();

  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function criarDependenciasAplicacao(): DependenciasAplicacao {
  return {
    repositorioUsuarios: criarRepositorioUsuariosPrisma(),
    gerarIdentificadorUsuario: gerarIdentificadorUsuarioPadrao,
  };
}

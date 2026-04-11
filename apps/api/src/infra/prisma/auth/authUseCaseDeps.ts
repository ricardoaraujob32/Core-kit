// apps/api/src/infra/prisma/auth/authUseCaseDeps.ts

import type { EventosSegurancaPorta, HashAuthPorta, IdPorta, JwtAuthPorta, RelogioPorta } from "@core-kit/core";
import type { AuthPrismaAdapters } from "./authPrismaAdapters";
import { env } from "../../../env";

/**
 * 
 */
type CreateAuthUseCaseDepsParams = {
  adapters: AuthPrismaAdapters;
  hashPorta: HashAuthPorta;
  jwtPorta: JwtAuthPorta;
  relogio: RelogioPorta;
  idPorta: IdPorta;
  eventos?: EventosSegurancaPorta;
};

/**
 * 
 */
export type AuthUseCaseDeps = {
  emitirSessaoDeps: {
    usuariosRepositorio: AuthPrismaAdapters["usuariosRepositorio"];
    locatariosRepositorio: AuthPrismaAdapters["locatariosRepositorio"];
    tokensPorta: AuthPrismaAdapters["tokensPorta"];
    hashPorta: HashAuthPorta;
    jwtPorta: JwtAuthPorta;
    relogio: RelogioPorta;
    idPorta: IdPorta;
    eventos?: EventosSegurancaPorta;
    issuer: env.JWT_ISSUER,
  };

  rotacionarRefreshDeps: {
    tokensPorta: AuthPrismaAdapters["tokensPorta"];
    jwtPorta: JwtAuthPorta;
    relogio: RelogioPorta;
    idPorta: IdPorta;
    eventos?: EventosSegurancaPorta;
    issuer: env.JWT_ISSUER,
  };

  validarSessaoDeps: {
    jwtPorta: JwtAuthPorta;
  };

  logoutDeps: {
    tokensPorta: AuthPrismaAdapters["tokensPorta"];
    relogio: RelogioPorta;
    eventos?: EventosSegurancaPorta;
  };

  resolverContextoAutorizadoDeps: {
    rbacPorta: AuthPrismaAdapters["rbacPorta"];
  };
};

/**
 * Monta os blocos de dependências dos casos de uso de auth.
 *
 * Responsabilidade:
 * - traduzir adapters concretos + portas técnicas em deps de use cases;
 * - não instanciar casos de uso;
 * - não abrir contexto SQL/RLS.
 *
 * @param params 
 * @returns 
 */
export function createAuthUseCaseDeps(params: CreateAuthUseCaseDepsParams): AuthUseCaseDeps {
  const { adapters, hashPorta, jwtPorta, relogio, idPorta, eventos } = params;

  const emitirSessaoDeps = {
    usuariosRepositorio: adapters.usuariosRepositorio,
    locatariosRepositorio: adapters.locatariosRepositorio,
    tokensPorta: adapters.tokensPorta,
    hashPorta,
    jwtPorta,
    relogio,
    idPorta,
    eventos,
  };

  const rotacionarRefreshDeps = {
    tokensPorta: adapters.tokensPorta,
    jwtPorta,
    relogio,
    idPorta,
    eventos,
  };

  const validarSessaoDeps = {
    jwtPorta,
  };

  const logoutDeps = {
    tokensPorta: adapters.tokensPorta,
    relogio,
    eventos,
  };

  const resolverContextoAutorizadoDeps = {
    rbacPorta: adapters.rbacPorta,
  };

  return {
    emitirSessaoDeps,
    rotacionarRefreshDeps,
    validarSessaoDeps,
    logoutDeps,
    resolverContextoAutorizadoDeps,
  };
}

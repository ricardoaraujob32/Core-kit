// apps/api/src/infra/prisma/auth/authUseCaseDeps.ts

import type { EventosSegurancaPorta, HashAuthPorta, IdPorta, JwtAuthPorta, RelogioPorta } from "@core-kit/core";
import { env, type Env } from "../../../env.js";
import type { AuthPrismaAdapters } from "./authPrismaAdapters.js";

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
    issuer: Env["JWT_ISSUER"];
  };

  emitirSessaoPlataformaDeps: {
    usuariosRepositorio: AuthPrismaAdapters["usuariosRepositorio"];
    hashPorta: HashAuthPorta;
    jwtPorta: JwtAuthPorta;
    relogio: RelogioPorta;
    idPorta: IdPorta;
    eventos?: EventosSegurancaPorta;
    issuer: Env["JWT_ISSUER"];
    tokensPorta: AuthPrismaAdapters["tokensPorta"];
    ttlAccessSegundos: number;
    ttlRefreshMs: number;
  };

  rotacionarRefreshDeps: {
    tokensPorta: AuthPrismaAdapters["tokensPorta"];
    jwtPorta: JwtAuthPorta;
    relogio: RelogioPorta;
    idPorta: IdPorta;
    eventos?: EventosSegurancaPorta;
    issuer: Env["JWT_ISSUER"];
  };

  rotacionarRefreshPlataformaDeps: {
    tokensPorta: AuthPrismaAdapters["tokensPorta"];
    jwtPorta: JwtAuthPorta;
    relogio: RelogioPorta;
    idPorta: IdPorta;
    eventos?: EventosSegurancaPorta;
    issuer: Env["JWT_ISSUER"];
  };

  validarSessaoDeps: {
    jwtPorta: JwtAuthPorta;
  };

  logoutDeps: {
    tokensPorta: AuthPrismaAdapters["tokensPorta"];
    relogio: RelogioPorta;
    eventos?: EventosSegurancaPorta;
  };

  logoutPlataformaDeps: {
    tokensPorta: AuthPrismaAdapters["tokensPorta"];
    relogio: RelogioPorta;
    eventos?: EventosSegurancaPorta;
  };

  resolverContextoAutorizadoDeps: {
    rbacPorta: AuthPrismaAdapters["rbacPorta"];
  };

  listarModulosHabilitadosDeps: {
    repositorio: AuthPrismaAdapters["modulosHabilitadosRepositorio"];
  };

  snapshotDeps: {
    autorizacaoRepositorio: AuthPrismaAdapters["autorizacaoRepositorio"];
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
    issuer: env.JWT_ISSUER,
  };

  const emitirSessaoPlataformaDeps = {
    usuariosRepositorio: adapters.usuariosRepositorio,
    hashPorta,
    jwtPorta,
    relogio,
    idPorta,
    eventos,
    tokensPorta: adapters.tokensPorta,
    issuer: env.JWT_ISSUER,
    ttlAccessSegundos: 300,
    ttlRefreshMs: 1000 * 60 * 60,
  };

  const rotacionarRefreshDeps = {
    tokensPorta: adapters.tokensPorta,
    jwtPorta,
    relogio,
    idPorta,
    eventos,
    issuer: env.JWT_ISSUER,
  };

  const rotacionarRefreshPlataformaDeps = {
    tokensPorta: adapters.tokensPorta,
    jwtPorta,
    relogio,
    idPorta,
    eventos,
    issuer: env.JWT_ISSUER,
  };

  const validarSessaoDeps = {
    jwtPorta,
  };

  const logoutDeps = {
    tokensPorta: adapters.tokensPorta,
    relogio,
    eventos,
  };

  const logoutPlataformaDeps = {
    tokensPorta: adapters.tokensPorta,
    relogio,
    eventos,
  };

  const resolverContextoAutorizadoDeps = {
    rbacPorta: adapters.rbacPorta,
  };

  const listarModulosHabilitadosDeps = {
    repositorio: adapters.modulosHabilitadosRepositorio,
  };

  const snapshotDeps = {
    autorizacaoRepositorio: adapters.autorizacaoRepositorio,
  };

  return {
    emitirSessaoDeps,
    emitirSessaoPlataformaDeps,
    rotacionarRefreshDeps,
    rotacionarRefreshPlataformaDeps,
    validarSessaoDeps,
    logoutDeps,
    logoutPlataformaDeps,
    resolverContextoAutorizadoDeps,
    listarModulosHabilitadosDeps,
    snapshotDeps,
  };
 };


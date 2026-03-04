// apps/api/src/dependencyInjection.ts

import { repositorioUsuariosPrisma } from "./infra/repositorioUsuariosPrisma";
import { auditoriaDb } from "./infra/auditoriaDb";


import { repositorioUsuariosPrisma } from "./infra/repositorioUsuariosPrisma";
import { auditoriaDb } from "./infra/auditoriaDb";

import type { AdminLocatariosDeps } from "./routes/admin/locatarios";
import { appError } from "@core-kit/core";

export const deps = {
  usuariosRepo: repositorioUsuariosPrisma,
  auditoria: auditoriaDb
};

export function criarDependenciasAplicacao() {
  return {
    usuariosRepo: repositorioUsuariosPrisma,
    auditoria: auditoriaDb,

    // dependências do painel superadmin
    adminLocatarios: criarAdminLocatariosDeps(),
  };
}

// Exemplo simples para DEV: stubs.
// Troque por implementações reais (Prisma) conforme você criar os repos.
function criarAdminLocatariosDeps(): AdminLocatariosDeps {
  return {
    locatarios: {
      async criar(input) {
        // TODO: ligar no core (usecase criarLocatario) + repo Prisma
        if (!input.nome?.trim()) {
          return { ok: false, error: appError("BAD_REQUEST", "nome é obrigatório.") };
        }
        if (!input.planoId?.trim()) {
          return { ok: false, error: appError("BAD_REQUEST", "planoId é obrigatório.") };
        }

        // retorno provisório (painel já consegue integrar UI)
        return { ok: true, value: { id: "loc-dev", ...input } };
      },

      async suspender(input) {
        if (!input.locatarioId?.trim()) {
          return { ok: false, error: appError("BAD_REQUEST", "locatarioId é obrigatório.") };
        }
        return { ok: true, value: undefined };
      },

      async mudarPlano(input) {
        if (!input.locatarioId?.trim()) {
          return { ok: false, error: appError("BAD_REQUEST", "locatarioId é obrigatório.") };
        }
        if (!input.planoId?.trim()) {
          return { ok: false, error: appError("BAD_REQUEST", "planoId é obrigatório.") };
        }
        return { ok: true, value: undefined };
      },
    },

    modulos: {
      async acrescentarAoLocatario(input) {
        if (!input.locatarioId?.trim()) {
          return { ok: false, error: appError("BAD_REQUEST", "locatarioId é obrigatório.") };
        }
        if (!input.moduloId?.trim()) {
          return { ok: false, error: appError("BAD_REQUEST", "moduloId é obrigatório.") };
        }
        return { ok: true, value: undefined };
      },
    },
  };
}


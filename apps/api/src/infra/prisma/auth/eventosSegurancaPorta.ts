// apps/api/src/infra/prisma/auth/eventosSegurancaPorta.ts

import type { EventosSegurancaPorta } from "@core-kit/core";
import { createFnRegistrarEventoAuditoriaLocatario, createFnRegistrarEventoAuditoriaPlataforma } from "@core-kit/core";
import type { PrismaDb } from "../tipos.js";
import { createAuditoriaLocatarioRepositorio } from "../auditoria/auditoriaAtivaLocatarioRepositorioPrisma.js";
import { createAuditoriaPlataformaRepositorio } from "../auditoria/auditoriaInternaRepositorioPrisma.js";

type RegistrarEventoSegurancaFn = NonNullable<EventosSegurancaPorta["registrarEvento"]>;

type EventoSegurancaTipo = Parameters<RegistrarEventoSegurancaFn>[0]["tipo"];

export function createEventosSegurancaPorta(db: PrismaDb): EventosSegurancaPorta {
  const registrarEventoAuditoriaLocatario =
    createFnRegistrarEventoAuditoriaLocatario({
      auditoriaLocatarioRepositorio: createAuditoriaLocatarioRepositorio(db),
    });

  const registrarEventoAuditoriaPlataforma =
    createFnRegistrarEventoAuditoriaPlataforma({
      auditoriaPlataformaRepositorio: createAuditoriaPlataformaRepositorio(db),
    });

  return {
    async registrarEvento(params) {
      const sucesso = params.tipo !== "auth.login.falha";

      /**
       * Fluxo tenant:
       * - login de usuário comum
       * - refresh
       * - logout
       *
       * Vai para auditoria_locatario.
       */
      if (params.locatarioId) {
        const resultado = await registrarEventoAuditoriaLocatario({
          locatarioId: params.locatarioId,
          usuarioId: params.usuarioId ?? null,
          evento: mapearEventoSegurancaLocatario(params.tipo),
          sucesso,
          origem: "API",
          agenteTipo: "SISTEMA",
          metadados: {
            contexto: {
              auth: {
                tipoOriginal: params.tipo,
                detalhes: params.detalhes ?? {},
                quando: params.quando.toISOString(),
              },
            },
          },
        });

        if (!resultado.ok) {
          console.error("[auth.eventosSeguranca.locatario.falha]", {
            tipo: params.tipo,
            usuarioId: params.usuarioId ?? null,
            locatarioId: params.locatarioId,
            erro: resultado.error,
          });
        }

        return;
      }

      /**
       * Fluxo plataforma:
       * - futuro login de superadmin / usuário plataforma
       * - eventos sem locatário
       *
       * Vai para auditoria_plataforma.
       */
      const resultado = await registrarEventoAuditoriaPlataforma({
        superadminUsuarioId: params.usuarioId ?? null,
        evento: mapearEventoSegurancaPlataforma(params.tipo),
        sucesso,
        origem: "API",
        agenteTipo: "SISTEMA",
        metadados: {
          contexto: {
            auth: {
              tipoOriginal: params.tipo,
              detalhes: params.detalhes ?? {},
              quando: params.quando.toISOString(),
            },
          },
        },
      });

      if (!resultado.ok) {
        console.error("[auth.eventosSeguranca.plataforma.falha]", {
          tipo: params.tipo,
          usuarioId: params.usuarioId ?? null,
          erro: resultado.error,
        });
      }
    },
  };
}

function mapearEventoSegurancaLocatario(tipo: EventoSegurancaTipo): string {
  switch (tipo) {
    case "auth.login.sucesso":
      return "auth.login.sucesso";
    case "auth.login.falha":
      return "auth.login.falha";
    case "auth.refresh":
      return "auth.refresh";
    case "auth.logout":
      return "auth.logout";
  }
}

function mapearEventoSegurancaPlataforma(tipo: EventoSegurancaTipo): string {
  switch (tipo) {
    case "auth.login.sucesso":
      return "plataforma.auth.login.sucesso";
    case "auth.login.falha":
      return "plataforma.auth.login.falha";
    case "auth.refresh":
      return "plataforma.auth.refresh";
    case "auth.logout":
      return "plataforma.auth.logout";
  }
}
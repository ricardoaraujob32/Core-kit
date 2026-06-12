// apps/api/src/infra/prisma/auth/assinatura/modulosHabilitadosRepositorioPrisma.ts

import type { LocatarioId, ModulosHabilitadosRepositorio, ModuloHabilitado, OrigemModuloHabilitado } from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../../tipos.js";
import { mapearErroInfra } from "../../erros.js"; 

/**
 * Normaliza a origem persistida no banco para o contrato canônico do Core.
 *
 * Observação:
 * - o schema pode armazenar a origem como texto livre;
 * - o Core espera apenas `SISTEMA | PLANO | MANUAL`;
 * - valores desconhecidos caem em `MANUAL` por ser o fallback mais conservador.
 *
 * @param origem Valor bruto persistido.
 * @returns Origem canônica do módulo habilitado.
 */
function normalizarOrigemModulo(origem: string | null | undefined): OrigemModuloHabilitado {
  switch ((origem ?? "").trim().toUpperCase()) {
    case "SISTEMA":
      return "SISTEMA";
    case "PLANO":
      return "PLANO";
    case "MANUAL":
      return "MANUAL";
    default:
      return "MANUAL";
  }
}

/**
 * Define prioridade determinística entre origens concorrentes para o mesmo módulo.
 *
 * Regra:
 * - `SISTEMA` vence `MANUAL`
 * - `MANUAL` vence `PLANO`
 *
 * @param origem Origem canônica.
 * @returns Peso numérico usado na deduplicação.
 */
function prioridadeOrigem(origem: OrigemModuloHabilitado): number {
  switch (origem) {
    case "SISTEMA":
      return 3;
    case "MANUAL":
      return 2;
    case "PLANO":
    default:
      return 1;
  }
}

/**
 * Cria o repositório Prisma de módulos habilitados.
 *
 * Estratégia adotada:
 * - `assinaturas` é a entidade principal da consulta;
 * - `modulos_assinatura` é tratada como entidade fraca de ligação;
 * - `modulos` fornece a identidade funcional (`codigo`) do módulo.
 *
 * Regras aplicadas:
 * - considera apenas assinaturas do locatário consultado;
 * - considera apenas assinaturas `ATIVA` e não excluídas;
 * - considera apenas vínculos `habilitado = true`;
 * - considera apenas módulos ativos;
 * - deduplica por `codigo` quando houver mais de uma assinatura habilitando
 *   o mesmo módulo.
 *
 * @param db Cliente Prisma raiz ou transacional.
 * @returns Implementação de `ModulosHabilitadosRepositorio`.
 */
export function createModulosHabilitadosRepositorio(db: PrismaDb): ModulosHabilitadosRepositorio {
  return {
    /**
     * 
     * @param locatarioId 
     * @returns 
     */
    async listarPorLocatario(locatarioId: LocatarioId) {
      try {
        const vinculos = await db.$queryRaw<{
          codigo: string;
          origem: string;
        }[]>`
          SELECT
            m.codigo,
            ml.origem::text AS origem
          FROM core.modulos_locatario ml
          JOIN core.modulos m
            ON m.modulo_id = ml.modulo_id
          WHERE ml.locatario_id = ${locatarioId}::uuid
            AND ml.habilitado = true
            AND m.ativo = true
          ORDER BY m.codigo ASC
        `;

        const porCodigo = new Map<string, ModuloHabilitado>();

        for (const vinculo of vinculos) {
          const codigo = vinculo.codigo.trim().toUpperCase();
          const origem = normalizarOrigemModulo(vinculo.origem);

          const atual = porCodigo.get(codigo);
          if (
            !atual ||
            prioridadeOrigem(origem) > prioridadeOrigem(atual.origem)
          ) {
            porCodigo.set(codigo, {
              codigo,
              origem,
            });
          }
        }

        return wrapOk(
          Array.from(porCodigo.values()).sort((a, b) =>
            a.codigo.localeCompare(b.codigo),
          ),
        );
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "modulos_habilitados",
          operacao: "infra.prisma.modulos.listarPorLocatario",
          detalhes: {
            locatarioId,
          },
        });
      }
    },
  };
}

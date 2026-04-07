//

import type {
  ErroApp,
  Locatario,
  LocatarioId,
  LocatariosRepositorio,
  LocatarioStatus,
  Result,
} from "@core-kit/core";
import { createErroApp, wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos";
import { mapearErroInfra } from "../erros";
import { status_locatario } from "@prisma/client";

/**
 * Mapeia uma linha persistida para a entidade de domínio `Locatario`.
 *
 * Observação:
 * - o contrato atual do Core expõe, no mínimo, `locatarioId`, `nome`,
 *   `status` e `criadoEm`;
 * - enquanto o contrato de locatários não for revisado, este adapter deve
 *   evitar inventar campos que o Core ainda não formalizou.
 */
function mapLocatario(row: {
  locatario_id: string;
  nome: string;
  status: string;
  criado_em: Date;
}): Locatario {
  return {
    locatarioId: row.locatario_id as LocatarioId,
    nome: row.nome,
    status: row.status as Locatario["status"],
    criadoEm: row.criado_em,
  } as Locatario;
}

function mapStatusLocatarioParaPersistencia(status: Locatario["status"]): status_locatario {
  switch (status) {
    case "ATIVO":
      return "ATIVO";
    case "SUSPENSO":
      return "SUSPENSO";
    case "EXCLUIDO":
      return "EXCLUIDO";
  }

  return "ATIVO"
}

/**
 * Repositório operacional de locatários.
 *
 * Responsabilidades:
 * - atender casos de uso do domínio de locatários;
 * - suportar leitura por identidade e listagem global;
 * - implementar o contrato atual do Core sem introduzir regra de domínio.
 *
 * Observação:
 * - o bloco de leitura é o mais importante para o E2E atual;
 * - escrita (`criar` / `atualizar`) permanece sujeita à revisão do contrato
 *   de locatários, já registrada no plano do projeto.
 */
export function createLocatariosRepositorio(db: PrismaDb): LocatariosRepositorio {
  return {
    /**
     * Persiste um novo locatário.
     *
     * Observação:
     * - esta implementação segue o contrato atual do Core;
     * - se o banco exigir campos adicionais obrigatórios sem default,
     *   o contrato do Core deverá ser revisado antes da evolução do CRUD.
     */
    async criar(params): Promise<Result<{ locatarioId: LocatarioId }, ErroApp>> {
      return createErroApp({
        codigo: "ERRO_INTERNO",
        mensagem:
          "Contrato de criação de locatário no Core está incompleto para o schema atual.",
        detalhes: {
          operacao: "locatarios.criar",
          motivo: "contrato_core_incompleto",
          camposObrigatoriosNaoMapeados: ["slug", "email"],
          locatarioId: params.locatarioId,
        },
      });
    },

    /**
     * Busca um locatário por identificador lógico.
     */
    async buscarPorId(
      params,
    ): Promise<Result<Locatario | null, ErroApp>> {
      try {
        const row = await db.locatarios.findFirst({
          where: {
            locatario_id: params.locatarioId,
          },
          select: {
            locatario_id: true,
            nome: true,
            status: true,
            criado_em: true,
          },
        });

        if (!row) {
          return wrapOk(null);
        }

        return wrapOk(mapLocatario(row));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "locatarios",
          operacao: "locatarios.buscarPorId",
          detalhes: {
            locatarioId: params.locatarioId,
          },
        });
      }
    },

    /**
     * Lista todos os locatários visíveis ao contexto da implementação.
     *
     * Observação:
     * - o controller atual usa esta operação para listagem global de plataforma.
     */
    async listar(): Promise<Result<Locatario[], ErroApp>> {
      try {
        const rows = await db.locatarios.findMany({
          orderBy: {
            locatario_id: "asc",
          },
          select: {
            locatario_id: true,
            nome: true,
            status: true,
            criado_em: true,
          },
        });

        return wrapOk(rows.map(mapLocatario));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "locatarios",
          operacao: "locatarios.listar",
        });
      }
    },

    /**
     * Atualiza integralmente o snapshot persistido do locatário.
     *
     * Observação:
     * - segue o contrato atual do Core;
     * - novas colunas obrigatórias devem ser incorporadas após a revisão do
     *   contrato de locatários.
     */
    async atualizar(locatario): Promise<Result<Locatario, ErroApp>> {
      try {
        await db.locatarios.update({
          where: {
            locatario_id: locatario.locatarioId,
          },
          data: {
            nome: locatario.nome,
            status: mapStatusLocatarioParaPersistencia(locatario.status),
          },
        });

        return wrapOk(locatario);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "locatarios",
          operacao: "locatarios.atualizar",
          detalhes: {
            locatarioId: locatario.locatarioId,
            nome: locatario.nome,
            status: locatario.status,
          },
        });
      }
    },
  };
}
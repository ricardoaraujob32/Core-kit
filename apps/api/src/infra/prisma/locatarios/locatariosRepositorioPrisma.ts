// apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts

import type { ErroApp, Locatario, LocatarioId, LocatariosRepositorio, Result } from "@core-kit/core";
import { createErroApp, wrapOk } from "@core-kit/core";
import { PrismaDb } from "../tipos";
import { erroInfraAuth } from "../auth/errosInfraAuth";
import { mapearErroInfra } from "../erros";

/**
 * Mapeia o status persistido do banco para o contrato do domínio de locatários.
 *
 * Banco:
 * - `ATIVO`
 * - `SUSPENSO`
 * - `EXCLUIDO`
 *
 * Domínio:
 * - `ATIVO`
 * - `SUSPENSO`
 * - `ENCERRADO`
 *
 * @param status Status persistido no banco.
 * @returns Status adaptado para o contrato do domínio.
 */
function mapStatusLocatarioDbParaDominio(status: "ATIVO" | "SUSPENSO" | "EXCLUIDO"): Locatario["status"] {
  switch (status) {
    case "ATIVO":
      return "ATIVO";
    case "SUSPENSO":
      return "SUSPENSO";
    case "EXCLUIDO":
      return "ENCERRADO";
  }
}

/**
 * Mapeia o status do domínio para o enum persistido no banco.
 *
 * @param status Status do domínio.
 * @returns Status persistido compatível com o banco.
 */
function mapStatusLocatarioDominioParaDb(status: Locatario["status"]): "ATIVO" | "SUSPENSO" | "EXCLUIDO" {
  switch (status) {
    case "ATIVO":
      return "ATIVO";
    case "SUSPENSO":
      return "SUSPENSO";
    case "ENCERRADO":
      return "EXCLUIDO";
  }
}

/**
 * Mapeia uma linha persistida para a entidade de domínio `Locatario`.
 *
 * Observação:
 * - o domínio atual expõe apenas `locatarioId`, `nome`, `status` e `criadoEm`;
 * - campos adicionais do banco continuam sendo detalhe de infraestrutura.
 *
 * @param row Linha retornada pelo Prisma.
 * @returns Entidade `Locatario` compatível com o Core.
 */
function mapLocatario(row: {
  locatario_id: string;
  nome: string;
  status: "ATIVO" | "SUSPENSO" | "EXCLUIDO";
  criado_em: Date;
}): Locatario {
  return {
    locatarioId: row.locatario_id as LocatarioId,
    nome: row.nome,
    status: mapStatusLocatarioDbParaDominio(row.status),
    criadoEm: row.criado_em,
  };
}

/**
 * Repositório operacional de locatários.
 *
 * Responsabilidades:
 * - atender casos de uso do domínio de locatários;
 * - suportar consulta por ID e listagem;
 * - permanecer separado da infraestrutura de autenticação.
 *
 * Observação importante:
 * - o contrato atual de criação do Core não fornece `slug` nem `email`,
 *   que são obrigatórios no banco;
 * - por isso, `criar(...)` não pode ser implementado fielmente sem revisão
 *   do contrato do domínio ou decisão explícita de defaults.
 */
export function createLocatariosRepositorio(
  db: PrismaDb,
): LocatariosRepositorio {
  return {
    /**
     * Persiste um novo locatário.
     *
     * Observação:
     * - o schema do banco exige `slug` e `email`;
     * - o contrato atual do Core não fornece esses campos;
     * - por isso, esta implementação falha de forma explícita até que o
     *   contrato seja ampliado.
     *
     * @param params Dados recebidos do caso de uso.
     * @returns `Err(ErroApp)` indicando incompatibilidade entre Core e schema.
     */
    async criar(params): Promise<Result<{ locatarioId: LocatarioId }, ErroApp>> {
      return createErroApp({
        codigo: "ERRO_INTERNO",
        mensagem:
          "Não é possível criar locatário com o contrato atual: faltam campos obrigatórios do schema persistido.",
        detalhes: {
          operacao: "locatarios.criar",
          locatarioId: params.locatarioId,
          camposObrigatoriosAusentes: ["slug", "email"],
        },
      });
    },

    /**
     * Busca um locatário por sua identidade lógica.
     *
     * @param params Identificador do locatário desejado.
     * @returns `Ok(locatario | null)` quando a consulta é concluída.
     */
    async buscarPorId(params): Promise<Result<Locatario | null, ErroApp>> {
      try {
        const row = await db.locatarios.findUnique({
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
     * Lista todos os locatários visíveis à implementação atual.
     *
     * @returns `Ok(locatarios)` quando a consulta é concluída.
     */
    async listar(): Promise<Result<Locatario[], ErroApp>> {
      try {
        const rows = await db.locatarios.findMany({
          orderBy: {
            criado_em: "asc",
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
     * Atualiza parcialmente a projeção de domínio do locatário.
     *
     * Observação:
     * - como o domínio atual não expõe `slug`, `email` nem `atualizadoEm`,
     *   esta implementação atualiza apenas os campos representados no domínio
     *   e materializa `atualizado_em` na infraestrutura.
     *
     * @param locatario Entidade de domínio já validada.
     * @returns `Ok(locatario)` quando a persistência é concluída.
     */
    async atualizar(locatario): Promise<Result<Locatario, ErroApp>> {
      try {
        await db.locatarios.update({
          where: {
            locatario_id: locatario.locatarioId,
          },
          data: {
            nome: locatario.nome,
            status: mapStatusLocatarioDominioParaDb(locatario.status),
            atualizado_em: new Date(),
          },
        });

        return wrapOk(locatario);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "locatarios",
          operacao: "locatarios.atualizar",
          detalhes: {
            locatarioId: locatario.locatarioId,
          },
        });
      }
    },
  };
}

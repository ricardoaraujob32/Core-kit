// apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts

import type { ErroApp, Locatario, LocatarioId, LocatariosRepositorio, LocatarioStatus, Result } from "@core-kit/core";
import { createErroApp, wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos";
import { mapearErroInfra } from "../erros";
import { status_locatario } from "@prisma/client";
import { ConfiguracaoLocatario, ModoTemaLocatario } from "packages/core/src/locatarios/tipos";

type ConfiguracaoLocatarioRow = {
  locatario_id: string;
  configuracao_id: string;
  modo_tema: string;
  identidade_visual: string;
  cor_primaria: string | null;
  cor_secundaria: string | null;
  cor_terciaria: string | null;
  url_logo: string | null;
  ativa: boolean;
  criado_em: Date;
  atualizado_em: Date;
};

type LocatarioRow = {
  locatario_id: string;
  nome: string;
  slug: string;
  documento: string | null;
  email: string;
  fuso_horario: string;
  status: status_locatario;
  excluido_em: Date | null;
  motivo_exclusao: string | null;
  suspenso_em: Date | null;
  motivo_suspensao: string | null;
  reativado_em: Date | null;
  motivo_reativacao: string | null;
  criado_em: Date;
  atualizado_em: Date;
  configuracoes_locatario: ConfiguracaoLocatarioRow[];
};

const configuracaoSelect = {
  locatario_id: true,
  configuracao_id: true,
  modo_tema: true,
  identidade_visual: true,
  cor_primaria: true,
  cor_secundaria: true,
  cor_terciaria: true,
  url_logo: true,
  ativa: true,
  criado_em: true,
  atualizado_em: true,
} as const;

const locatarioSelect = {
  locatario_id: true,
  nome: true,
  slug: true,
  documento: true,
  email: true,
  fuso_horario: true,
  status: true,
  excluido_em: true,
  motivo_exclusao: true,
  suspenso_em: true,
  motivo_suspensao: true,
  reativado_em: true,
  motivo_reativacao: true,
  criado_em: true,
  atualizado_em: true,
  configuracoes_locatario: {
    select: configuracaoSelect,
    orderBy: {
      criado_em: "asc" as const,
    },
  },
} as const;

function mapModoTema(valor: string): ModoTemaLocatario {
  switch (valor.toUpperCase()) {
    case "SISTEMA":
      return "SISTEMA";
    case "CLARO":
      return "CLARO";
    case "ESCURO":
      return "ESCURO";
    default:
      return "SISTEMA";
  }
}


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

function mapConfiguracao(row: ConfiguracaoLocatarioRow): ConfiguracaoLocatario {
  return {
    locatarioId: row.locatario_id as LocatarioId,
    configuracaoId: row.configuracao_id,
    modoTema: mapModoTema(row.modo_tema),
    identidadeVisual: row.identidade_visual,
    corPrimaria: row.cor_primaria,
    corSecundaria: row.cor_secundaria,
    corTerciaria: row.cor_terciaria,
    urlLogo: row.url_logo,
    ativa: row.ativa,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
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
     * 
     * @param params 
     * @returns 
     */
    async criar(params) {
      try {
        await db.locatarios.create({
          data: {
            locatario_id: params.locatarioId,
            nome: params.nome,
            slug: params.slug,
            documento: params.documento,
            email: params.email.toLowerCase(),
            fuso_horario: params.fusoHorario,
            status: mapStatusLocatarioParaPersistencia(params.status),
            criado_em: params.criadoEm,
            atualizado_em: params.atualizadoEm,

            configuracoes_locatario: {
              create: {
                configuracao_id: params.configuracaoInicial.configuracaoId,
                modo_tema: params.configuracaoInicial.modoTema,
                identidade_visual: params.configuracaoInicial.identidadeVisual,
                cor_primaria: params.configuracaoInicial.corPrimaria,
                cor_secundaria: params.configuracaoInicial.corSecundaria,
                cor_terciaria: params.configuracaoInicial.corTerciaria,
                url_logo: params.configuracaoInicial.urlLogo,
                ativa: params.configuracaoInicial.ativa,
                criado_em: params.configuracaoInicial.criadoEm,
                atualizado_em: params.configuracaoInicial.atualizadoEm,
              },
            },
          },
        });

        return wrapOk({ locatarioId: params.locatarioId });
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "locatarios",
          operacao: "infra.locatarios.criar",
          detalhes: {
            locatarioId: params.locatarioId,
            slug: params.slug,
            email: params.email.toLowerCase(),
            configuracaoId: params.configuracaoInicial.configuracaoId,
          },
        });
      }
    },

    /**
     * 
     * @param param0 
     * @returns 
     */
    async buscarPorId(params) {
      try {
        const row = await db.locatarios.findFirst({
          where: { locatario_id: params.locatarioId },
          select: locatarioSelect,
        });

        return wrapOk(row ? mapLocatario(row) : null);
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "locatarios",
          operacao: "infra.locatarios.buscarPorId",
          detalhes: {
            locatarioId: params.locatarioId,
          },
        });
      }
    },

    /**
     * 
     * @param param0 
     * @returns 
     */
    async buscarPorSlug(params) {
      try {
        const row = await db.locatarios.findFirst({
          where: { slug: params.slug, },
          select: locatarioSelect,
        });

        return wrapOk(row ? mapLocatario(row) : null);
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "locatarios",
          operacao: "infra.locatarios.buscarPorSlug",
          detalhes: {
            slug: params.slug,
          },
        });
      }
    },

    /**
     * 
     * @param param0 
     * @returns 
     */
    async buscarPorEmail(params) {
      try {
        const row = await db.locatarios.findFirst({
          where: { email: params.emailNormalizado.toLowerCase() },
          select: locatarioSelect,
        });

        return wrapOk(row ? mapLocatario(row) : null);
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "locatarios",
          operacao: "infra.locatarios.buscarPorEmail",
          detalhes: {
            emailNormalizado: params.emailNormalizado.toLowerCase(),
          },
        });
      }
    },
    /**
     * 
     * @returns 
     */
    async listar() {
      try {
        const rows = await db.locatarios.findMany({
          select: locatarioSelect,
          orderBy: { criado_em: "asc" },
        });

        return wrapOk(rows.map(mapLocatario));
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "locatarios",
          operacao: "infra.locatarios.listar",
        });
      }
    },
    /**
     * 
     * @param locatario 
     * @returns 
     */
    async atualizar(locatario) {
      try {
        await db.locatarios.update({
          where: { locatario_id: locatario.locatarioId },
          data: {
            nome: locatario.nome,
            slug: locatario.slug,
            documento: locatario.documento,
            email: locatario.email.toLowerCase(),
            fuso_horario: locatario.fusoHorario,
            status: mapStatusLocatarioParaPersistencia(locatario.status),
            excluido_em: locatario.excluidoEm,
            motivo_exclusao: locatario.motivoExclusao,
            suspenso_em: locatario.suspensoEm,
            motivo_suspensao: locatario.motivoSuspensao,
            reativado_em: locatario.reativadoEm,
            motivo_reativacao: locatario.motivoReativacao,
            atualizado_em: locatario.atualizadoEm,
          },
        });

        return wrapOk(locatario);
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "locatarios",
          operacao: "infra.locatarios.atualizar",
          detalhes: {
            locatarioId: locatario.locatarioId,
            slug: locatario.slug,
            email: locatario.email.toLowerCase(),
          },
        });
      }
    },

    /**
     * 
     * @param param0 
     * @returns 
     */
    async listarConfiguracoes(params) {
      try {
        const rows = await db.configuracoes_locatario.findMany({
          where: { locatario_id: params.locatarioId },
          orderBy: { criado_em: "asc" },
        });

        return wrapOk(rows.map(mapConfiguracao));
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "configuracoes_locatario",
          operacao: "infra.locatarios.listarConfiguracoes",
          detalhes: {
            locatarioId: params.locatarioId,
          },
        });
      }
    },

    /**
     * 
     * @param param0 
     * @returns 
     */
    async obterConfiguracaoAtiva(params) {
      try {
        const row = await db.configuracoes_locatario.findFirst({
          where: {
            locatario_id: params.locatarioId,
            ativa: true,
          },
        });

        return wrapOk(row ? mapConfiguracao(row) : null);
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "configuracoes_locatario",
          operacao: "infra.locatarios.obterConfiguracaoAtiva",
          detalhes: {
            locatarioId: params.locatarioId,
          },
        });
      }
    },

    /**
     * 
     * @param param0 
     * @returns 
     */
    async buscarConfiguracaoPorId(params) {
      try {
        const row = await db.configuracoes_locatario.findFirst({
          where: {
            locatario_id: params.locatarioId,
            configuracao_id: params.configuracaoId,
          },
        });

        return wrapOk(row ? mapConfiguracao(row) : null);
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "configuracoes_locatario",
          operacao: "infra.locatarios.buscarConfiguracaoPorId",
          detalhes: {
            locatarioId: params.locatarioId,
            configuracaoId: params.configuracaoId
          },
        });
      }
    },

    /**
     * 
     * @param params 
     * @returns 
     */
    async criarConfiguracao(params) {
      try {
        await db.configuracoes_locatario.create({
          data: {
            locatario_id: params.locatarioId,
            configuracao_id: params.configuracaoId,
            modo_tema: params.modoTema,
            identidade_visual: params.identidadeVisual,
            cor_primaria: params.corPrimaria,
            cor_secundaria: params.corSecundaria,
            cor_terciaria: params.corTerciaria,
            url_logo: params.urlLogo,
            ativa: params.ativa,
            criado_em: params.criadoEm,
            atualizado_em: params.atualizadoEm,
          },
        });

        return wrapOk({ configuracaoId: params.configuracaoId });
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "configuracoes_locatario",
          operacao: "infra.locatarios.criarConfiguracao",
          detalhes: {
            locatarioId: params.locatarioId,
            configuracaoId: params.configuracaoId,
            ativa: params.ativa,
            criado_em: params.criadoEm,
            atualizado_em: params.atualizadoEm,
          },
        });
      }
    },

    /**
     * 
     * @param config 
     * @returns 
     */
    async atualizarConfiguracao(config) {
      try {
        await db.configuracoes_locatario.update({
          where: {
            locatario_id_configuracao_id: {
              locatario_id: config.locatarioId,
              configuracao_id: config.configuracaoId,
            },
          },
          data: {
            modo_tema: config.modoTema,
            identidade_visual: config.identidadeVisual,
            cor_primaria: config.corPrimaria,
            cor_secundaria: config.corSecundaria,
            cor_terciaria: config.corTerciaria,
            url_logo: config.urlLogo,
            ativa: config.ativa,
            atualizado_em: config.atualizadoEm,
          },
        });

        return wrapOk(config);
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "configuracoes_locatario",
          operacao: "infra.locatarios.atualizarConfiguracao",
          detalhes: {
            locatarioId: config.locatarioId,
            configuracaoId: config.configuracaoId,
            ativa: config.ativa,
            criado_em: config.criadoEm,
            atualizado_em: config.atualizadoEm,
          },
        });
      }
    },

    /**
     * 
     * @param param0 
     * @returns 
     */
    async desativarConfiguracoesAtivas(params) {
      try {
        await db.configuracoes_locatario.updateMany({
          where: {
            locatario_id: params.locatarioId,
            ativa: true,
          },
          data: {
            ativa: false,
            atualizado_em: params.atualizadoEm,
          },
        });

        return wrapOk(undefined);
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "configuracoes_locatario",
          operacao: "infra.locatarios.desativarConfiguracoesAtivas",
          detalhes: {
            locatarioId: params.locatarioId,
            atualizado_em: params.atualizadoEm,
          },
        });
      }
    },
  };
}

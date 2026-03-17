import type { PrismaClient } from "@prisma/client";
import { wrapOk } from "../../kernel/ROPHelpers";
import type { ErroApp } from "../../kernel/erros";
import type { Result } from "../../kernel/result";
import type {
  Assinatura,
  AssinaturaId,
  ModuloConsulta,
  ModuloDaAssinatura,
  ModuloGratis,
  ModuloId,
  PlanoConsulta,
  PlanoId,
  RegistrarAssinaturaParams,
  RegistrarModuloDaAssinaturaParams,
} from "../tipos";
import type {
  AssinaturasModulosRepositorio,
  AssinaturasRepositorio,
  ModulosConsultaRepositorio,
  PlanosConsultaRepositorio,
} from "../portasRepositorio";

/**
 * Observação importante:
 * - Ajuste os nomes dos models Prisma abaixo para o schema real do projeto.
 * - Este arquivo assume models como:
 *   prisma.assinatura
 *   prisma.moduloAssinatura
 *   prisma.modulo
 *   prisma.plano
 *
 * Se os nomes reais forem diferentes, adapte aqui.
 */

function mapAssinatura(row: {
  assinatura_id: string;
  locatario_id: string;
  plano_id: string;
  status: string;
  iniciada_em: Date;
  encerrada_em: Date | null;
  criada_em: Date;
  atualizada_em: Date;
}): Assinatura {
  return {
    assinaturaId: row.assinatura_id,
    locatarioId: row.locatario_id,
    planoId: row.plano_id,
    status: row.status as Assinatura["status"],
    iniciadaEm: row.iniciada_em,
    encerradaEm: row.encerrada_em,
    criadaEm: row.criada_em,
    atualizadaEm: row.atualizada_em,
  };
}

function mapModuloDaAssinatura(row: {
  assinatura_id: string;
  modulo_id: string;
  habilitado_em: Date;
  desabilitado_em: Date | null;
}): ModuloDaAssinatura {
  return {
    assinaturaId: row.assinatura_id,
    moduloId: row.modulo_id,
    habilitadoEm: row.habilitado_em,
    desabilitadoEm: row.desabilitado_em,
  };
}

export class AssinaturasRepositorioPrisma
  implements
    AssinaturasRepositorio,
    AssinaturasModulosRepositorio,
    PlanosConsultaRepositorio,
    ModulosConsultaRepositorio
{
  constructor(private readonly prisma: PrismaClient) {}

  async criarAssinatura(
    params: RegistrarAssinaturaParams,
  ): Promise<Result<Assinatura, ErroApp>> {
    const row = await this.prisma.$queryRawUnsafe<any>(`
      INSERT INTO assinaturas (
        assinatura_id,
        locatario_id,
        plano_id,
        status,
        iniciada_em,
        encerrada_em,
        criada_em,
        atualizada_em
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING
        assinatura_id,
        locatario_id,
        plano_id,
        status,
        iniciada_em,
        encerrada_em,
        criada_em,
        atualizada_em
    `,
      params.assinaturaId,
      params.locatarioId,
      params.planoId,
      params.status,
      params.iniciadaEm,
      params.encerradaEm ?? null,
      params.criadaEm,
      params.atualizadaEm,
    );

    return wrapOk(mapAssinatura(row[0]));
  }

  async atualizarAssinatura(
    assinatura: Assinatura,
  ): Promise<Result<Assinatura, ErroApp>> {
    const row = await this.prisma.$queryRawUnsafe<any>(`
      UPDATE assinaturas
         SET status = $2,
             iniciada_em = $3,
             encerrada_em = $4,
             atualizada_em = $5
       WHERE assinatura_id = $1
       RETURNING
         assinatura_id,
         locatario_id,
         plano_id,
         status,
         iniciada_em,
         encerrada_em,
         criada_em,
         atualizada_em
    `,
      assinatura.assinaturaId,
      assinatura.status,
      assinatura.iniciadaEm,
      assinatura.encerradaEm,
      assinatura.atualizadaEm,
    );

    return wrapOk(mapAssinatura(row[0]));
  }

  async buscarPorId(
    assinaturaId: AssinaturaId,
  ): Promise<Result<Assinatura | null, ErroApp>> {
    const rows = await this.prisma.$queryRawUnsafe<any>(`
      SELECT
        assinatura_id,
        locatario_id,
        plano_id,
        status,
        iniciada_em,
        encerrada_em,
        criada_em,
        atualizada_em
      FROM assinaturas
      WHERE assinatura_id = $1
      LIMIT 1
    `, assinaturaId);

    return wrapOk(rows[0] ? mapAssinatura(rows[0]) : null);
  }

  async buscarAssinaturaOperacionalPorLocatario(
    locatarioId: string,
  ): Promise<Result<Assinatura | null, ErroApp>> {
    const rows = await this.prisma.$queryRawUnsafe<any>(`
      SELECT
        assinatura_id,
        locatario_id,
        plano_id,
        status,
        iniciada_em,
        encerrada_em,
        criada_em,
        atualizada_em
      FROM assinaturas
      WHERE locatario_id = $1
        AND status IN ('RASCUNHO', 'ATIVA', 'SUSPENSA')
      ORDER BY criada_em DESC
      LIMIT 1
    `, locatarioId);

    return wrapOk(rows[0] ? mapAssinatura(rows[0]) : null);
  }

  async buscarAssinaturaAtivaPorLocatario(
    locatarioId: string,
  ): Promise<Result<Assinatura | null, ErroApp>> {
    const rows = await this.prisma.$queryRawUnsafe<any>(`
      SELECT
        assinatura_id,
        locatario_id,
        plano_id,
        status,
        iniciada_em,
        encerrada_em,
        criada_em,
        atualizada_em
      FROM assinaturas
      WHERE locatario_id = $1
        AND status = 'ATIVA'
      ORDER BY criada_em DESC
      LIMIT 1
    `, locatarioId);

    return wrapOk(rows[0] ? mapAssinatura(rows[0]) : null);
  }

  async vincularModulo(
    params: RegistrarModuloDaAssinaturaParams,
  ): Promise<Result<ModuloDaAssinatura, ErroApp>> {
    const rows = await this.prisma.$queryRawUnsafe<any>(`
      INSERT INTO modulos_assinatura (
        assinatura_id,
        modulo_id,
        habilitado_em,
        desabilitado_em
      )
      VALUES ($1,$2,$3,$4)
      RETURNING
        assinatura_id,
        modulo_id,
        habilitado_em,
        desabilitado_em
    `,
      params.assinaturaId,
      params.moduloId,
      params.habilitadoEm,
      params.desabilitadoEm ?? null,
    );

    return wrapOk(mapModuloDaAssinatura(rows[0]));
  }

  async desvincularModulo(
    assinaturaId: AssinaturaId,
    moduloId: ModuloId,
    desabilitadoEm: Date,
  ): Promise<Result<void, ErroApp>> {
    await this.prisma.$executeRawUnsafe(`
      UPDATE modulos_assinatura
         SET desabilitado_em = $3
       WHERE assinatura_id = $1
         AND modulo_id = $2
         AND desabilitado_em IS NULL
    `,
      assinaturaId,
      moduloId,
      desabilitadoEm,
    );

    return wrapOk(undefined);
  }

  async buscarModuloVinculado(
    assinaturaId: AssinaturaId,
    moduloId: ModuloId,
  ): Promise<Result<ModuloDaAssinatura | null, ErroApp>> {
    const rows = await this.prisma.$queryRawUnsafe<any>(`
      SELECT
        assinatura_id,
        modulo_id,
        habilitado_em,
        desabilitado_em
      FROM modulos_assinatura
      WHERE assinatura_id = $1
        AND modulo_id = $2
      ORDER BY habilitado_em DESC
      LIMIT 1
    `, assinaturaId, moduloId);

    return wrapOk(rows[0] ? mapModuloDaAssinatura(rows[0]) : null);
  }

  async listarModulosAtivosDaAssinatura(
    assinaturaId: AssinaturaId,
  ): Promise<Result<ModuloDaAssinatura[], ErroApp>> {
    const rows = await this.prisma.$queryRawUnsafe<any>(`
      SELECT
        assinatura_id,
        modulo_id,
        habilitado_em,
        desabilitado_em
      FROM modulos_assinatura
      WHERE assinatura_id = $1
        AND desabilitado_em IS NULL
      ORDER BY modulo_id ASC
    `, assinaturaId);

    return wrapOk(rows.map(mapModuloDaAssinatura));
  }

  async validarPlanoAtivo(
    planoId: PlanoId,
  ): Promise<Result<PlanoConsulta | null, ErroApp>> {
    const rows = await this.prisma.$queryRawUnsafe<any>(`
      SELECT plano_id, ativo
      FROM planos
      WHERE plano_id = $1
      LIMIT 1
    `, planoId);

    const row = rows[0];
    return wrapOk(
      row
        ? {
            planoId: row.plano_id,
            ativo: Boolean(row.ativo),
          }
        : null,
    );
  }

  async validarModuloAtivo(
    moduloId: ModuloId,
  ): Promise<Result<ModuloConsulta | null, ErroApp>> {
    const rows = await this.prisma.$queryRawUnsafe<any>(`
      SELECT modulo_id, ativo
      FROM modulos
      WHERE modulo_id = $1
      LIMIT 1
    `, moduloId);

    const row = rows[0];
    return wrapOk(
      row
        ? {
            moduloId: row.modulo_id,
            ativo: Boolean(row.ativo),
          }
        : null,
    );
  }

  async listarModulosGratis(): Promise<Result<ModuloGratis[], ErroApp>> {
    const rows = await this.prisma.$queryRawUnsafe<any>(`
      SELECT modulo_id
      FROM modulos
      WHERE gratuito = TRUE
      ORDER BY modulo_id ASC
    `);

    return wrapOk(
      rows.map((row: { modulo_id: string }) => ({
        moduloId: row.modulo_id,
      })),
    );
  }
}
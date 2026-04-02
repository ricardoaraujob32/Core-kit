// apps/api/src/modules/auditoria/auditoria.dto.ts

import { z } from "zod";

/**
 * Enum canônico de categorias de auditoria.
 */
export const categoriaAuditoriaSchema = z.enum([
  "OPERACAO",
  "SEGURANCA",
  "ERRO",
  "COMPLIANCE",
]);

/**
 * Querystring suportada para listagem de auditoria do locatário.
 */
export const listarAuditoriaLocatarioQuerySchema = z.object({
  evento: z.string().trim().min(1).optional(),
  eventoPrefixo: z.string().trim().min(1).optional(),
  categoria: categoriaAuditoriaSchema.optional(),
  sucesso: z.enum(["true", "false"]).optional(),
  erroCodigo: z.string().trim().min(1).optional(),
  entidadeNome: z.string().trim().min(1).optional(),
  entidadeTipo: z.string().trim().min(1).optional(),
  entidadeId: z.string().trim().min(1).optional(),
  usuarioId: z.string().trim().min(1).optional(),
  origem: z.string().trim().min(1).optional(),
  requisicaoId: z.string().trim().min(1).optional(),
  agenteTipo: z.string().trim().min(1).optional(),
  textoLivre: z.string().trim().min(1).optional(),
  cursor: z.string().trim().min(1).optional(),
  limite: z.string().trim().min(1).optional(),
  criadoDe: z.string().trim().min(1).optional(),
  criadoAte: z.string().trim().min(1).optional(),
});

/**
 * Querystring suportada para listagem de auditoria da plataforma.
 */
export const listarAuditoriaPlataformaQuerySchema =
  listarAuditoriaLocatarioQuerySchema.extend({
    locatarioAlvoId: z.string().trim().min(1).optional(),
  });

export type ListarAuditoriaLocatarioQuery = z.infer<
  typeof listarAuditoriaLocatarioQuerySchema
>;

export type ListarAuditoriaPlataformaQuery = z.infer<
  typeof listarAuditoriaPlataformaQuerySchema
>;

/**
 * Faz parse seguro da query de auditoria do locatário.
 *
 * @param input Querystring bruta.
 * @returns Resultado do parse com Zod.
 */
export function parseListarAuditoriaLocatarioQuery(input: unknown) {
  return listarAuditoriaLocatarioQuerySchema.safeParse(input);
}

/**
 * Faz parse seguro da query de auditoria da plataforma.
 *
 * @param input Querystring bruta.
 * @returns Resultado do parse com Zod.
 */
export function parseListarAuditoriaPlataformaQuery(input: unknown) {
  return listarAuditoriaPlataformaQuerySchema.safeParse(input);
}

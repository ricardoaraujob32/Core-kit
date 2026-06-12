// apps/api/src/modules/auditoria/auditoria.dto.ts

import { z } from "zod";

function parseDateOpcional(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const date = new Date(String(value));
  return date;
}

export const listarAuditoriaQuerySchema = z.object({
  evento: z.string().trim().optional(),
  eventoPrefixo: z.string().trim().optional(),
  sucesso: z
    .enum(["true", "false"])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === "true",
    ),
  erroCodigo: z.string().trim().optional(),
  entidadeNome: z.string().trim().optional(),
  entidadeTipo: z.string().trim().optional(),
  entidadeId: z.string().trim().optional(),
  usuarioId: z.string().trim().optional(),
  origem: z.string().trim().optional(),
  requisicaoId: z.string().trim().optional(),
  agenteTipo: z.string().trim().optional(),
  criadoDe: z.preprocess(parseDateOpcional, z.date().optional()),
  criadoAte: z.preprocess(parseDateOpcional, z.date().optional()),
  textoLivre: z.string().trim().optional(),
  cursor: z.string().trim().optional(),
  limite: z.coerce.number().int().positive().max(500).optional(),
});

export type ListarAuditoriaQueryDto = z.infer<
  typeof listarAuditoriaQuerySchema
>;

export function parseListarAuditoriaQuery(input: unknown) {
  return listarAuditoriaQuerySchema.safeParse(input);
}

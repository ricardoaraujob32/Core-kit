// apps/api/src/modules/assinaturas/assinaturaModulos.dto.ts

import { z } from "zod";

export const vincularModuloAssinaturaBodySchema = z.object({
  moduloId: z.string().uuid(),
});

export type VincularModuloAssinaturaBodyDto = z.infer<
  typeof vincularModuloAssinaturaBodySchema
>;

export const moduloIdParamsSchema = z.object({
  moduloId: z.string().uuid(),
});

export type ModuloIdParamsDto = z.infer<typeof moduloIdParamsSchema>;

export function parseVincularModuloAssinaturaBody(input: unknown) {
  return vincularModuloAssinaturaBodySchema.safeParse(input);
}

export function parseModuloIdParams(input: unknown) {
  return moduloIdParamsSchema.safeParse(input);
}

// apps/api/src/modules/financeiro/financeiro.dto.ts

import { z } from "zod";

const dateQuerySchema = z
  .string()
  .trim()
  .min(1)
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  });

export const financeiroQuerySchema = z.object({
  status: z.enum(["ABERTO", "LIQUIDADO", "TODOS"]).optional(),
  vencidas: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((value) => value === "true"),
  dataInicial: dateQuerySchema,
  dataFinal: dateQuerySchema,
  cursor: z.string().trim().min(1).optional(),
  limite: z.coerce.number().int().min(1).max(100).optional(),
});

export type FinanceiroQueryDto = z.infer<typeof financeiroQuerySchema>;

export function parseFinanceiroQuery(input: unknown) {
  return financeiroQuerySchema.safeParse(input ?? {});
}

// apps/api/src/modules/produtos/produtos.dto.ts

import { z } from "zod";

export const produtoIdParamsSchema = z.object({
  id: z.string().trim().min(1, "O parâmetro 'id' é obrigatório."),
});

export const criarProdutoBodySchema = z.object({
  sku: z.string().trim().optional().nullable(),
  nome: z.string().trim().min(2, "O campo 'nome' deve ter ao menos 2 caracteres."),
  descricao: z.string().trim().optional().nullable(),
  unidade: z.string().trim().min(1).default("UN"),
  tipo: z.enum(["PRODUTO", "SERVICO"]),
  precoVenda: z.coerce.number().nonnegative().default(0),
  custoReferencia: z.coerce.number().nonnegative().optional().nullable(),
  ativo: z.boolean().default(true),
});

export const atualizarProdutoBodySchema = z
  .object({
    sku: z.string().trim().optional().nullable(),
    nome: z.string().trim().min(2).optional(),
    descricao: z.string().trim().optional().nullable(),
    unidade: z.string().trim().min(1).optional(),
    tipo: z.enum(["PRODUTO", "SERVICO"]).optional(),
    precoVenda: z.coerce.number().nonnegative().optional(),
    custoReferencia: z.coerce.number().nonnegative().optional().nullable(),
    ativo: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.sku !== undefined ||
      data.nome !== undefined ||
      data.descricao !== undefined ||
      data.unidade !== undefined ||
      data.tipo !== undefined ||
      data.precoVenda !== undefined ||
      data.custoReferencia !== undefined ||
      data.ativo !== undefined,
    { message: "Informe ao menos um campo para atualização." },
  );

export type ProdutoIdParamsDto = z.infer<typeof produtoIdParamsSchema>;
export type CriarProdutoBodyDto = z.infer<typeof criarProdutoBodySchema>;
export type AtualizarProdutoBodyDto = z.infer<typeof atualizarProdutoBodySchema>;

export function parseProdutoIdParams(input: unknown) {
  return produtoIdParamsSchema.safeParse(input);
}

export function parseCriarProdutoBody(input: unknown) {
  return criarProdutoBodySchema.safeParse(input);
}

export function parseAtualizarProdutoBody(input: unknown) {
  return atualizarProdutoBodySchema.safeParse(input);
}
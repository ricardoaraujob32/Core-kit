// apps/api/src/modules/vendas/vendas.dto.ts

import { z } from "zod";

export const transacaoIdParamsSchema = z.object({
  id: z.string().trim().min(1, "O parâmetro 'id' é obrigatório."),
});

export const itemTransacaoIdParamsSchema = z.object({
  id: z.string().trim().min(1, "O parâmetro 'id' é obrigatório."),
  itemId: z.string().trim().min(1, "O parâmetro 'itemId' é obrigatório."),
});

export const criarVendaBodySchema = z.object({
  clienteId: z.string().trim().optional().nullable(),
  observacao: z.string().trim().optional().nullable(),
});

export const criarCompraBodySchema = z.object({
  fornecedorId: z.string().trim().optional().nullable(),
  observacao: z.string().trim().optional().nullable(),
});

export const adicionarItemTransacaoBodySchema = z.object({
  produtoId: z.string().trim().min(1, "O campo 'produtoId' é obrigatório."),
  estoqueId: z.string().trim().optional().nullable(),
  descricao: z.string().trim().optional().nullable(),
  quantidade: z.coerce.number().positive("Quantidade deve ser maior que zero."),
  valorUnitario: z.coerce.number().nonnegative("Valor unitário não pode ser negativo.").optional(),
  valorDesconto: z.coerce.number().nonnegative().default(0),
});

export const atualizarItemTransacaoBodySchema = z
  .object({
    descricao: z.string().trim().optional().nullable(),
    quantidade: z.coerce.number().positive().optional(),
    valorUnitario: z.coerce.number().nonnegative().optional(),
    valorDesconto: z.coerce.number().nonnegative().optional(),
    valorAcrescimo: z.coerce.number().nonnegative().optional(),
  })
  .refine(
    (data) =>
      data.descricao !== undefined ||
      data.quantidade !== undefined ||
      data.valorUnitario !== undefined ||
      data.valorDesconto !== undefined ||
      data.valorAcrescimo !== undefined,
    { message: "Informe ao menos um campo para atualização do item." },
  );

export const cancelarTransacaoBodySchema = z.object({
  motivo: z.string().trim().optional().nullable(),
});



export type TransacaoIdParamsDto = z.infer<typeof transacaoIdParamsSchema>;
export type ItemTransacaoIdParamsDto = z.infer<typeof itemTransacaoIdParamsSchema>;
export type CriarVendaBodyDto = z.infer<typeof criarVendaBodySchema>;
export type CriarCompraBodyDto = z.infer<typeof criarCompraBodySchema>;
export type AdicionarItemTransacaoBodyDto = z.infer<typeof adicionarItemTransacaoBodySchema>;
export type AtualizarItemTransacaoBodyDto = z.infer<typeof atualizarItemTransacaoBodySchema>;
export type CancelarTransacaoBodyDto = z.infer<typeof cancelarTransacaoBodySchema>;

export function parseTransacaoIdParams(input: unknown) {
  return transacaoIdParamsSchema.safeParse(input);
}

export function parseItemTransacaoIdParams(input: unknown) {
  return itemTransacaoIdParamsSchema.safeParse(input);
}

export function parseCriarVendaBody(input: unknown) {
  return criarVendaBodySchema.safeParse(input);
}

export function parseCriarCompraBody(input: unknown) {
  return criarCompraBodySchema.safeParse(input);
}

export function parseAdicionarItemTransacaoBody(input: unknown) {
  return adicionarItemTransacaoBodySchema.safeParse(input);
}

export function parseAtualizarItemTransacaoBody(input: unknown) {
  return atualizarItemTransacaoBodySchema.safeParse(input);
}

export function parseCancelarTransacaoBody(input: unknown) {
  return cancelarTransacaoBodySchema.safeParse(input);
}
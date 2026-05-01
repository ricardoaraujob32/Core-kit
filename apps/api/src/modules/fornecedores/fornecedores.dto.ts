// apps/api/src/modules/fornecedores/fornecedores.dto.ts

import { z } from "zod";

export const fornecedorIdParamsSchema = z.object({
  id: z.string().trim().min(1, "O parâmetro 'id' é obrigatório."),
});

export const criarFornecedorBodySchema = z.object({
  nome: z.string().trim().min(2, "O campo 'nome' deve ter ao menos 2 caracteres."),
  documento: z.string().trim().optional().nullable(),
  email: z.string().trim().email("E-mail inválido.").optional().nullable(),
  telefone: z.string().trim().optional().nullable(),
});

export const atualizarFornecedorBodySchema = z
  .object({
    nome: z.string().trim().min(2).optional(),
    documento: z.string().trim().optional().nullable(),
    email: z.string().trim().email("E-mail inválido.").optional().nullable(),
    telefone: z.string().trim().optional().nullable(),
  })
  .refine(
    (data) =>
      data.nome !== undefined ||
      data.documento !== undefined ||
      data.email !== undefined ||
      data.telefone !== undefined,
    { message: "Informe ao menos um campo para atualização." },
  );

export type FornecedorIdParamsDto = z.infer<typeof fornecedorIdParamsSchema>;
export type CriarFornecedorBodyDto = z.infer<typeof criarFornecedorBodySchema>;
export type AtualizarFornecedorBodyDto = z.infer<typeof atualizarFornecedorBodySchema>;

export function parseFornecedorIdParams(input: unknown) {
  return fornecedorIdParamsSchema.safeParse(input);
}

export function parseCriarFornecedorBody(input: unknown) {
  return criarFornecedorBodySchema.safeParse(input);
}

export function parseAtualizarFornecedorBody(input: unknown) {
  return atualizarFornecedorBodySchema.safeParse(input);
}
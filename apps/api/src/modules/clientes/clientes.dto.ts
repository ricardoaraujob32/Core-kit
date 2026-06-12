// apps/api/src/modules/clientes/clientes.dto.ts

import { z } from "zod";

export const clienteIdParamsSchema = z.object({
  id: z.string().trim().min(1, "O parâmetro 'id' é obrigatório."),
});

export const criarClienteBodySchema = z.object({
  nome: z.string().trim().min(2, "O campo 'nome' deve ter ao menos 2 caracteres."),
  documento: z.string().trim().optional().nullable(),
  email: z.string().trim().email("E-mail inválido.").optional().nullable(),
  telefone: z.string().trim().optional().nullable(),
});

export const atualizarClienteBodySchema = z
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

export type ClienteIdParamsDto = z.infer<typeof clienteIdParamsSchema>;
export type CriarClienteBodyDto = z.infer<typeof criarClienteBodySchema>;
export type AtualizarClienteBodyDto = z.infer<typeof atualizarClienteBodySchema>;

export function parseClienteIdParams(input: unknown) {
  return clienteIdParamsSchema.safeParse(input);
}

export function parseCriarClienteBody(input: unknown) {
  return criarClienteBodySchema.safeParse(input);
}

export function parseAtualizarClienteBody(input: unknown) {
  return atualizarClienteBodySchema.safeParse(input);
}